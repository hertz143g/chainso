// src/components/pair/SettingsScreen.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import useRelationshipSettings from "@/hooks/useRelationshipSettings";
import {
  type AppTheme,
  type AvatarDisplayStyle,
  type CustomThemeSettings,
  type RelationshipSettings,
  type TimeDisplayStyle,
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
    title: "От заката до рассвета",
    description: "Живая версия текущей темы: фон меняется утром, днем, на закате и ночью.",
  },
  {
    id: "linen",
    title: "Теплый лен",
    description: "Светлая спокойная тема: кремовый фон, мягкие карточки и теплые акценты.",
  },
  {
    id: "sage",
    title: "Тихий сад",
    description: "Природная тема с шалфеем, молочными панелями и очень мягким контрастом.",
  },
  {
    id: "aurora",
    title: "Воздушная аврора",
    description: "Свежая светлая тема: голубой, лавандовый и чистые стеклянные поверхности.",
  },
  {
    id: "noir",
    title: "Графитовый шелк",
    description: "Темная спокойная тема: графит, холодный свет и дорогие матовые панели.",
  },
  {
    id: "ember",
    title: "Ночной янтарь",
    description: "Темная теплая тема с огненными акцентами, но без кислотного перегруза.",
  },
  {
    id: "neo",
    title: "Neo Matrix",
    description: "Черно-зеленая тема для хакерского вайба: код, свечение и цифровой дождь.",
  },
  {
    id: "custom",
    title: "Своя тема",
    description: "Настрой фон, панели, акцент и текст под себя.",
  },
];

const CUSTOM_THEME_FIELDS: Array<{
  key: keyof CustomThemeSettings;
  label: string;
}> = [
  { key: "backgroundColor", label: "Фон" },
  { key: "surfaceColor", label: "Панели" },
  { key: "primaryColor", label: "Акцент" },
  { key: "textColor", label: "Текст" },
];

const TIME_STYLE_OPTIONS: Array<{
  id: TimeDisplayStyle;
  title: string;
}> = [
  { id: "glass", title: "Стекло" },
  { id: "hourglass", title: "Линия" },
  { id: "orbits", title: "Импульс" },
];

const AVATAR_STYLE_OPTIONS: Array<{
  id: AvatarDisplayStyle;
  title: string;
}> = [
  { id: "classic", title: "Круги" },
  { id: "halo", title: "Портреты" },
  { id: "duo-card", title: "Камео" },
];

