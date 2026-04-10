// src/components/pair/NewWidgetScreen.tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
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
    const widget: TrackWidget = {
      ...base,
      type: "track",
      title: draft.title.trim(),
      artist: draft.artist.trim(),
      note: draft.note.trim() || undefined,
      coverDataUrl: draft.imageDataUrl,
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
      className={`rounded-[24px] border-4 border-dashed px-4 py-4 text-left transition ${
        selected ? "border-[#4AA7FF] bg-white/8" : "border-white/80 bg-transparent"
      } ${className}`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="text-[15px] font-bold">{title}</div>
        <div className="text-[12px] text-white/70">{caption}</div>
      </div>
    </button>
  );
}

function draftToVisualData(draft: WidgetDraft): WidgetVisualData {
  return {
    type: draft.type,
    title: draft.title,
    dateISO: draft.type === "track" ? undefined : draft.dateISO || undefined,
    subtitle: draft.type === "event" ? draft.subtitle : undefined,
    note: draft.type === "event" ? undefined : draft.note,
    artist: draft.type === "track" ? draft.artist : undefined,
    imageDataUrl: draft.imageDataUrl,
    accentColor: draft.accentColor,
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
        : current.title.trim().length > 0 && current.artist.trim().length > 0;

  const imageLabel =
    current.type === "track"
      ? "Обложка трека"
      : current.type === "memory"
        ? "Фото момента"
        : "Фон события";

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
    <div className="text-white">
      <div className="relative flex items-center">
        <Link href="/" className="w-8 text-left select-none">
          ←
        </Link>
        <div className="absolute left-0 right-0 pointer-events-none text-center text-[18px] font-semibold">
          {isEditing ? "Редактировать виджет" : "Новый виджет"}
        </div>
        <div className="w-8" />
      </div>

      <form onSubmit={onSubmit} className="mt-6 rounded-[22px] bg-[#0e1b3d] p-4">
        <div>
          <div className="text-[16px] font-extrabold underline decoration-[#4AA7FF] underline-offset-4">
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
          <input
            value={current.title}
            onChange={(event) => patchDraft({ title: event.target.value })}
            placeholder={
              current.type === "track" ? "Название трека" : "Название виджета"
            }
            className="w-full rounded-full bg-[#e5e5e5] px-4 py-3 text-[14px] text-black outline-none"
          />

          {current.type === "event" ? (
            <>
              <input
                type="date"
                value={current.dateISO}
                onChange={(event) => patchDraft({ dateISO: event.target.value })}
                className="w-full rounded-full bg-[#e5e5e5] px-4 py-3 text-[14px] text-black outline-none"
              />
              <input
                value={current.subtitle}
                onChange={(event) => patchDraft({ subtitle: event.target.value })}
                placeholder="Подпись под событием"
                className="w-full rounded-full bg-[#e5e5e5] px-4 py-3 text-[14px] text-black outline-none"
              />
            </>
          ) : null}

          {current.type === "memory" ? (
            <>
              <input
                type="date"
                value={current.dateISO}
                onChange={(event) => patchDraft({ dateISO: event.target.value })}
                className="w-full rounded-full bg-[#e5e5e5] px-4 py-3 text-[14px] text-black outline-none"
              />
              <textarea
                value={current.note}
                onChange={(event) => patchDraft({ note: event.target.value })}
                placeholder="Короткая подпись"
                rows={3}
                className="w-full rounded-[22px] bg-[#e5e5e5] px-4 py-3 text-[14px] text-black outline-none"
              />
            </>
          ) : null}

          {current.type === "track" ? (
            <>
              <input
                value={current.artist}
                onChange={(event) => patchDraft({ artist: event.target.value })}
                placeholder="Исполнитель"
                className="w-full rounded-full bg-[#e5e5e5] px-4 py-3 text-[14px] text-black outline-none"
              />
              <textarea
                value={current.note}
                onChange={(event) => patchDraft({ note: event.target.value })}
                placeholder="Подпись или заметка"
                rows={3}
                className="w-full rounded-[22px] bg-[#e5e5e5] px-4 py-3 text-[14px] text-black outline-none"
              />
            </>
          ) : null}
        </div>

        <div className="mt-5">
          <div className="text-[13px] text-white/80">{imageLabel}</div>
          <button
            type="button"
            onClick={onPickImage}
            className="mt-3 flex min-h-[88px] w-full items-center justify-center rounded-[22px] border-2 border-dashed border-white/55 bg-white/4 px-4 py-4 text-center text-[14px] text-white/80"
          >
            {isUploadingImage
              ? "Подготавливаю изображение..."
              : current.imageDataUrl
                ? "Изображение выбрано, нажми чтобы заменить"
                : "Нажми, чтобы выбрать изображение"}
          </button>
        </div>

        <div className="mt-5">
          <div className="text-[13px] text-white/80">Цвет карточки</div>
          <div className="mt-3 flex flex-wrap gap-3">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => selectSolidColor(color)}
                className={`h-10 w-10 rounded-full border-2 ${
                  current.colorMode === "solid" && current.accentColor === color
                    ? "border-white"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Выбрать цвет ${color}`}
              />
            ))}

            <button
              type="button"
              onClick={selectAdaptiveColor}
              disabled={!isAdaptiveAvailable}
              className={`flex h-10 items-center gap-2 rounded-full border px-3 text-[12px] font-semibold transition ${
                current.colorMode === "adaptive"
                  ? "border-white bg-white/10 text-white"
                  : "border-white/20 bg-white/6 text-white/78"
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
            <div className="mt-2 text-[12px] text-white/54">
              Авто-режим станет доступен после выбора фотографии.
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <div className="text-[13px] text-white/80">Превью</div>
          <div className="mt-3">
            <WidgetPreview draft={current} />
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSave || isSaving || isUploadingImage}
          className="mt-6 w-full rounded-[18px] bg-[#3F86FF] py-3 text-[16px] font-semibold text-white disabled:opacity-55"
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
