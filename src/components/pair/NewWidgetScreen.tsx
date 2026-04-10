// src/components/pair/NewWidgetScreen.tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import WidgetVisual, { type WidgetVisualData } from "@/components/pair/WidgetVisual";
import useRelationshipSettings from "@/hooks/useRelationshipSettings";
import {
  createWidgetId,
  type EventWidget,
  type MemoryWidget,
  type RelationshipWidget,
  type TrackWidget,
  type WidgetColorMode,
  type WidgetType,
  updateSettings,
} from "@/lib/relationship";
import { inferTrackFromUrl, resolveTrackLink } from "@/lib/trackLink";
import {
  extractPaletteFromDataUrl,
  getWidgetPalette,
  prepareImageForStorage,
} from "@/lib/widgetAppearance";

const COLOR_OPTIONS = ["#4A86E8", "#E86FA5", "#5AA897", "#F59E0B", "#7C65FF"];

type WidgetDraft = {
  type: WidgetType;
  title: string;
  dateISO: string;
  subtitle: string;
  note: string;
  artist: string;
  trackUrl: string;
  imageDataUrl?: string;
  accentColor: string;
  colorMode: WidgetColorMode;
  accentPalette?: string[];
};

function createEmptyDraft(type: WidgetType = "event"): WidgetDraft {
  if (type === "memory") {
    return {
      type,
      title: "",
      dateISO: "",
      subtitle: "",
      note: "",
      artist: "",
      trackUrl: "",
      imageDataUrl: undefined,
      accentColor: "#E86FA5",
      colorMode: "solid",
      accentPalette: undefined,
    };
  }

  if (type === "track") {
    return {
      type,
      title: "",
      dateISO: "",
      subtitle: "",
      note: "",
      artist: "",
      trackUrl: "",
      imageDataUrl: undefined,
      accentColor: "#5AA897",
      colorMode: "solid",
      accentPalette: undefined,
    };
  }

  return {
    type,
    title: "",
    dateISO: "",
    subtitle: "",
    note: "",
    artist: "",
    trackUrl: "",
    imageDataUrl: undefined,
    accentColor: "#4A86E8",
    colorMode: "solid",
    accentPalette: undefined,
  };
}

function widgetToDraft(widget: RelationshipWidget): WidgetDraft {
  if (widget.type === "memory") {
    return {
      type: "memory",
      title: widget.title,
      dateISO: widget.dateISO ?? "",
      subtitle: "",
      note: widget.note ?? "",
      artist: "",
      trackUrl: "",
      imageDataUrl: widget.imageDataUrl,
      accentColor: widget.accentColor,
      colorMode: widget.colorMode,
      accentPalette: widget.accentPalette ? [...widget.accentPalette] : undefined,
    };
  }

  if (widget.type === "track") {
    return {
      type: "track",
      title: widget.title,
      dateISO: "",
      subtitle: "",
      note: widget.note ?? "",
      artist: widget.artist,
      trackUrl: widget.trackUrl ?? "",
      imageDataUrl: widget.coverDataUrl,
      accentColor: widget.accentColor,
      colorMode: widget.colorMode,
      accentPalette: widget.accentPalette ? [...widget.accentPalette] : undefined,
    };
  }

  return {
    type: "event",
    title: widget.title,
    dateISO: widget.dateISO,
    subtitle: widget.subtitle ?? "",
    note: "",
    artist: "",
    trackUrl: "",
    imageDataUrl: widget.imageDataUrl,
    accentColor: widget.accentColor,
    colorMode: widget.colorMode,
    accentPalette: widget.accentPalette ? [...widget.accentPalette] : undefined,
  };
}

function buildWidgetFromDraft(
  draft: WidgetDraft,
  existingWidget?: RelationshipWidget,
): RelationshipWidget {
  const base = {
    id: existingWidget?.id ?? createWidgetId(),
    accentColor: draft.accentColor,
    colorMode: draft.colorMode,
    accentPalette: draft.accentPalette,
    createdAtISO: existingWidget?.createdAtISO ?? new Date().toISOString(),
  };

  if (draft.type === "memory") {
    const widget: MemoryWidget = {
      ...base,
      type: "memory",
      title: draft.title.trim(),
      dateISO: draft.dateISO || undefined,
      note: draft.note.trim() || undefined,
      imageDataUrl: draft.imageDataUrl,
    };

    return widget;
  }

  if (draft.type === "track") {
    const linkMetadata = inferTrackFromUrl(draft.trackUrl);
    const widget: TrackWidget = {
      ...base,
      type: "track",
      title: draft.title.trim() || linkMetadata?.title || "Трек",
      artist: draft.artist.trim() || linkMetadata?.artist || "Музыка",
      note: draft.note.trim() || undefined,
      coverDataUrl: draft.imageDataUrl,
      trackUrl: linkMetadata?.url ?? (draft.trackUrl.trim() || undefined),
      platform: linkMetadata?.platform,
    };

    return widget;
  }

  const widget: EventWidget = {
    ...base,
    type: "event",
    title: draft.title.trim(),
    dateISO: draft.dateISO,
    subtitle: draft.subtitle.trim() || undefined,
    imageDataUrl: draft.imageDataUrl,
  };

  return widget;
}

