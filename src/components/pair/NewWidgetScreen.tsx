// src/components/pair/NewWidgetScreen.tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  createWidgetId,
  formatDateLong,
  type EventWidget,
  type MemoryWidget,
  type RelationshipWidget,
  type TrackWidget,
  type WidgetType,
  updateSettings,
} from "@/lib/relationship";
import useRelationshipSettings from "@/hooks/useRelationshipSettings";

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
};

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File read error"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

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
  };
}

function buildWidgetFromDraft(
  draft: WidgetDraft,
  existingWidget?: RelationshipWidget,
): RelationshipWidget {
  const base = {
    id: existingWidget?.id ?? createWidgetId(),
    accentColor: draft.accentColor,
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

function WidgetPreview({ draft }: { draft: WidgetDraft }) {
  if (draft.type === "track") {
    return (
      <div className="rounded-[28px] p-4" style={{ backgroundColor: draft.accentColor }}>
        <div className="flex items-center gap-4">
          <div className="flex h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-[24px] bg-black/25 text-[28px]">
            {draft.imageDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.imageDataUrl}
                alt="Обложка"
                className="h-full w-full object-cover"
              />
            ) : (
              "♪"
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[22px] font-extrabold">
              {draft.title.trim() || "Название трека"}
            </div>
            <div className="mt-1 text-[17px] font-semibold text-white/88">
              {draft.artist.trim() || "Исполнитель"}
            </div>
            {draft.note.trim() ? (
              <div className="mt-2 text-[13px] text-white/72">{draft.note.trim()}</div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (draft.type === "memory") {
    return (
      <div
        className="aspect-square rounded-[28px] overflow-hidden bg-cover bg-center p-4"
        style={{
          backgroundColor: draft.accentColor,
          backgroundImage: draft.imageDataUrl
            ? `linear-gradient(to top, rgba(9, 14, 30, 0.78), rgba(9, 14, 30, 0.2)), url(${draft.imageDataUrl})`
            : undefined,
        }}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="self-end rounded-full bg-black/22 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
            Момент
          </div>
          <div>
            <div className="text-[22px] font-extrabold">
              {draft.title.trim() || "Любимый кадр"}
            </div>
            {draft.note.trim() ? (
              <div className="mt-1 text-[13px] text-white/78">{draft.note.trim()}</div>
            ) : null}
            {draft.dateISO ? (
              <div className="mt-3 inline-flex rounded-full bg-black/26 px-3 py-1 text-[12px] font-semibold">
                {formatDateLong(draft.dateISO)}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[220px] rounded-[30px] overflow-hidden bg-cover bg-center p-5"
      style={{
        backgroundColor: draft.accentColor,
        backgroundImage: draft.imageDataUrl
          ? `linear-gradient(to top, rgba(9, 14, 30, 0.84), rgba(9, 14, 30, 0.16)), url(${draft.imageDataUrl})`
          : undefined,
      }}
    >
      <div className="flex h-full min-h-[180px] flex-col justify-between">
        <div className="max-w-[70%]">
          <div className="text-[25px] font-extrabold leading-tight">
            {draft.title.trim() || "Название события"}
          </div>
          {draft.subtitle.trim() ? (
            <div className="mt-2 text-[14px] text-white/78">{draft.subtitle.trim()}</div>
          ) : null}
        </div>
        <div className="self-end rounded-full bg-black/26 px-4 py-2 text-[13px] font-semibold">
          {draft.dateISO ? formatDateLong(draft.dateISO) : "Дата события"}
        </div>
      </div>
    </div>
  );
}

export default function NewWidgetScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const settings = useRelationshipSettings();
  const [draft, setDraft] = useState<WidgetDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const widgetId = searchParams.get("id");
  const editingWidget = settings.widgets.find((widget) => widget.id === widgetId);
  const isEditing = Boolean(widgetId && editingWidget);

  const initialDraft = useMemo(
    () => (editingWidget ? widgetToDraft(editingWidget) : createEmptyDraft("event")),
    [editingWidget],
  );

  const current = draft ?? initialDraft;

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
      };
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

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    const url = await readFileAsDataURL(file);
    patchDraft({ imageDataUrl: url });
    event.currentTarget.value = "";
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    setIsSaving(true);

    const nextWidget = buildWidgetFromDraft(current, editingWidget);

    updateSettings((prev) => ({
      ...prev,
      widgets: editingWidget
        ? prev.widgets.map((widget) => (widget.id === editingWidget.id ? nextWidget : widget))
        : [nextWidget, ...prev.widgets],
    }));

    router.push("/");
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
              caption="Квадратный кадр"
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
          <label className="mt-3 flex min-h-[88px] w-full cursor-pointer items-center justify-center rounded-[22px] border-2 border-dashed border-white/55 bg-white/4 px-4 py-4 text-center text-[14px] text-white/80">
            {current.imageDataUrl ? "Изображение выбрано, нажми чтобы заменить" : "Нажми, чтобы выбрать изображение"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageChange}
            />
          </label>
        </div>

        <div className="mt-5">
          <div className="text-[13px] text-white/80">Цвет карточки</div>
          <div className="mt-3 flex gap-3">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => patchDraft({ accentColor: color })}
                className={`h-10 w-10 rounded-full border-2 ${
                  current.accentColor === color ? "border-white" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Выбрать цвет ${color}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-[13px] text-white/80">Превью</div>
          <div className="mt-3">
            <WidgetPreview draft={current} />
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSave || isSaving}
          className="mt-6 w-full rounded-[18px] bg-[#3F86FF] py-3 text-[16px] font-semibold text-white disabled:opacity-55"
        >
          {isEditing ? "Сохранить изменения" : "Добавить виджет"}
        </button>
      </form>
    </div>
  );
}
