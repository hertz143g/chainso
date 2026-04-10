// src/components/pair/SettingsScreen.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import useRelationshipSettings from "@/hooks/useRelationshipSettings";
import {
  type AppTheme,
  type RelationshipSettings,
  updateSettings,
} from "@/lib/relationship";
import { prepareImageForStorage } from "@/lib/widgetAppearance";

const THEME_OPTIONS: Array<{
  id: AppTheme;
  title: string;
  description: string;
}> = [
  {
    id: "sun-cycle",
    title: "От рассвета до заката",
    description: "Живая версия текущей темы: фон меняется утром, днем, на закате и ночью.",
  },
  {
    id: "kitty",
    title: "Kitty love",
    description: "Мягкая розовая тема: мило, воздушно, но без перегруза интерфейса.",
  },
  {
    id: "aquarium",
    title: "Аквариум",
    description: "Liquid glass, водные блики и пузырьки в более спокойном Apple-стиле.",
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useRelationshipSettings();
  const file1Ref = useRef<HTMLInputElement>(null);
  const file2Ref = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<RelationshipSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto1, setIsUploadingPhoto1] = useState(false);
  const [isUploadingPhoto2, setIsUploadingPhoto2] = useState(false);

  const current = draft ?? settings;

  const patchDraft = (patch: Partial<RelationshipSettings>) => {
    setDraft((prev) => ({
      ...(prev ?? settings),
      ...patch,
    }));
  };

  const onPickPhoto = (slot: 1 | 2) => {
    if (slot === 1) {
      file1Ref.current?.click();
      return;
    }

    file2Ref.current?.click();
  };

  const onFileChange =
    (field: "photo1DataUrl" | "photo2DataUrl") =>
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files?.[0];
      if (!file) return;

      const setBusy = field === "photo1DataUrl" ? setIsUploadingPhoto1 : setIsUploadingPhoto2;
      setBusy(true);

      try {
        const imageDataUrl = await prepareImageForStorage(file, {
          maxDimension: 840,
          quality: 0.8,
          targetLength: 340_000,
        });

        patchDraft(
          field === "photo1DataUrl"
            ? { photo1DataUrl: imageDataUrl }
            : { photo2DataUrl: imageDataUrl },
        );
      } catch {
        window.alert("Не удалось обработать фото. Попробуй выбрать другое изображение.");
      } finally {
        setBusy(false);
        event.currentTarget.value = "";
      }
    };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      updateSettings((prev) => ({
        ...prev,
        ...current,
        widgets: current.widgets,
      }));

      router.push("/");
    } catch {
      setIsSaving(false);
      window.alert("Не удалось сохранить изменения. Попробуй изображения поменьше.");
    }
  };

  return (
    <div className="text-white">
      <div className="relative flex items-center">
        <Link href="/" className="w-8 text-left select-none">
          ←
        </Link>
        <div className="absolute left-0 right-0 pointer-events-none text-center text-[18px] font-semibold">
          Настройки
        </div>
        <div className="w-8" />
      </div>

      <form onSubmit={onSubmit} className="theme-panel mt-6 rounded-[22px] p-4">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onPickPhoto(1)}
            className="theme-avatar-ring relative flex h-[74px] w-[74px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e5e5e5] ring-2"
          >
            {current.photo1DataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.photo1DataUrl}
                alt="Фото первого человека"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[22px]">📷</span>
            )}
            {isUploadingPhoto1 ? (
              <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[11px] font-semibold text-white">
                Загрузка
              </span>
            ) : null}
          </button>

          <input
            value={current.name1}
            onChange={(event) => patchDraft({ name1: event.target.value })}
            placeholder="Имя"
            className="theme-input flex-1 rounded-full px-4 py-3 text-[14px] outline-none"
          />
        </div>

        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onPickPhoto(2)}
            className="theme-avatar-ring relative flex h-[74px] w-[74px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e5e5e5] ring-2"
          >
            {current.photo2DataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.photo2DataUrl}
                alt="Фото второго человека"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[22px]">📷</span>
            )}
            {isUploadingPhoto2 ? (
              <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[11px] font-semibold text-white">
                Загрузка
              </span>
            ) : null}
          </button>

          <input
            value={current.name2}
            onChange={(event) => patchDraft({ name2: event.target.value })}
            placeholder="Имя"
            className="theme-input flex-1 rounded-full px-4 py-3 text-[14px] outline-none"
          />
        </div>

        <div className="mb-2 text-[13px] text-white/80">Дата начала отношений:</div>
        <input
          type="date"
          value={current.startDateISO}
          onChange={(event) => patchDraft({ startDateISO: event.target.value })}
          className="theme-input w-full rounded-full px-4 py-3 text-[14px] outline-none"
        />

        <div className="mt-6">
          <div className="mb-3 text-[13px] font-semibold text-white/84">Тема приложения:</div>
          <div className="space-y-3">
            {THEME_OPTIONS.map((theme) => {
              const selected = current.theme === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => patchDraft({ theme: theme.id })}
                  className={`w-full rounded-[22px] border px-4 py-3 text-left transition ${
                    selected
                      ? "border-white/80 bg-white/18 shadow-[0_16px_36px_rgba(3,7,18,0.18)]"
                      : "border-white/16 bg-white/8"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[15px] font-extrabold">{theme.title}</div>
                    <span
                      className={`h-3 w-3 shrink-0 rounded-full ${
                        selected ? "bg-white" : "bg-white/28"
                      }`}
                    />
                  </div>
                  <div className="mt-1.5 text-[12px] leading-relaxed text-white/70">
                    {theme.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving || isUploadingPhoto1 || isUploadingPhoto2}
          className="theme-primary-button mt-6 w-full rounded-[18px] py-3 text-[16px] font-semibold disabled:opacity-60"
        >
          Сохранить
        </button>

        <input
          ref={file1Ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange("photo1DataUrl")}
        />
        <input
          ref={file2Ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange("photo2DataUrl")}
        />
      </form>
    </div>
  );
}