function WidgetTypeCard({
  title,
  caption,
  selected,
  className,
  onClick,
}: {
  title: string;
  caption: string;
  selected: boolean;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`theme-option-card rounded-[24px] border-4 border-dashed px-4 py-4 text-left transition ${
        selected ? "theme-option-card-selected" : ""
      } ${className}`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="text-[15px] font-bold">{title}</div>
        <div className="theme-subtle-text text-[12px]">{caption}</div>
      </div>
    </button>
  );
}

function draftToVisualData(draft: WidgetDraft): WidgetVisualData {
  const trackMetadata = draft.type === "track" ? inferTrackFromUrl(draft.trackUrl) : null;

  return {
    type: draft.type,
    title: draft.title || trackMetadata?.title || "",
    dateISO: draft.type === "track" ? undefined : draft.dateISO || undefined,
    subtitle: draft.type === "event" ? draft.subtitle : undefined,
    note: draft.type === "event" ? undefined : draft.note,
    artist: draft.type === "track" ? draft.artist || trackMetadata?.artist : undefined,
    trackUrl: draft.type === "track" ? draft.trackUrl : undefined,
    platform: trackMetadata?.platform,
    imageDataUrl: draft.imageDataUrl,
    accentColor:
      draft.type === "track" && draft.accentColor === "#5AA897"
        ? trackMetadata?.accentColor ?? draft.accentColor
        : draft.accentColor,
    colorMode: draft.colorMode,
    accentPalette: draft.accentPalette,
  };
}

function WidgetPreview({ draft }: { draft: WidgetDraft }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <WidgetVisual widget={draftToVisualData(draft)} />
    </div>
  );
}

