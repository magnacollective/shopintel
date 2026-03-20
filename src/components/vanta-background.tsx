"use client";

import { useEffect, useRef, useCallback } from "react";
import Script from "next/script";

export function VantaBackground({ children }: { children: React.ReactNode }) {
  const vantaRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const effectRef = useRef<any>(null);
  const scriptsLoaded = useRef(0);

  const initVanta = useCallback(() => {
    if (scriptsLoaded.current < 2 || !vantaRef.current || effectRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const VANTA = (window as any).VANTA;
    if (!VANTA) return;

    effectRef.current = VANTA.DOTS({
      el: vantaRef.current,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color: 0x6366f1,
      color2: 0x7c3aed,
      backgroundColor: 0x0a0a0a,
      size: 1.5,
      spacing: 15.0,
      showLines: false,
    });
  }, []);

  const handleScriptLoad = useCallback(() => {
    scriptsLoaded.current += 1;
    initVanta();
  }, [initVanta]);

  useEffect(() => {
    return () => {
      if (effectRef.current) {
        effectRef.current.destroy();
        effectRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.dots.min.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      <div ref={vantaRef} className="min-h-screen w-full relative">
        <div className="relative z-10">{children}</div>
      </div>
    </>
  );
}
