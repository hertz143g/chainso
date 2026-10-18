"use client";

import { useState, type ReactNode } from "react";
import AtmosphericBackdrop from "@/components/pair/AtmosphericBackdrop";
import type { WidgetVisualData } from "@/components/pair/WidgetVisual";
import { cleanTrackTitle, inferTrackFromUrl } from "@/lib/trackLink";

export default function MusicWidget({ widget, actions, className }: { widget: WidgetVisualData; actions?: ReactNode; className?: string }) {
  const link = widget.trackUrl ? inferTrackFromUrl(widget.trackUrl) : null;
  const title = cleanTrackTitle(widget.title, widget.trackUrl) || "Название трека";
  const rawArtist = widget.artist?.trim() ?? "";
  const platform = link?.platform ?? widget.platform ?? "Музыка";
  const artist = rawArtist && rawArtist !== platform && rawArtist !== "Открыть по ссылке" ? rawArtist : "Исполнитель";
  const [failedImage, setFailedImage] = useState<string | undefined>();
  const image = widget.imageDataUrl && widget.imageDataUrl !== failedImage ? widget.imageDataUrl : undefined;

  return (
    <article className={`theme-widget-card theme-surface-lift music-widget relative isolate col-span-2 overflow-hidden border ${className ?? ""}`}>
      <AtmosphericBackdrop accentColor={widget.accentColor} colorMode={widget.colorMode} accentPalette={widget.accentPalette} imageDataUrl={image} />
      {actions}
      <div className={`music-widget-topline${actions ? " music-widget-topline-editing" : ""}`}>
        <span className="music-widget-eyebrow"><span aria-hidden="true">♫</span> Наша песня</span>
        <span className="music-widget-platform">{platform}</span>
      </div>
      <div className="music-widget-body">
        <div className="music-widget-cover">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={`Обложка: ${title}`} draggable={false} decoding="async" loading="lazy" onError={() => setFailedImage(image)} />
          ) : (
            <div className="music-widget-record" aria-hidden="true"><span>♪</span></div>
          )}
        </div>
        <div className="music-widget-info">
          <h3 title={title}>{title}</h3>
          <p className="music-widget-artist" title={artist}>{artist}</p>
          <span className="music-widget-rule" aria-hidden="true" />
        </div>
      </div>
      {widget.note?.trim() ? <p className="music-widget-note">{widget.note.trim()}</p> : null}
      {link ? (
        <a className="music-widget-listen" href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`Слушать «${title}» в ${platform}, откроется новая вкладка`}>
          <span className="music-widget-listen-icon" aria-hidden="true">▶</span>
          <span>Слушать в {platform}</span>
          <span className="music-widget-external" aria-hidden="true">↗</span>
        </a>
      ) : null}
    </article>
  );
}
