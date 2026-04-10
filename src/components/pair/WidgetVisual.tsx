import type { CSSProperties, ReactNode } from "react";
import AtmosphericBackdrop from "@/components/pair/AtmosphericBackdrop";
import type {
  RelationshipWidget,
  WidgetColorMode,
  WidgetType,
} from "@/lib/relationship";
import { inferTrackFromUrl } from "@/lib/trackLink";

export type WidgetVisualData = {
  type: WidgetType;
  title: string;
  dateISO?: string;
  subtitle?: string;
  note?: string;
  artist?: string;
  trackUrl?: string;
  platform?: string;
  imageDataUrl?: string;
  accentColor: string;
  colorMode: WidgetColorMode;
  accentPalette?: string[];
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function titleFitStyle(text: string, maxPx: number, minPx: number): CSSProperties {
  const lengthPressure = Math.min(1, Math.max(0, (text.length - 24) / 92));
  const fontSize = Math.round(maxPx - (maxPx - minPx) * lengthPressure);

  return {
    fontSize: `${fontSize}px`,
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
            ? "bg-[linear-gradient(180deg,var(--theme-image-overlay-soft)_0%,var(--theme-image-overlay-mid)_42%,var(--theme-image-overlay-strong)_100%)]"
            : "bg-[linear-gradient(180deg,var(--theme-image-overlay-soft)_0%,var(--theme-image-overlay-mid)_40%,var(--theme-image-overlay-strong)_100%)]",
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
      trackUrl: widget.trackUrl,
      platform: widget.platform,
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
          "theme-widget-card relative col-span-2 min-h-[188px] overflow-hidden rounded-[32px] border p-3.5",
          className,
        )}
      >
        <ColorBackdrop widget={widget} />
        {actions}

        <div className="relative z-10 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-3">
          <div className="relative aspect-square w-full self-start">
            <div className="absolute inset-1 rotate-[-5deg] rounded-[30px] bg-[var(--theme-photo-frame)] shadow-[0_18px_42px_var(--theme-shadow)]" />
            <div className="theme-photo-frame relative h-full rotate-[-1.5deg] overflow-hidden rounded-[30px] border p-2 shadow-[0_18px_46px_rgba(3,7,18,0.32)] backdrop-blur-md">
              <div className="theme-photo-inner h-full overflow-hidden rounded-[22px]">
                {widget.imageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={widget.imageDataUrl}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="theme-muted-text flex h-full items-center justify-center text-[13px] font-semibold">
                    фото
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className={cx("mb-3 flex items-start justify-between gap-2", hasActions && "pr-14")}>
              <span className="theme-chip rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] backdrop-blur-md">
                {widgetLabel(widget.type)}
              </span>
              {widget.dateISO ? (
                <span className="theme-chip shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-md">
                  {formatWidgetDate(widget.dateISO, "short")}
                </span>
              ) : null}
            </div>

            <h3
              className="widget-fit-text font-extrabold leading-[1.04]"
              style={titleFitStyle(title, 24, 16)}
            >
              {title}
            </h3>
            {helperText ? (
              <p className="theme-muted-text widget-fit-text mt-2.5 text-[12px] font-medium leading-relaxed">
                {helperText}
              </p>
            ) : null}

            <div className="mt-4 h-1 w-16 rounded-full bg-[var(--theme-ring)] opacity-50" />
          </div>
        </div>
      </article>
    );
  }

  if (widget.type === "track") {
    const artist = widget.artist?.trim() || "Исполнитель";
    const note = widget.note?.trim();
    const trackLink = widget.trackUrl ? inferTrackFromUrl(widget.trackUrl) : null;
    const platform = widget.platform ?? trackLink?.platform ?? "Музыка";

    return (
      <article
        className={cx(
          "theme-widget-card relative col-span-2 min-h-[152px] overflow-hidden rounded-[30px] border p-4",
          className,
        )}
      >
        <ColorBackdrop widget={widget} />
        {actions}

        <div className="relative z-10 grid grid-cols-[112px_minmax(0,1fr)] items-center gap-4">
          <div className="theme-photo-frame flex aspect-square w-full items-center justify-center overflow-hidden rounded-[26px] border text-[32px] font-bold text-[var(--theme-text)] shadow-[0_18px_36px_var(--theme-shadow)]">
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

          <div className={cx("min-w-0", hasActions && "pr-14")}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="theme-chip inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-md">
                {platform}
              </div>
              {trackLink ? (
                <a
                  href={trackLink.url}
                  target="_blank"
                  rel="noreferrer"
                  className="theme-chip inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-md"
                >
                  Открыть
                </a>
              ) : null}
            </div>
            <h3
              className="widget-fit-text font-extrabold leading-[1.05]"
              style={titleFitStyle(title, 22, 15)}
            >
              {title}
            </h3>
            <p className="theme-muted-text widget-fit-text mt-1 text-[14px] font-semibold leading-snug">
              {artist}
            </p>
            {note ? (
              <p className="theme-muted-text widget-fit-text mt-2 text-[12px] font-medium leading-snug opacity-80">
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
        "theme-widget-card relative col-span-2 min-h-[222px] overflow-hidden rounded-[32px] border p-4",
        className,
      )}
    >
      <ColorBackdrop widget={widget} />
      <FullImageLayer imageDataUrl={widget.imageDataUrl} alt={title} variant="event" />
      {hasImage ? <ColorBackdrop widget={widget} imageOverlay /> : null}
      {actions}

      <div className="relative z-10 flex h-full min-h-[190px] flex-col justify-between">
        <div className={cx("flex items-start justify-between gap-3", hasActions && "pr-16")}>
          <span className="theme-chip rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-md">
            {widgetLabel(widget.type)}
          </span>
          <span className="theme-chip shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold backdrop-blur-md">
            {widget.dateISO ? formatWidgetDate(widget.dateISO, "long") : "Дата события"}
          </span>
        </div>

        <div className="theme-glass max-w-full rounded-[26px] px-4 py-4 backdrop-blur-md">
          <h3
            className="widget-fit-text font-extrabold leading-[1.04]"
            style={titleFitStyle(title, 26, 17)}
          >
            {title}
          </h3>
          {subtitle ? (
            <p className="theme-muted-text widget-fit-text mt-2.5 max-w-[250px] text-[13px] font-medium leading-relaxed">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
