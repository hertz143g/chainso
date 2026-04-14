"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import useRelationshipSettings from "@/hooks/useRelationshipSettings";

type SunPhase = "dawn" | "day" | "sunset" | "night";

function getSunPhase(date = new Date()): SunPhase {
  const hour = date.getHours();

  if (hour >= 5 && hour < 10) return "dawn";
  if (hour >= 10 && hour < 17) return "day";
  if (hour >= 17 && hour < 22) return "sunset";
  return "night";
}

function FloatingDots() {
  return (
    <div className="theme-floating-dots">
      {Array.from({ length: 9 }).map((_, index) => (
        <span
          key={index}
          style={
            {
              "--bubble-index": index,
              "--bubble-left": `${10 + index * 9}%`,
              "--bubble-size": `${9 + (index % 3) * 5}px`,
              "--bubble-duration": `${9 + index * 0.75}s`,
              "--bubble-delay": `${index * -0.7}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function ThemeAtmosphere({ theme }: { theme: string }) {
  if (theme === "linen") {
    return (
      <div className="theme-ornaments theme-ornaments-linen" aria-hidden="true">
        <span className="theme-blob linen-blob-a" />
        <span className="theme-blob linen-blob-b" />
        <span className="theme-sheen linen-sheen" />
      </div>
    );
  }

  if (theme === "sage") {
    return (
      <div className="theme-ornaments theme-ornaments-sage" aria-hidden="true">
        <span className="theme-blob sage-blob-a" />
        <span className="theme-blob sage-blob-b" />
        <span className="theme-sheen sage-sheen" />
      </div>
    );
  }

  if (theme === "aurora") {
    return (
      <div className="theme-ornaments theme-ornaments-aurora" aria-hidden="true">
        <span className="theme-blob aurora-blob-a" />
        <span className="theme-blob aurora-blob-b" />
        <span className="theme-blob aurora-blob-c" />
        <span className="theme-sheen aurora-sheen" />
        <FloatingDots />
      </div>
    );
  }

  return (
    <div className="theme-ornaments theme-ornaments-sun" aria-hidden="true">
      <span className="theme-blob sun-cycle-orb" />
      <span className="theme-blob sun-cycle-haze sun-cycle-haze-a" />
      <span className="theme-blob sun-cycle-haze sun-cycle-haze-b" />
    </div>
  );
}

export default function AppFrame({ children }: { children: ReactNode }) {
  const settings = useRelationshipSettings();
  const [phase, setPhase] = useState<SunPhase>("day");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setPhase(getSunPhase()));
    const timer = window.setInterval(() => setPhase(getSunPhase()), 60_000);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <main className={`app-frame app-theme-${settings.theme} app-phase-${phase}`}>
      <ThemeAtmosphere theme={settings.theme} />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[360px] overflow-x-hidden px-4 py-6">
        {children}
      </div>
    </main>
  );
}
