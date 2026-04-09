import type { CSSProperties } from "react";
import type { WidgetColorMode } from "@/lib/relationship";
import { getWidgetPalette } from "@/lib/widgetAppearance";

const BLOB_LAYOUTS: CSSProperties[] = [
  { top: "-12%", left: "-14%", width: "58%", height: "46%" },
  { top: "8%", right: "-10%", width: "42%", height: "38%" },
  { bottom: "-18%", left: "10%", width: "52%", height: "44%" },
  { bottom: "6%", right: "-8%", width: "38%", height: "34%" },
];

export default function AtmosphericBackdrop({
  accentColor,
  colorMode,
  accentPalette,
  imageDataUrl,
}: {
  accentColor: string;
  colorMode: WidgetColorMode;
  accentPalette?: string[];
  imageDataUrl?: string;
}) {
  const colors = getWidgetPalette({ accentColor, colorMode, accentPalette });

  return (
    <div className="absolute inset-0 overflow-hidden">
      {BLOB_LAYOUTS.map((style, index) => (
        <div
          key={`${colors[index % colors.length]}-${index}`}
          className="absolute rounded-full blur-3xl"
          style={{
            ...style,
            backgroundColor: colors[index % colors.length],
            opacity: colorMode === "adaptive" ? 0.72 : 0.4,
          }}
        />
      ))}

      {colorMode === "adaptive" && imageDataUrl ? (
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
          style={{ backgroundImage: `url(${imageDataUrl})`, opacity: 0.18 }}
        />
      ) : null}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,15,33,0.08),rgba(8,15,33,0.42))]" />
    </div>
  );
}