function ThemePreviewDots({
  theme,
  customTheme,
}: {
  theme: AppTheme;
  customTheme: CustomThemeSettings;
}) {
  if (theme === "custom") {
    return (
      <div
        className="relative h-10 w-16 overflow-hidden rounded-[16px]"
        style={{
          background: `linear-gradient(135deg, ${customTheme.backgroundColor}, ${customTheme.surfaceColor})`,
        }}
      >
        <span
          className="absolute left-3 top-2 h-5 w-5 rounded-full"
          style={{ backgroundColor: customTheme.primaryColor }}
        />
        <span
          className="absolute bottom-2 right-3 h-3 w-7 rounded-full"
          style={{ backgroundColor: customTheme.textColor }}
        />
      </div>
    );
  }

  if (theme === "neo") {
    return (
      <div className="relative h-10 w-16 overflow-hidden rounded-[16px] bg-[linear-gradient(135deg,#000501,#021208,#31ff91)]">
        <span className="absolute left-2 top-1 text-[9px] font-black tracking-[0.2em] text-[#31ff91]">
          0101
        </span>
        <span className="absolute bottom-1 right-2 h-4 w-4 rounded-full bg-[#31ff91]/80 blur-[2px]" />
      </div>
    );
  }

  if (theme === "ember") {
    return (
      <div className="relative h-10 w-16 overflow-hidden rounded-[16px] bg-[linear-gradient(135deg,#120806,#281611,#ff9f5f)]">
        <span className="absolute left-2 top-2 h-5 w-6 rounded-full bg-[#ff9f5f]/75 blur-[4px]" />
        <span className="absolute bottom-2 right-3 h-3 w-3 rounded-full bg-[#ffc48e]" />
      </div>
    );
  }

  if (theme === "noir") {
    return (
      <div className="relative h-10 w-16 overflow-hidden rounded-[16px] bg-[linear-gradient(135deg,#070b13,#121826,#b8ccf1)]">
        <span className="absolute left-3 top-2 h-4 w-7 rounded-full bg-white/35 blur-[5px]" />
        <span className="absolute bottom-2 right-3 h-3 w-3 rounded-full bg-[#d7e4ff]/80" />
      </div>
    );
  }

  if (theme === "aurora") {
    return (
      <div className="relative h-10 w-16 overflow-hidden rounded-[16px] bg-[linear-gradient(135deg,#dfeeff,#f2f1ff,#d4f0ea)]">
        <span className="absolute left-2 top-2 h-5 w-8 rounded-full bg-white/70 blur-[5px]" />
        <span className="absolute bottom-1 right-2 h-4 w-4 rounded-full bg-[#86d9e2]/80 blur-[2px]" />
      </div>
    );
  }

  if (theme === "linen") {
    return (
      <div className="flex h-10 w-16 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#f5dfc5,#f8ead8,#d9e5cf)]">
        <span className="h-5 w-5 rounded-full bg-white/75" />
        <span className="-ml-1 h-4 w-4 rounded-full bg-[#c97945]/65" />
      </div>
    );
  }

  if (theme === "sage") {
    return (
      <div className="relative h-10 w-16 overflow-hidden rounded-[16px] bg-[linear-gradient(135deg,#dbe8ce,#f3edd6,#bed7c0)]">
        <span className="absolute left-3 top-2 h-4 w-4 rounded-full bg-white/65" />
        <span className="absolute bottom-2 right-3 h-3 w-3 rounded-full bg-[#638f66]/70" />
      </div>
    );
  }

  return (
    <div className="relative h-10 w-16 overflow-hidden rounded-[16px] bg-[linear-gradient(135deg,#0b1326,#315b9e,#ff9f6b)]">
      <span className="absolute left-3 top-2 h-5 w-5 rounded-full bg-[#ffd99d]/80 blur-[1px]" />
    </div>
  );
}

