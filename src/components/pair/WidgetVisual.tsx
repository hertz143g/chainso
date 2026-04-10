import type { CSSProperties, ReactNode } from "react";
import AtmosphericBackdrop from "@/components/pair/AtmosphericBackdrop";
import type {
  RelationshipWidget,
  WidgetColorMode,
  WidgetType,
} from "@/lib/relationship";

export type WidgetVisualData = {
  type: WidgetType;
  title: string;
  dateISO?: string;
  subtitle?: string;
  note?: string;
  artist?: string;
  imageDataUrl?: string;
  accentColor: string;
  colorMode: WidgetColorMode;
  accentPalette?: string[];
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function clampStyle(lines: number): CSSProperties {
  return {
    display: "-webkit-box",
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: lines,
  };
}

function formatWidgetDate(dateISO: string, variant: "short" | "long") {
  const [year, month, day] = dateISO.split("-").map(Number);
  const date = new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: variant === "short" ? "short" : "long",
    year: variant === "long" ? "numeric" : undefined,
  }).format(date);
}

function widgetLabel(type: WidgetType) {
  if (type === "memory") return "Момент";
  if (type === "track") return "Трек";
  return "Событие";
}

function fallbackTitle(type: WidgetType) {
  if (type === "memory") return "Название момента";
  if (type === "track") return "Название трека";
  return "Название события";
}

function ColorBackdrop({
  widget,
  imageOverlay = false,
}: {
  widget: WidgetVisualData;
  imageOverlay?: boolean;
}) {
  return (
    <div className={cx("absolute inset-0", imageOverlay && "opacity-45 mix-blend-screen")}>
      <AtmosphericBackdrop
        accentColor={widget.accentColor}
        colorMode={widget.colorMode}
        accentPalette={widget.accentPalette}
        imageDataUrl={imageOverlay ? undefined : widget.imageDataUrl}
      />
    </div>
  );
}

function FullImageLayer({
  imageDataUrl,
  alt,
  variant,
}: {
  imageDataUrl?: string;
  alt: string;
  variant: "memory" | "event";
}) {
  if (!imageDataUrl) return null;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageDataUrl}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className={cx(
          "absolute inset-0",
          variant === "memory"
            ? "bg-[linear-gradient(180deg,rgba(5,10,22,0.1)_0%,rgba(5,10,22,0.16)_42%,rgba(5,10,22,0.74)_100%)]"
            : "bg-[linear-gradient(180deg,rgba(5,10,22,0.12)_0%,rgba(5,10,22,0.2)_40%,rgba(5,10,22,0.76)_100%)]",
        )}
      />
    </>
  );
}

export function relationshipWidgetToVisualData(widget: RelationshipWidget): WidgetVisualData {
  if (widget.type === "track") {
    return {
      type: "track",
      title: widget.title,
      artist: widget.artist,
      note: widget.note,
      imageDataUrl: widget.coverDataUrl,
      accentColor: widget.accentColor,
      colorMode: widget.colorMode,
      accentPalette: widget.accentPalette,
    };
  }

  if (widget.type === "memory") {
    return {
      type: "memory",
      title: widget.title,
      dateISO: widget.dateISO,
      note: widget.note,
      imageDataUrl: widget.imageDataUrl,
      accentColor: widget.accentColor,
      colorMode: widget.colorMode,
      accentPalette: widget.accentPalette,
    };
  }

  return {
    type: "event",
    title: widget.title,
    dateISO: widget.dateISO,
    subtitle: widget.subtitle,
    imageDataUrl: widget.imageDataUrl,
    accentColor: widget.accentColor,
    colorMode: widget.colorMode,
    accentPalette: widget.accentPalette,
  };
}

