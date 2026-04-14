"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import useRelationshipSettings from "@/hooks/useRelationshipSettings";
import type { CustomThemeSettings } from "@/lib/relationship";

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

function MatrixRain() {
  const columns = [
    "0101",
    "CHAIN",
    "1010",
    "<>{}",
    "SO",
    "0110",
    "LOVE",
    "1001",
    "[]()",
    "0011",
    "SYNC",
    "1110",
    "{}",
    "0100",
    "HEART",
    "1011",
  ];

  return (
    <div className="theme-matrix-rain">
      {columns.map((text, index) => (
        <span
          key={`${text}-${index}`}
          style={
            {
              "--matrix-left": `${index * 6.6}%`,
              "--matrix-duration": `${6.5 + (index % 5) * 1.1}s`,
              "--matrix-delay": `${index * -0.55}s`,
            } as CSSProperties
          }
        >
          {text}
        </span>
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

  if (theme === "neo") {
    return (
      <div className="theme-ornaments theme-ornaments-neo" aria-hidden="true">
        <MatrixRain />
        <span className="theme-blob neo-blob-a" />
        <span className="theme-blob neo-blob-b" />
      </div>
    );
  }

  if (theme === "noir" || theme === "ember" || theme === "custom") {
    return (
      <div className="theme-ornaments theme-ornaments-dark" aria-hidden="true">
        <span className={`theme-blob ${theme}-blob-a`} />
        <span className={`theme-blob ${theme}-blob-b`} />
        <span className={`theme-sheen ${theme}-sheen`} />
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

function buildCustomThemeStyle(theme: CustomThemeSettings): CSSProperties {
  const background = theme.backgroundColor;
  const surface = theme.surfaceColor;
  const primary = theme.primaryColor;
  const text = theme.textColor;

  return {
    "--theme-surface": `color-mix(in srgb, ${surface} 82%, transparent)`,
    "--theme-surface-soft": `color-mix(in srgb, ${primary} 14%, transparent)`,
    "--theme-widget-bg": `color-mix(in srgb, ${surface} 84%, transparent)`,
    "--theme-widget-border": `color-mix(in srgb, ${text} 20%, transparent)`,
    "--theme-chip-bg": `color-mix(in srgb, ${surface} 60%, transparent)`,
    "--theme-glass-bg": `color-mix(in srgb, ${surface} 68%, transparent)`,
    "--theme-photo-frame": `color-mix(in srgb, ${text} 14%, transparent)`,
    "--theme-photo-inner": `color-mix(in srgb, ${background} 34%, transparent)`,
    "--theme-control-bg": `color-mix(in srgb, ${text} 10%, transparent)`,
    "--theme-control-active-bg": `color-mix(in srgb, ${primary} 22%, transparent)`,
    "--theme-control-border": `color-mix(in srgb, ${text} 18%, transparent)`,
    "--theme-control-active-border": `color-mix(in srgb, ${primary} 64%, transparent)`,
    "--theme-progress-track": `color-mix(in srgb, ${text} 70%, transparent)`,
    "--theme-dashed-border": `color-mix(in srgb, ${text} 32%, transparent)`,
    "--theme-dashed-bg": `color-mix(in srgb, ${surface} 38%, transparent)`,
    "--theme-avatar-bg": `color-mix(in srgb, ${text} 82%, ${surface})`,
    "--theme-overlay-bg": `color-mix(in srgb, ${background} 64%, transparent)`,
    "--theme-image-overlay-soft": `color-mix(in srgb, ${background} 12%, transparent)`,
    "--theme-image-overlay-mid": `color-mix(in srgb, ${background} 28%, transparent)`,
    "--theme-image-overlay-strong": `color-mix(in srgb, ${background} 72%, transparent)`,
    "--theme-text": text,
    "--theme-text-muted": `color-mix(in srgb, ${text} 68%, transparent)`,
    "--theme-primary": primary,
    "--theme-on-primary": background,
    "--theme-ring": primary,
    "--theme-input-bg": `color-mix(in srgb, ${text} 92%, ${surface})`,
    "--theme-input-text": background,
    "--theme-card-border": `color-mix(in srgb, ${text} 16%, transparent)`,
    "--theme-shadow": "rgba(0, 0, 0, 0.26)",
    background: `
      radial-gradient(circle at 20% 8%, color-mix(in srgb, ${primary} 24%, transparent), transparent min(42vw, 230px)),
      radial-gradient(circle at 86% 18%, color-mix(in srgb, ${text} 12%, transparent), transparent min(50vw, 280px)),
      linear-gradient(180deg, ${background} 0%, color-mix(in srgb, ${background} 82%, ${surface}) 58%, ${surface} 100%)
    `,
  } as CSSProperties;
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
    <main
      className={`app-frame app-theme-${settings.theme} app-phase-${phase}`}
      style={settings.theme === "custom" ? buildCustomThemeStyle(settings.customTheme) : undefined}
    >
      <ThemeAtmosphere theme={settings.theme} />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[360px] overflow-x-hidden px-4 py-6">
        {children}
      </div>
    </main>
  );
}