function TimeStylePreview({ style }: { style: TimeDisplayStyle }) {
  if (style === "glass") {
    return (
      <div className="theme-glass mx-auto grid h-10 w-full grid-cols-3 items-center rounded-full px-2 text-center text-[10px] font-bold">
        <span>08</span>
        <span>24</span>
        <span>16</span>
      </div>
    );
  }

  if (style === "orbits") {
    return (
      <div className="theme-glass relative mx-auto h-10 w-full overflow-hidden rounded-[18px] px-2 py-1.5">
        <div className="absolute left-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-[var(--theme-ring)]" />
        <div className="relative ml-3 flex h-full items-center justify-end gap-1 text-[10px] font-black">
          <span className="theme-primary-button rounded-full px-2 py-1">08</span>
          <span>24</span>
          <span className="theme-muted-text">16</span>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-glass mx-auto flex h-10 w-full items-center justify-between rounded-[18px] px-2 text-[10px] font-black">
      <span>08</span>
      <span className="h-px flex-1 bg-[var(--theme-ring)] opacity-45" />
      <span className="theme-primary-button rounded-full px-2 py-1">24</span>
      <span className="h-px flex-1 bg-[var(--theme-ring)] opacity-45" />
      <span>16</span>
    </div>
  );
}

function AvatarStylePreview({ style }: { style: AvatarDisplayStyle }) {
  if (style === "duo-card") {
    return (
      <div className="mx-auto flex h-12 w-20 items-center justify-center">
        <span className="theme-avatar-ring theme-avatar-surface h-9 w-9 rounded-full ring-2" />
        <span className="theme-avatar-ring theme-primary-button -ml-3 h-9 w-9 rounded-full ring-2 ring-[var(--theme-card-border)]" />
      </div>
    );
  }

  if (style === "halo") {
    return (
      <div className="mx-auto flex h-12 w-20 items-center justify-center gap-1.5">
        <span className="theme-avatar-surface h-10 w-8 rounded-[14px] border border-[var(--theme-widget-border)]" />
        <span className="theme-avatar-surface h-10 w-8 rounded-[14px] border border-[var(--theme-widget-border)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-12 w-20 items-center justify-center gap-1.5">
      <span className="theme-avatar-ring theme-avatar-surface h-9 w-9 rounded-full ring-2" />
      <span className="theme-avatar-ring theme-avatar-surface h-9 w-9 rounded-full ring-2" />
    </div>
  );
}

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
    <div className="theme-screen">
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
            className="theme-avatar-ring theme-avatar-surface relative flex h-[74px] w-[74px] shrink-0 items-center justify-center overflow-hidden rounded-full ring-2"
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
              <span className="theme-loading-overlay absolute inset-0 flex items-center justify-center text-[11px] font-semibold">
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
            className="theme-avatar-ring theme-avatar-surface relative flex h-[74px] w-[74px] shrink-0 items-center justify-center overflow-hidden rounded-full ring-2"
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
              <span className="theme-loading-overlay absolute inset-0 flex items-center justify-center text-[11px] font-semibold">
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

        <div className="theme-form-label mb-2 text-[13px]">Дата начала отношений:</div>
        <input
          type="date"
          value={current.startDateISO}
          onChange={(event) => patchDraft({ startDateISO: event.target.value })}
          className="theme-input w-full rounded-full px-4 py-3 text-[14px] outline-none"
        />

        <div className="mt-6">
          <div className="theme-form-label mb-3 text-[13px] font-semibold">Тема приложения:</div>
          <div className="space-y-3">
            {THEME_OPTIONS.map((theme) => {
              const selected = current.theme === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => patchDraft({ theme: theme.id })}
                  className={`theme-option-card w-full rounded-[24px] border px-3.5 py-3 text-left transition ${
                    selected ? "theme-option-card-selected" : ""
                  }`}
                >
                  <div className="grid grid-cols-[64px_minmax(0,1fr)_14px] items-center gap-3">
                    <ThemePreviewDots theme={theme.id} customTheme={current.customTheme} />
                    <div className="min-w-0">
                      <div className="text-[15px] font-extrabold">{theme.title}</div>
                      <div className="theme-subtle-text mt-1 text-[12px] leading-relaxed">
                        {theme.description}
                      </div>
                    </div>
                    <span
                      className={`h-3 w-3 shrink-0 rounded-full ${
                        selected ? "bg-[var(--theme-ring)]" : "bg-[var(--theme-control-border)]"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {current.theme === "custom" ? (
          <div className="theme-option-card mt-4 rounded-[24px] border px-3.5 py-4">
            <div className="text-[14px] font-extrabold">Настройка своей темы</div>
            <div className="theme-subtle-text mt-1 text-[12px] leading-relaxed">
              Эти цвета применяются ко всему интерфейсу: фону, карточкам, кнопкам и тексту.
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {CUSTOM_THEME_FIELDS.map((field) => (
                <label key={field.key} className="theme-form-label text-[12px] font-semibold">
                  {field.label}
                  <div className="theme-input mt-2 flex items-center gap-2 rounded-full px-3 py-2">
                    <input
                      type="color"
                      value={current.customTheme[field.key]}
                      onChange={(event) =>
                        patchDraft({
                          customTheme: {
                            ...current.customTheme,
                            [field.key]: event.target.value,
                          },
                        })
                      }
                      className="h-8 w-8 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0"
                    />
                    <span className="text-[12px] font-bold text-[var(--theme-input-text)]">
                      {current.customTheme[field.key]}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          <div className="theme-form-label mb-3 text-[13px] font-semibold">Блок времени:</div>
          <div className="grid grid-cols-3 gap-2">
            {TIME_STYLE_OPTIONS.map((option) => {
              const selected = current.timeDisplayStyle === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => patchDraft({ timeDisplayStyle: option.id })}
                  className={`theme-option-card rounded-[20px] border px-2 py-3 text-center transition ${
                    selected ? "theme-option-card-selected" : ""
                  }`}
                >
                  <TimeStylePreview style={option.id} />
                  <div className="mt-2 text-[11px] font-bold">{option.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <div className="theme-form-label mb-3 text-[13px] font-semibold">Фото пары:</div>
          <div className="grid grid-cols-3 gap-2">
            {AVATAR_STYLE_OPTIONS.map((option) => {
              const selected = current.avatarDisplayStyle === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => patchDraft({ avatarDisplayStyle: option.id })}
                  className={`theme-option-card rounded-[20px] border px-2 py-3 text-center transition ${
                    selected ? "theme-option-card-selected" : ""
                  }`}
                >
                  <AvatarStylePreview style={option.id} />
                  <div className="mt-2 text-[11px] font-bold">{option.title}</div>
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
