import { streamText, stepCountIs, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { shopifyTools } from "@/lib/ai/tools";
import { getSession } from "@/lib/auth";

export const maxDuration = 120;

const MAX_MESSAGES = 50;

const chatRateLimit = new Map<string, { count: number; windowStart: number }>();
const MAX_REQUESTS_PER_MINUTE = 10;

export async function POST(req: Request) {
  // Verify authentication
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Rate limiting per user
  const now = Date.now();
  const userLimit = chatRateLimit.get(session.id);
  if (userLimit && now - userLimit.windowStart < 60_000) {
    if (userLimit.count >= MAX_REQUESTS_PER_MINUTE) {
      return new Response("Rate limit exceeded. Please wait a moment.", { status: 429 });
    }
    userLimit.count++;
  } else {
    chatRateLimit.set(session.id, { count: 1, windowStart: now });
  }

  const body = await req.json();

  if (!body.messages || !Array.isArray(body.messages)) {
    return new Response("Invalid request format", { status: 400 });
  }

  if (body.messages.length > MAX_MESSAGES) {
    return new Response("Too many messages", { status: 400 });
  }

  try {
    const { messages } = body;
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: openai("gpt-5.4"),
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      tools: shopifyTools,
      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[chat] Stream error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
