import { streamText, stepCountIs, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { shopifyTools } from "@/lib/ai/tools";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openai("gpt-5.4"),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools: shopifyTools,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