export default function WidgetVisual({
  widget,
  actions,
  className,
}: {
  widget: WidgetVisualData;
  actions?: ReactNode;
  className?: string;
}) {
  const title = widget.title.trim() || fallbackTitle(widget.type);
  const hasImage = Boolean(widget.imageDataUrl);
  const hasActions = Boolean(actions);

  if (widget.type === "memory") {
    const note = widget.note?.trim();
    const helperText = !hasImage ? "Добавь фото и короткую подпись." : note;

    return (
      <article
        className={cx(
          "relative aspect-square overflow-hidden rounded-[28px] border border-white/10 bg-[#101a35] p-3 shadow-[0_18px_44px_rgba(3,7,18,0.24)]",
          className,
        )}
      >
        <ColorBackdrop widget={widget} />
        <FullImageLayer imageDataUrl={widget.imageDataUrl} alt={title} variant="memory" />
        {hasImage ? <ColorBackdrop widget={widget} imageOverlay /> : null}
        {actions}

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <span className="rounded-full bg-black/24 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/82 backdrop-blur-md">
              {widgetLabel(widget.type)}
            </span>
            {widget.dateISO && !hasActions ? (
              <span className="rounded-full bg-black/24 px-2 py-1 text-[10px] font-bold text-white/84 backdrop-blur-md">
                {formatWidgetDate(widget.dateISO, "short")}
              </span>
            ) : null}
          </div>

          <div className="rounded-[22px] bg-black/34 px-3 py-3 backdrop-blur-md">
            <h3 className="text-[18px] font-extrabold leading-[1.02]" style={clampStyle(2)}>
              {title}
            </h3>
            {helperText ? (
              <p
                className="mt-1.5 text-[11px] font-medium leading-snug text-white/68"
                style={clampStyle(2)}
              >
                {helperText}
              </p>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  if (widget.type === "track") {
    const artist = widget.artist?.trim() || "Исполнитель";
    const note = widget.note?.trim();

    return (
      <article
        className={cx(
          "relative col-span-2 min-h-[146px] overflow-hidden rounded-[30px] border border-white/10 bg-[#101a35] p-4 shadow-[0_18px_44px_rgba(3,7,18,0.22)]",
          className,
        )}
      >
        <ColorBackdrop widget={widget} />
        {actions}

        <div className="relative z-10 grid grid-cols-[104px_minmax(0,1fr)] items-center gap-4">
          <div className="flex h-[104px] w-[104px] items-center justify-center overflow-hidden rounded-[24px] border border-white/12 bg-black/28 text-[32px] font-bold text-white/82 shadow-[0_18px_36px_rgba(3,7,18,0.3)]">
            {widget.imageDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={widget.imageDataUrl}
                alt={`${artist} - ${title}`}
                className="h-full w-full object-cover"
              />
            ) : (
              "♪"
            )}
          </div>

          <div className="min-w-0">
            <div className="mb-3 inline-flex rounded-full bg-black/22 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/74 backdrop-blur-md">
              {widgetLabel(widget.type)}
            </div>
            <h3 className="text-[22px] font-extrabold leading-[1.04]" style={clampStyle(2)}>
              {title}
            </h3>
            <p className="mt-1 text-[15px] font-semibold leading-tight text-white/84" style={clampStyle(1)}>
              {artist}
            </p>
            {note ? (
              <p
                className="mt-2 text-[12px] font-medium leading-snug text-white/62"
                style={clampStyle(1)}
              >
                {note}
              </p>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  const subtitle = widget.subtitle?.trim();

  return (
    <article
      className={cx(
        "relative col-span-2 min-h-[222px] overflow-hidden rounded-[32px] border border-white/10 bg-[#101a35] p-4 shadow-[0_20px_50px_rgba(3,7,18,0.24)]",
        className,
      )}
    >
      <ColorBackdrop widget={widget} />
      <FullImageLayer imageDataUrl={widget.imageDataUrl} alt={title} variant="event" />
      {hasImage ? <ColorBackdrop widget={widget} imageOverlay /> : null}
      {actions}

      <div className="relative z-10 flex h-full min-h-[190px] flex-col justify-between">
        <div className={cx("flex items-start justify-between gap-3", hasActions && "pr-16")}>
          <span className="rounded-full bg-black/24 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/82 backdrop-blur-md">
            {widgetLabel(widget.type)}
          </span>
          <span className="shrink-0 rounded-full bg-black/24 px-3 py-1.5 text-[11px] font-bold text-white/84 backdrop-blur-md">
            {widget.dateISO ? formatWidgetDate(widget.dateISO, "long") : "Дата события"}
          </span>
        </div>

        <div className="max-w-full rounded-[26px] bg-black/34 px-4 py-4 backdrop-blur-md">
          <h3 className="text-[26px] font-extrabold leading-[1.02]" style={clampStyle(2)}>
            {title}
          </h3>
          {subtitle ? (
            <p
              className="mt-2.5 max-w-[250px] text-[13px] font-medium leading-relaxed text-white/70"
              style={clampStyle(2)}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
