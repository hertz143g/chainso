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

function AquariumBubbles() {
  return (
    <div className="theme-aquarium-bubbles">
      {Array.from({ length: 11 }).map((_, index) => (
        <span
          key={index}
          style={
            {
              "--bubble-index": index,
              "--bubble-left": `${8 + index * 8}%`,
              "--bubble-size": `${10 + (index % 4) * 5}px`,
              "--bubble-duration": `${8 + index * 0.9}s`,
              "--bubble-delay": `${index * -0.85}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function ThemeAtmosphere({ theme }: { theme: string }) {
  if (theme === "kitty") {
    return (
      <div className="theme-ornaments theme-ornaments-kitty" aria-hidden="true">
        <span className="kitty-bow kitty-bow-a" />
        <span className="kitty-bow kitty-bow-b" />
        <span className="kitty-paw kitty-paw-a" />
        <span className="kitty-paw kitty-paw-b" />
      </div>
    );
  }

  if (theme === "aquarium") {
    return (
      <div className="theme-ornaments theme-ornaments-aquarium" aria-hidden="true">
        <span className="aquarium-liquid aquarium-liquid-a" />
        <span className="aquarium-liquid aquarium-liquid-b" />
        <AquariumBubbles />
      </div>
    );
  }

  return (
    <div className="theme-ornaments theme-ornaments-sun" aria-hidden="true">
      <span className="sun-cycle-orb" />
      <span className="sun-cycle-haze sun-cycle-haze-a" />
      <span className="sun-cycle-haze sun-cycle-haze-b" />
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
