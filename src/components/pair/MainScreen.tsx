// src/components/pair/MainScreen.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import WidgetVisual, {
  relationshipWidgetToVisualData,
} from "@/components/pair/WidgetVisual";
import useRelationshipSettings from "@/hooks/useRelationshipSettings";
import {
  calcDiff,
  createWidgetId,
  format2,
  formatDateLong,
  formatTogether,
  getGoalProgress,
  type AvatarDisplayStyle,
  type RelationshipWidget,
  type TimeDisplayStyle,
  updateSettings,
} from "@/lib/relationship";
import { prepareImageForStorage } from "@/lib/widgetAppearance";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function WidgetActions({
  widgetId,
  index,
  total,
  onDelete,
  onMove,
}: {
  widgetId: string;
  index: number;
  total: number;
  onDelete: (widgetId: string) => void;
  onMove: (widgetId: string, direction: -1 | 1) => void;
}) {
  return (
    <div className="absolute right-2 top-2 z-30 flex flex-wrap justify-end gap-1.5">
      <button
        type="button"
        onClick={() => onMove(widgetId, -1)}
        disabled={index === 0}
        className="theme-icon-button flex h-8 w-8 items-center justify-center rounded-full border text-[15px] font-bold disabled:opacity-35"
        aria-label="Переместить виджет выше"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => onMove(widgetId, 1)}
        disabled={index === total - 1}
        className="theme-icon-button flex h-8 w-8 items-center justify-center rounded-full border text-[15px] font-bold disabled:opacity-35"
        aria-label="Переместить виджет ниже"
      >
        ↓
      </button>
      <Link
        href={`/widget/new?id=${widgetId}`}
        className="theme-icon-button flex h-8 w-8 items-center justify-center rounded-full border text-[15px] font-bold"
        aria-label="Изменить виджет"
      >
        ✎
      </Link>
      <button
        type="button"
        onClick={() => onDelete(widgetId)}
        className="theme-icon-button flex h-8 w-8 items-center justify-center rounded-full border text-[18px] font-bold"
        aria-label="Удалить виджет"
      >
        ×
      </button>
    </div>
  );
}

function WidgetCard({
  widget,
  index,
  total,
  isEditing,
  onDelete,
  onMove,
}: {
  widget: RelationshipWidget;
  index: number;
  total: number;
  isEditing: boolean;
  onDelete: (widgetId: string) => void;
  onMove: (widgetId: string, direction: -1 | 1) => void;
}) {
  return (
    <WidgetVisual
      widget={relationshipWidgetToVisualData(widget)}
      actions={
        isEditing ? (
          <WidgetActions
            widgetId={widget.id}
            index={index}
            total={total}
            onDelete={onDelete}
            onMove={onMove}
          />
        ) : null
      }
    />
  );
}

function CoupleAvatar({
  name,
  photoDataUrl,
  style,
}: {
  name: string;
  photoDataUrl?: string;
  style: AvatarDisplayStyle;
}) {
  const image = photoDataUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photoDataUrl} alt={name} className="h-full w-full object-cover" />
  ) : null;

  if (style === "duo-card") {
    return (
      <div className="flex w-[158px] flex-col items-center">
        <div className="theme-glass w-[154px] rounded-[34px] p-2.5 shadow-[0_18px_48px_var(--theme-shadow)] backdrop-blur-md">
          <div className="theme-avatar-ring theme-avatar-surface aspect-[5/6] w-full overflow-hidden rounded-[26px] ring-2">
            {image}
          </div>
          <div className="mt-2 truncate text-center text-[16px] font-extrabold leading-tight">
            {name}
          </div>
        </div>
      </div>
    );
  }

  if (style === "halo") {
    return (
      <div className="flex w-[158px] flex-col items-center">
        <div className="theme-glass w-[154px] rounded-[34px] p-2.5 shadow-[0_18px_48px_var(--theme-shadow)] backdrop-blur-md">
          <div className="theme-avatar-ring theme-avatar-surface aspect-[5/6] w-full overflow-hidden rounded-[26px] ring-2">
            {image}
          </div>
          <div className="mt-2 truncate text-center text-[16px] font-extrabold leading-tight">
            {name}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-[156px] flex-col items-center">
      <div className="theme-avatar-ring theme-avatar-surface h-[156px] w-[156px] overflow-hidden rounded-full ring-[3px]">
        {image}
      </div>
      <div className="mt-3 text-[18px] font-semibold">{name}</div>
    </div>
  );
}