export default function NewWidgetScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const settings = useRelationshipSettings();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<WidgetDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const widgetId = searchParams.get("id");
  const editingWidget = settings.widgets.find((widget) => widget.id === widgetId);
  const isEditing = Boolean(widgetId && editingWidget);

  const initialDraft = useMemo(
    () => (editingWidget ? widgetToDraft(editingWidget) : createEmptyDraft("event")),
    [editingWidget],
  );

  const current = draft ?? initialDraft;
  const autoPalette = getWidgetPalette({
    accentColor: current.accentColor,
    colorMode: "adaptive",
    accentPalette: current.accentPalette,
  });
  const isAdaptiveAvailable = Boolean(current.imageDataUrl);
  const trackLinkMetadata = current.type === "track" ? inferTrackFromUrl(current.trackUrl) : null;
  const [trackLookupStatus, setTrackLookupStatus] = useState<
    "idle" | "loading" | "ready" | "invalid"
  >("idle");

  const patchDraft = (patch: Partial<WidgetDraft>) => {
    setDraft((prev) => ({
      ...(prev ?? initialDraft),
      ...patch,
    }));
  };

  const selectType = (type: WidgetType) => {
    setDraft((prev) => {
      const base = prev ?? initialDraft;
      return {
        ...base,
        ...createEmptyDraft(type),
        title: base.title,
        dateISO: base.dateISO,
        subtitle: base.subtitle,
        note: base.note,
        artist: base.artist,
        trackUrl: base.trackUrl,
        imageDataUrl: base.imageDataUrl,
        colorMode: base.colorMode,
        accentPalette: base.accentPalette,
        accentColor: base.accentColor,
      };
    });
  };

  const selectSolidColor = (color: string) => {
    patchDraft({
      accentColor: color,
      colorMode: "solid",
    });
  };

  const selectAdaptiveColor = () => {
    if (!isAdaptiveAvailable) return;

    patchDraft({
      colorMode: "adaptive",
      accentColor: current.accentPalette?.[0] ?? current.accentColor,
    });
  };

  const canSave =
    current.type === "event"
      ? current.title.trim().length > 0 && current.dateISO.length > 0
      : current.type === "memory"
        ? current.title.trim().length > 0
        : (current.title.trim().length > 0 && current.artist.trim().length > 0) ||
          Boolean(trackLinkMetadata);

  useEffect(() => {
    if (current.type !== "track") {
      setTrackLookupStatus("idle");
      return;
    }

    const trackUrl = current.trackUrl.trim();
    if (!trackUrl) {
      setTrackLookupStatus("idle");
      return;
    }

    const fallbackMetadata = inferTrackFromUrl(trackUrl);
    if (!fallbackMetadata) {
      setTrackLookupStatus("invalid");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setTrackLookupStatus("loading");

      resolveTrackLink(trackUrl, controller.signal).then((metadata) => {
        if (controller.signal.aborted) return;

        if (!metadata) {
          setTrackLookupStatus("invalid");
          return;
        }

        setTrackLookupStatus("ready");
        setDraft((prev) => {
          const base = prev ?? initialDraft;

          if (base.type !== "track" || base.trackUrl.trim() !== trackUrl) return base;

          const shouldUseTitle =
            !base.title.trim() || base.title.trim() === fallbackMetadata.title;
          const shouldUseArtist =
            !base.artist.trim() || base.artist.trim() === fallbackMetadata.artist;
          const shouldUseCover = !base.imageDataUrl && metadata.imageUrl;

          return {
            ...base,
            title: shouldUseTitle ? metadata.title : base.title,
            artist: shouldUseArtist ? metadata.artist : base.artist,
            imageDataUrl: shouldUseCover ? metadata.imageUrl : base.imageDataUrl,
            accentColor: base.accentColor === "#5AA897" ? metadata.accentColor : base.accentColor,
          };
        });
      });
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [current.type, current.trackUrl, initialDraft]);

  const imageLabel =
    current.type === "track"
      ? "Обложка трека"
      : current.type === "memory"
        ? "Фото момента"
        : "Фон события";
  const trackLinkHint =
    current.type !== "track" || !current.trackUrl.trim()
      ? "Можно просто вставить ссылку: Spotify, Apple Music, YouTube, SoundCloud, Яндекс Музыка и т.д."
      : trackLookupStatus === "invalid"
        ? "Ссылка пока не похожа на трек. Можно заполнить название вручную."
        : trackLookupStatus === "loading"
          ? "Пробую подтянуть название и обложку..."
          : trackLinkMetadata
            ? `Распознал источник: ${trackLinkMetadata.platform}.`
            : "Можно заполнить название вручную.";

  const onPickImage = () => {
    imageInputRef.current?.click();
  };

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    event.currentTarget.value = "";
    setIsUploadingImage(true);

    try {
      const imageDataUrl = await prepareImageForStorage(file, {
        maxDimension: 1180,
        quality: 0.82,
        targetLength: current.type === "track" ? 520_000 : 640_000,
      });
      const palette = await extractPaletteFromDataUrl(imageDataUrl);

      setDraft((prev) => {
        const base = prev ?? initialDraft;
        const shouldStayAdaptive = base.colorMode === "adaptive";
        const nextAccentColor =
          shouldStayAdaptive && palette[0] ? palette[0] : base.accentColor;

        return {
          ...base,
          imageDataUrl,
          accentPalette: palette.length > 0 ? palette : base.accentPalette,
          accentColor: nextAccentColor,
        };
      });
    } catch {
      window.alert("Не удалось обработать изображение. Попробуй выбрать другое фото.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    setIsSaving(true);

    try {
      const nextWidget = buildWidgetFromDraft(current, editingWidget);

      updateSettings((prev) => ({
        ...prev,
        widgets: editingWidget
          ? prev.widgets.map((widget) => (widget.id === editingWidget.id ? nextWidget : widget))
          : [nextWidget, ...prev.widgets],
      }));

      router.push("/");
    } catch {
      setIsSaving(false);
      window.alert("Не удалось сохранить виджет. Попробуй изображение поменьше.");
    }
  };

  return (
    <div className="theme-screen">
      <div className="relative flex items-center">
        <Link href="/" className="w-8 text-left select-none">
          ←
        </Link>
        <div className="absolute left-0 right-0 pointer-events-none text-center text-[18px] font-semibold">
          {isEditing ? "Редактировать виджет" : "Новый виджет"}
        </div>
        <div className="w-8" />
      </div>

      <form onSubmit={onSubmit} className="theme-panel mt-6 rounded-[22px] p-4">
        <div>
          <div className="text-[16px] font-extrabold underline decoration-[var(--theme-ring)] underline-offset-4">
            Тип виджета:
          </div>

          <div className="mt-5 grid grid-cols-[1.65fr_1fr] gap-4">
            <WidgetTypeCard
              title="Событие"
              caption="Большая карточка с датой"
              selected={current.type === "event"}
              className="min-h-[170px]"
              onClick={() => selectType("event")}
            />
            <WidgetTypeCard
              title="Момент"
              caption="Фото как главный акцент"
              selected={current.type === "memory"}
              className="min-h-[104px]"
              onClick={() => selectType("memory")}
            />
            <WidgetTypeCard
              title="Трек"
              caption="Широкая музыкальная карточка"
              selected={current.type === "track"}
              className="col-span-2 min-h-[112px]"
              onClick={() => selectType("track")}
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {current.type === "track" ? (
            <div>
              <input
                type="text"
                inputMode="url"
                value={current.trackUrl}
                onChange={(event) => patchDraft({ trackUrl: event.target.value })}
                placeholder="Ссылка на трек"
                className="theme-input w-full rounded-full px-4 py-3 text-[14px] outline-none"
              />
              <div className="theme-subtle-text mt-2 px-1 text-[12px] leading-relaxed" aria-live="polite">
                {trackLinkHint}
              </div>
            </div>
          ) : null}

          <input
            value={current.title}
            onChange={(event) => patchDraft({ title: event.target.value })}
            placeholder={
              current.type === "track" ? "Название трека, если ссылка не подтянулась" : "Название виджета"
            }
            className="theme-input w-full rounded-full px-4 py-3 text-[14px] outline-none"
          />

          {current.type === "event" ? (
            <>
              <input
                type="date"
                value={current.dateISO}
                onChange={(event) => patchDraft({ dateISO: event.target.value })}
                className="theme-input w-full rounded-full px-4 py-3 text-[14px] outline-none"
              />
              <input
                value={current.subtitle}
                onChange={(event) => patchDraft({ subtitle: event.target.value })}
                placeholder="Подпись под событием"
                className="theme-input w-full rounded-full px-4 py-3 text-[14px] outline-none"
              />
            </>
          ) : null}

          {current.type === "memory" ? (
            <>
              <input
                type="date"
                value={current.dateISO}
                onChange={(event) => patchDraft({ dateISO: event.target.value })}
                className="theme-input w-full rounded-full px-4 py-3 text-[14px] outline-none"
              />
              <textarea
                value={current.note}
                onChange={(event) => patchDraft({ note: event.target.value })}
                placeholder="Короткая подпись"
                rows={3}
                className="theme-input w-full rounded-[22px] px-4 py-3 text-[14px] outline-none"
              />
            </>
          ) : null}

          {current.type === "track" ? (
            <>
              <input
                value={current.artist}
                onChange={(event) => patchDraft({ artist: event.target.value })}
                placeholder="Исполнитель"
                className="theme-input w-full rounded-full px-4 py-3 text-[14px] outline-none"
              />
              <textarea
                value={current.note}
                onChange={(event) => patchDraft({ note: event.target.value })}
                placeholder="Подпись или заметка"
                rows={3}
                className="theme-input w-full rounded-[22px] px-4 py-3 text-[14px] outline-none"
              />
            </>
          ) : null}
        </div>

        <div className="mt-5">
          <div className="theme-form-label text-[13px]">{imageLabel}</div>
          <button
            type="button"
            onClick={onPickImage}
            className="theme-upload-button mt-3 flex min-h-[88px] w-full items-center justify-center rounded-[22px] border-2 border-dashed px-4 py-4 text-center text-[14px] transition"
          >
            {isUploadingImage
              ? "Подготавливаю изображение..."
              : current.imageDataUrl
                ? "Изображение выбрано, нажми чтобы заменить"
                : "Нажми, чтобы выбрать изображение"}
          </button>
        </div>

        <div className="mt-5">
          <div className="theme-form-label text-[13px]">Цвет карточки</div>
          <div className="mt-3 flex flex-wrap gap-3">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => selectSolidColor(color)}
                className="h-10 w-10 rounded-full border-2 transition"
                style={{
                  backgroundColor: color,
                  borderColor:
                    current.colorMode === "solid" && current.accentColor === color
                      ? "var(--theme-ring)"
                      : "transparent",
                }}
                aria-label={`Выбрать цвет ${color}`}
              />
            ))}

            <button
              type="button"
              onClick={selectAdaptiveColor}
              disabled={!isAdaptiveAvailable}
              className={`theme-option-card flex h-10 items-center gap-2 rounded-full border px-3 text-[12px] font-semibold transition ${
                current.colorMode === "adaptive" ? "theme-option-card-selected" : ""
              } disabled:cursor-not-allowed disabled:opacity-45`}
            >
              <span
                className="block h-5 w-5 rounded-full"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${autoPalette[0]}, ${autoPalette[1]}, ${autoPalette[2]})`,
                }}
              />
              Авто
            </button>
          </div>
          {!isAdaptiveAvailable ? (
            <div className="theme-subtle-text mt-2 text-[12px] opacity-75">
              Авто-режим станет доступен после выбора фотографии.
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <div className="theme-form-label text-[13px]">Превью</div>
          <div className="mt-3">
            <WidgetPreview draft={current} />
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSave || isSaving || isUploadingImage}
          className="theme-primary-button mt-6 w-full rounded-[18px] py-3 text-[16px] font-semibold disabled:opacity-55"
        >
          {isEditing ? "Сохранить изменения" : "Добавить виджет"}
        </button>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageChange}
        />
      </form>
    </div>
  );
}
