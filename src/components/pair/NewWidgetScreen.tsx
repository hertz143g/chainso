// src/components/pair/NewWidgetScreen.tsx
"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createWidgetId,
  loadSettings,
  saveSettings,
  type RelationshipWidget,
  type WidgetType,
} from "@/lib/relationship";

const COLOR_OPTIONS = ["#4A86E8", "#E86FA5", "#5AA897", "#F59E0B", "#8B5CF6"];

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File read error"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export default function NewWidgetScreen() {
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<WidgetType>("event");
  const [accentColor, setAccentColor] = useState(COLOR_OPTIONS[0]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDateISO, setEventDateISO] = useState("");
  const [trackTitle, setTrackTitle] = useState("");
  const [trackArtist, setTrackArtist] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  const canSave =
    type === "event"
      ? eventTitle.trim().length > 0 && eventDateISO.length > 0
      : trackTitle.trim().length > 0 && trackArtist.trim().length > 0;

  const imageLabel = type === "event" ? "Фото на фоне" : "Обложка трека";

  const onPickImage = () => imageRef.current?.click();

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await readFileAsDataURL(file);
    setImageDataUrl(url);
    event.target.value = "";
  };

  const onSave = () => {
    if (!canSave || isSaving) return;

    setIsSaving(true);

    const settings = loadSettings();
    let widget: RelationshipWidget;

    if (type === "event") {
      widget = {
        id: createWidgetId(),
        type: "event",
        title: eventTitle.trim(),
        dateISO: eventDateISO,
        imageDataUrl,
        accentColor,
        createdAtISO: new Date().toISOString(),
      };
    } else {
      widget = {
        id: createWidgetId(),
        type: "track",
        title: trackTitle.trim(),
        artist: trackArtist.trim(),
        coverDataUrl: imageDataUrl,
        accentColor,
        createdAtISO: new Date().toISOString(),
      };
    }

    saveSettings({
      ...settings,
      widgets: [widget, ...settings.widgets],
    });

    router.push("/");
  };

  return (
    <div className="text-white">
      <div className="relative flex items-center">
        <Link href="/" className="w-8 text-left select-none">
          ←
        </Link>
        <div className="absolute left-0 right-0 text-center font-semibold text-[18px] pointer-events-none">
          Новый виджет
        </div>
        <div className="w-8" />
      </div>

      <div className="mt-6 bg-[#0e1b3d] rounded-[22px] p-4">
        <div className="text-[13px] text-white/80">Тип виджета</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[
            { value: "event", label: "Событие" },
            { value: "track", label: "Трек" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setType(option.value as WidgetType)}
              className={`rounded-[18px] px-4 py-3 text-[14px] font-semibold transition ${
                type === option.value
                  ? "bg-[#3F86FF] text-white"
                  : "bg-white/10 text-white/80"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {type === "event" ? (
          <div className="mt-5 space-y-3">
            <input
              value={eventTitle}
              onChange={(event) => setEventTitle(event.target.value)}
              placeholder="Название события"
              className="w-full rounded-full px-4 py-3 text-[14px] bg-[#e5e5e5] text-black outline-none"
            />
            <input
              type="date"
              value={eventDateISO}
              onChange={(event) => setEventDateISO(event.target.value)}
              className="w-full rounded-full px-4 py-3 text-[14px] bg-[#e5e5e5] text-black outline-none"
            />
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <input
              value={trackTitle}
              onChange={(event) => setTrackTitle(event.target.value)}
              placeholder="Название трека"
              className="w-full rounded-full px-4 py-3 text-[14px] bg-[#e5e5e5] text-black outline-none"
            />
            <input
              value={trackArtist}
              onChange={(event) => setTrackArtist(event.target.value)}
              placeholder="Исполнитель"
              className="w-full rounded-full px-4 py-3 text-[14px] bg-[#e5e5e5] text-black outline-none"
            />
          </div>
        )}

        <div className="mt-5">
          <div className="text-[13px] text-white/80">{imageLabel}</div>
          <button
            type="button"
            onClick={onPickImage}
            className="mt-3 w-full rounded-[18px] border border-dashed border-white/45 px-4 py-4 text-left text-[14px] text-white/80"
          >
            {imageDataUrl ? "Изображение выбрано" : "Нажми, чтобы загрузить изображение"}
          </button>
        </div>

        <div className="mt-5">
          <div className="text-[13px] text-white/80">Цвет карточки</div>
          <div className="mt-3 flex gap-3">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setAccentColor(color)}
                className={`h-10 w-10 rounded-full border-2 ${
                  accentColor === color ? "border-white" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Выбрать цвет ${color}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[22px] bg-black/20 p-4">
          <div className="text-[13px] text-white/70">Превью</div>
          {type === "event" ? (
            <div
              className="mt-3 rounded-[24px] px-5 py-6 min-h-[160px] flex flex-col justify-between overflow-hidden bg-cover bg-center"
              style={{
                backgroundColor: accentColor,
                backgroundImage: imageDataUrl
                  ? `linear-gradient(to top, rgba(8, 15, 33, 0.72), rgba(8, 15, 33, 0.18)), url(${imageDataUrl})`
                  : undefined,
              }}
            >
              <div className="text-center text-[20px] font-extrabold">
                {eventTitle.trim() || "Название события"}
              </div>
              <div className="text-center text-[18px] font-bold text-white/90">
                {eventDateISO || "Дата события"}
              </div>
            </div>
          ) : (
            <div
              className="mt-3 rounded-[24px] p-4 flex items-center gap-4 min-h-[140px]"
              style={{ backgroundColor: accentColor }}
            >
              <div className="h-[92px] w-[92px] rounded-[22px] overflow-hidden bg-black/25 flex items-center justify-center text-[28px]">
                {imageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageDataUrl}
                    alt="cover preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "♪"
                )}
              </div>
              <div>
                <div className="text-[22px] font-extrabold">
                  {trackTitle.trim() || "Название трека"}
                </div>
                <div className="text-[18px] font-semibold text-white/90">
                  {trackArtist.trim() || "Исполнитель"}
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={!canSave || isSaving}
          className="mt-6 w-full rounded-[18px] bg-[#3F86FF] py-3 text-[16px] font-semibold text-white disabled:opacity-50"
        >
          Сохранить виджет
        </button>

        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageChange}
        />
      </div>
    </div>
  );
}