function CoupleCameo({
  name1,
  name2,
  photo1DataUrl,
  photo2DataUrl,
}: {
  name1: string;
  name2: string;
  photo1DataUrl?: string;
  photo2DataUrl?: string;
}) {
  return (
    <div className="relative w-full pb-2 pt-3">
      <div className="relative mx-auto flex w-[316px] items-center justify-center">
        <div className="theme-avatar-ring theme-avatar-surface relative z-20 h-[176px] w-[176px] overflow-hidden rounded-full ring-[4px] shadow-[0_18px_46px_var(--theme-shadow)]">
          {photo1DataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo1DataUrl} alt={name1} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="theme-avatar-ring theme-avatar-surface relative z-10 -ml-8 h-[176px] w-[176px] overflow-hidden rounded-full ring-[4px] shadow-[0_18px_46px_var(--theme-shadow)]">
          {photo2DataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo2DataUrl} alt={name2} className="h-full w-full object-cover" />
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex justify-center">
        <div className="theme-glass rounded-full px-5 py-2 text-[17px] font-extrabold shadow-[0_12px_30px_var(--theme-shadow)] backdrop-blur-md">
          {name1} · {name2}
        </div>
      </div>
    </div>
  );
}

function TimeDisplay({
  style,
  hours,
  minutes,
  seconds,
}: {
  style: TimeDisplayStyle;
  hours: string;
  minutes: string;
  seconds: string;
}) {
  const units = [
    { value: hours, label: "часов", shortLabel: "ч", max: 24 },
    { value: minutes, label: "минут", shortLabel: "м", max: 60 },
    { value: seconds, label: "секунд", shortLabel: "с", max: 60 },
  ].map((unit) => {
    const numericValue = Number(unit.value);
    const fill = Number.isFinite(numericValue)
      ? Math.min(100, Math.max(0, (numericValue / unit.max) * 100))
      : 0;

    return { ...unit, fill };
  });

  if (style === "glass") {
    return (
      <div className="theme-time-tray grid w-full grid-cols-3 rounded-[30px] px-4 py-4 text-center">
        {units.map((unit, index) => (
          <div
            key={unit.label}
            className={cx(index > 0 && "border-l border-[var(--theme-card-border)]")}
          >
            <div className="text-[30px] font-extrabold leading-none">{unit.value}</div>
            <div className="theme-muted-text mt-1 text-[12px] font-semibold">{unit.label}</div>
          </div>
        ))}
      </div>
    );
  }

  if (style === "orbits") {
    const secondsAngle = Number(seconds) * 6;

    return (
      <div className="theme-time-tray relative min-h-[142px] w-full overflow-hidden rounded-[38px] p-4">
        <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[var(--theme-primary)] opacity-10 blur-2xl" />
        <div className="relative z-10 grid h-full grid-cols-[minmax(0,1fr)_104px] items-center gap-4">
          <div className="grid min-w-0 grid-cols-2 gap-3">
            <div className="theme-glass rounded-[24px] px-3 py-4 text-center">
              <div className="text-[42px] font-black leading-none tracking-[-0.07em]">
                {hours}
              </div>
              <div className="theme-muted-text mt-2 text-[11px] font-bold uppercase tracking-[0.12em]">
                часы
              </div>
            </div>
            <div className="theme-glass rounded-[24px] px-3 py-4 text-center">
              <div className="text-[42px] font-black leading-none tracking-[-0.07em]">
                {minutes}
              </div>
              <div className="theme-muted-text mt-2 text-[11px] font-bold uppercase tracking-[0.12em]">
                минуты
              </div>
            </div>
          </div>

          <div
            className="flex h-[104px] w-[104px] items-center justify-center rounded-full p-2 shadow-[0_16px_42px_var(--theme-shadow)]"
            style={
              {
                background: `conic-gradient(var(--theme-primary) ${secondsAngle}deg, var(--theme-control-bg) 0deg)`,
              } as CSSProperties
            }
          >
            <div className="theme-glass relative flex h-full w-full flex-col items-center justify-center rounded-full">
              <span className="absolute h-5 w-5 rounded-full bg-[var(--theme-primary)] opacity-25 blur-md" />
              <span className="absolute h-3 w-3 animate-ping rounded-full bg-[var(--theme-primary)] opacity-30" />
              <div className="text-[30px] font-black leading-none">{seconds}</div>
              <div className="theme-muted-text mt-1 text-[10px] font-bold uppercase tracking-[0.14em]">
                сек
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-time-tray relative min-h-[148px] w-full overflow-hidden rounded-[38px] px-4 py-4">
      <div className="absolute inset-x-8 top-4 h-px bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent opacity-35" />
      <div className="relative z-10 grid grid-cols-3 gap-3 text-center">
        {units.map((unit, index) => (
          <div
            key={unit.label}
            className="time-liquid-cell theme-glass group relative min-w-0 overflow-hidden rounded-[30px] px-2 py-4 transition duration-300 hover:-translate-y-1 active:scale-[0.98]"
            style={
              {
                "--fill": `${unit.fill}%`,
                "--liquid-delay": `${index * -0.72}s`,
              } as CSSProperties
            }
          >
            <div className="time-liquid-fill">
              <span className="time-liquid-wave time-liquid-wave-a" />
              <span className="time-liquid-wave time-liquid-wave-b" />
              <span className="time-liquid-glow" />
              <span className="time-liquid-bubble left-[20%] h-1.5 w-1.5" />
              <span
                className="time-liquid-bubble left-[52%] h-2 w-2"
                style={{ animationDelay: `${index * -0.72 - 1.1}s` }}
              />
              <span
                className="time-liquid-bubble left-[74%] h-1 w-1"
                style={{ animationDelay: `${index * -0.72 - 2.2}s` }}
              />
            </div>
            <div className="absolute inset-x-3 bottom-3 z-10 h-1.5 overflow-hidden rounded-full bg-[var(--theme-control-bg)]">
              <span
                className="block h-full rounded-full bg-[var(--theme-primary)] transition-[width] duration-700 ease-out"
                style={{ width: `${unit.fill}%` }}
              />
            </div>
            <div className="relative z-10 text-[33px] font-black leading-none tracking-[-0.05em]">
              {unit.value}
            </div>
            <div className="theme-muted-text relative z-10 mt-2 text-[10px] font-bold uppercase tracking-[0.12em]">
              {unit.label}
            </div>
            <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-full border border-[var(--theme-card-border)] px-1.5 py-0.5 text-[9px] font-black text-[var(--theme-text-muted)]">
              {unit.shortLabel}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MainScreen() {
  const settings = useRelationshipSettings();
  const albumInputRef = useRef<HTMLInputElement>(null);
  const [now, setNow] = useState(() => new Date());
  const [isEditingWidgets, setIsEditingWidgets] = useState(false);
  const [isUploadingAlbum, setIsUploadingAlbum] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { diff, progress } = useMemo(() => {
    const currentDiff = calcDiff(settings.startDateISO, now);

    return {
      diff: currentDiff,
      progress: getGoalProgress(currentDiff.days),
    };
  }, [settings.startDateISO, now]);

  const onDeleteWidget = (widgetId: string) => {
    if (typeof window !== "undefined") {
      const shouldDelete = window.confirm("Удалить этот виджет?");
      if (!shouldDelete) return;
    }

    updateSettings((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((widget) => widget.id !== widgetId),
    }));
  };

  const onMoveWidget = (widgetId: string, direction: -1 | 1) => {
    updateSettings((prev) => {
      const currentIndex = prev.widgets.findIndex((widget) => widget.id === widgetId);
      if (currentIndex < 0) return prev;

      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= prev.widgets.length) return prev;

      const widgets = [...prev.widgets];
      const [movedWidget] = widgets.splice(currentIndex, 1);
      if (!movedWidget) return prev;

      widgets.splice(nextIndex, 0, movedWidget);

      return {
        ...prev,
        widgets,
      };
    });
  };

  const onPickAlbumPhotos = () => {
    albumInputRef.current?.click();
  };

  const onAlbumPhotosChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";

    if (files.length === 0) return;

    setIsUploadingAlbum(true);

    try {
      const photos = await Promise.all(
        files.map(async (file) => ({
          id: createWidgetId(),
          imageDataUrl: await prepareImageForStorage(file, {
            maxDimension: 980,
            quality: 0.82,
            targetLength: 520_000,
          }),
          createdAtISO: new Date().toISOString(),
        })),
      );

      updateSettings((prev) => ({
        ...prev,
        albumPhotos: [...photos, ...prev.albumPhotos],
      }));
    } catch {
      window.alert("Не удалось добавить фото в альбом. Попробуй выбрать другое изображение.");
    } finally {
      setIsUploadingAlbum(false);
    }
  };

  const onDeleteAlbumPhoto = (photoId: string) => {
    updateSettings((prev) => ({
      ...prev,
      albumPhotos: prev.albumPhotos.filter((photo) => photo.id !== photoId),
    }));
  };

  const albumDateLabel =
    settings.albumPhotos.length > 0
      ? formatDateLong(settings.albumPhotos[0]?.createdAtISO.slice(0, 10) ?? settings.startDateISO)
      : "Добавь первые фото";

  return (
    <div className="theme-screen">
      <div className="relative h-[52px]">
        <div className="absolute left-0 top-3">
          <button
            type="button"
            onClick={() => setIsEditingWidgets((value) => !value)}
            className={`theme-icon-button flex h-[38px] w-[38px] items-center justify-center rounded-full border ${
              isEditingWidgets ? "theme-icon-button-active" : ""
            }`}
            aria-label="Переключить режим редактирования виджетов"
          >
            <Image
              src="/icons/brush.png"
              alt="brush"
              width={18}
              height={18}
              className="opacity-90"
            />
          </button>
        </div>

        <div className="absolute left-1/2 top-4 -translate-x-1/2">
          <span className="text-[28px] font-extrabold leading-none">CHAINSO</span>
        </div>

        <div className="absolute right-0 top-3">
          <Link
            href="/settings"
            className="theme-icon-button flex h-[38px] w-[38px] items-center justify-center rounded-full border"
            aria-label="Открыть настройки"
          >
            <Image
              src="/icons/gear.png"
              alt="settings"
              width={18}
              height={18}
              className="opacity-90"
            />
          </Link>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center">
        <div className="theme-subtle-text text-[17px] font-semibold leading-none">
          {diff.days} ДНЕЙ
        </div>

        <div className="mt-1">
          <Image
            src="/icons/heart.png"
            alt="heart"
            width={30}
            height={30}
            className="opacity-80"
          />
        </div>
      </div>

      <div className="mt-0 flex justify-center gap-4">
        {settings.avatarDisplayStyle === "duo-card" ? (
          <CoupleCameo
            name1={settings.name1}
            name2={settings.name2}
            photo1DataUrl={settings.photo1DataUrl}
            photo2DataUrl={settings.photo2DataUrl}
          />
        ) : (
          <>
            <CoupleAvatar
              name={settings.name1}
              photoDataUrl={settings.photo1DataUrl}
              style={settings.avatarDisplayStyle}
            />
            <CoupleAvatar
              name={settings.name2}
              photoDataUrl={settings.photo2DataUrl}
              style={settings.avatarDisplayStyle}
            />
          </>
        )}
      </div>

      <div className="mt-7">
        <div className="theme-subtle-text flex justify-end pr-1 text-[13px] font-semibold">
          {progress.percent}%
        </div>

        <div className="theme-progress-track mt-2 h-[10px] overflow-hidden rounded-full">
          <div
            className="theme-primary-button h-full rounded-full"
            style={{ width: `${progress.bar}%` }}
          />
        </div>

        <div className="theme-subtle-text mt-2 flex justify-between px-1 text-[13px] font-normal">
          <div>{progress.goal} дней</div>
          <div>{progress.leftDays} дня осталось</div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="theme-subtle-text text-[22px] font-semibold">Вместе уже:</div>
        <div className="mt-1 text-[28px] font-semibold leading-tight">
          {formatTogether(diff.years, diff.months, diff.day)}
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <TimeDisplay
          style={settings.timeDisplayStyle}
          hours={format2(diff.hours)}
          minutes={format2(diff.minutes)}
          seconds={format2(diff.seconds)}
        />
      </div>

      <div className="mt-7 flex items-center justify-between">
        <div className="text-[30px] font-extrabold">Виджеты</div>
        {isEditingWidgets ? (
          <div className="theme-action-chip rounded-full border px-3 py-1 text-[12px] font-semibold">
            Режим редактирования
          </div>
        ) : null}
      </div>

      {settings.widgets.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {settings.widgets.map((widget, index) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              index={index}
              total={settings.widgets.length}
              isEditing={isEditingWidgets}
              onDelete={onDeleteWidget}
              onMove={onMoveWidget}
            />
          ))}
        </div>
      ) : (
        <div className="theme-dashed-card mt-6 rounded-[28px] border-2 border-dashed px-5 py-8 text-center text-[15px]">
          Пока нет виджетов. Добавь первый, и здесь появится ваша история.
        </div>
      )}

      <Link
        href="/widget/new"
        className="theme-dashed-card-strong mt-6 block rounded-[28px] border-2 border-dashed py-4 text-center text-[16px] font-semibold"
      >
        + добавить виджет
      </Link>

      <div className="mt-10 flex items-center justify-between">
        <div className="text-[28px] font-extrabold">Альбом</div>
        <button
          type="button"
          onClick={onPickAlbumPhotos}
          disabled={isUploadingAlbum}
          className="theme-action-chip rounded-full border px-3 py-1.5 text-[12px] font-bold disabled:opacity-55"
        >
          {isUploadingAlbum ? "Загрузка..." : "+ фото"}
        </button>
      </div>

      <div className="theme-dashed-card mt-5 rounded-[28px] border-2 border-dashed px-4 py-3 text-center text-[15px] font-semibold">
        {albumDateLabel}
      </div>

      {settings.albumPhotos.length > 0 ? (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {settings.albumPhotos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-[24px] shadow-[0_14px_34px_var(--theme-shadow)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.imageDataUrl}
                alt="Фото из альбома"
                className="h-full w-full object-cover"
              />
              {isEditingWidgets ? (
                <button
                  type="button"
                  onClick={() => onDeleteAlbumPhoto(photo.id)}
                  className="theme-icon-button absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border text-[16px] font-bold"
                  aria-label="Удалить фото из альбома"
                >
                  ×
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {["фото", "фото", "фото"].map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={onPickAlbumPhotos}
              className="theme-dashed-card flex aspect-square items-center justify-center rounded-[24px] border-2 border-dashed text-[14px] font-normal"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      <input
        ref={albumInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onAlbumPhotosChange}
      />

      <div className="h-10" />
    </div>
  );
}
