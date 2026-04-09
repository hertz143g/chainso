// src/components/pair/MainScreen.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TimeBox from "../ui/TimeBox";
import useRelationshipSettings from "@/hooks/useRelationshipSettings";
import {
  calcDiff,
  format2,
  formatDateLong,
  formatTogether,
  getGoalProgress,
  type RelationshipWidget,
  updateSettings,
} from "@/lib/relationship";

function WidgetActions({
  widgetId,
  onDelete,
}: {
  widgetId: string;
  onDelete: (widgetId: string) => void;
}) {
  return (
    <div className="absolute right-3 top-3 z-10 flex gap-2">
      <Link
        href={`/widget/new?id=${widgetId}`}
        className="rounded-full bg-black/42 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
      >
        Изменить
      </Link>
      <button
        type="button"
        onClick={() => onDelete(widgetId)}
        className="rounded-full bg-black/42 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
      >
        Удалить
      </button>
    </div>
  );
}

function WidgetCard({
  widget,
  isEditing,
  onDelete,
}: {
  widget: RelationshipWidget;
  isEditing: boolean;
  onDelete: (widgetId: string) => void;
}) {
  if (widget.type === "memory") {
    return (
      <div
        className="relative aspect-square overflow-hidden rounded-[30px] bg-cover bg-center p-4"
        style={{
          backgroundColor: widget.accentColor,
          backgroundImage: widget.imageDataUrl
            ? `linear-gradient(to top, rgba(8, 15, 33, 0.84), rgba(8, 15, 33, 0.18)), url(${widget.imageDataUrl})`
            : undefined,
        }}
      >
        {isEditing ? <WidgetActions widgetId={widget.id} onDelete={onDelete} /> : null}

        <div className="flex h-full flex-col justify-between">
          <div className="self-end rounded-full bg-black/24 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
            Момент
          </div>
          <div>
            <div className="text-[22px] font-extrabold leading-tight">{widget.title}</div>
            {widget.note ? (
              <div className="mt-1 text-[13px] text-white/76">{widget.note}</div>
            ) : null}
            {widget.dateISO ? (
              <div className="mt-3 inline-flex rounded-full bg-black/28 px-3 py-1 text-[12px] font-semibold">
                {formatDateLong(widget.dateISO)}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (widget.type === "track") {
    return (
      <div
        className="relative col-span-2 overflow-hidden rounded-[30px] p-4"
        style={{ backgroundColor: widget.accentColor }}
      >
        {isEditing ? <WidgetActions widgetId={widget.id} onDelete={onDelete} /> : null}

        <div className="flex items-center gap-4">
          <div className="flex h-[96px] w-[96px] shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-black/25 text-[28px]">
            {widget.coverDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={widget.coverDataUrl}
                alt={`${widget.artist} — ${widget.title}`}
                className="h-full w-full object-cover"
              />
            ) : (
              "♪"
            )}
          </div>
          <div className="min-w-0 pr-2">
            <div className="truncate text-[23px] font-extrabold">{widget.title}</div>
            <div className="mt-1 text-[18px] font-semibold text-white/90">{widget.artist}</div>
            {widget.note ? (
              <div className="mt-2 text-[13px] text-white/76">{widget.note}</div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative col-span-2 min-h-[230px] overflow-hidden rounded-[32px] bg-cover bg-center p-5"
      style={{
        backgroundColor: widget.accentColor,
        backgroundImage: widget.imageDataUrl
          ? `linear-gradient(to top, rgba(8, 15, 33, 0.86), rgba(8, 15, 33, 0.18)), url(${widget.imageDataUrl})`
          : undefined,
      }}
    >
      {isEditing ? <WidgetActions widgetId={widget.id} onDelete={onDelete} /> : null}

      <div className="flex h-full min-h-[190px] flex-col justify-between">
        <div className="max-w-[70%]">
          <div className="text-[26px] font-extrabold leading-tight">{widget.title}</div>
          {widget.subtitle ? (
            <div className="mt-2 text-[14px] text-white/76">{widget.subtitle}</div>
          ) : null}
        </div>
        <div className="self-end rounded-full bg-black/28 px-4 py-2 text-[13px] font-semibold">
          {formatDateLong(widget.dateISO)}
        </div>
      </div>
    </div>
  );
}

export default function MainScreen() {
  const settings = useRelationshipSettings();
  const [now, setNow] = useState(() => new Date());
  const [isEditingWidgets, setIsEditingWidgets] = useState(false);

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

  return (
    <div className="text-white">
      <div className="relative h-[52px]">
        <div className="absolute left-0 top-3">
          <button
            type="button"
            onClick={() => setIsEditingWidgets((value) => !value)}
            className={`flex h-[38px] w-[38px] items-center justify-center rounded-full border ${
              isEditingWidgets ? "border-[#4AA7FF] bg-[#4AA7FF]/16" : "border-white/18 bg-white/6"
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
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-white/18 bg-white/6"
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
        <div className="text-[17px] leading-none opacity-85">{diff.days} ДНЕЙ</div>

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

      <div className="mt-0 flex justify-center gap-6">
        <div className="flex flex-col items-center">
          <div className="h-[150px] w-[150px] overflow-hidden rounded-full bg-[#d9d9d9] ring-[3px] ring-[#36A2FF]">
            {settings.photo1DataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.photo1DataUrl}
                alt={settings.name1}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="mt-3 text-[18px] font-semibold">{settings.name1}</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="h-[150px] w-[150px] overflow-hidden rounded-full bg-[#d9d9d9] ring-[3px] ring-[#36A2FF]">
            {settings.photo2DataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.photo2DataUrl}
                alt={settings.name2}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="mt-3 text-[18px] font-semibold">{settings.name2}</div>
        </div>
      </div>

      <div className="mt-7">
        <div className="flex justify-end pr-1 text-[13px] font-semibold opacity-85">
          {progress.percent}%
        </div>

        <div className="mt-2 h-[10px] overflow-hidden rounded-full bg-white/90">
          <div
            className="h-full rounded-full bg-[#3F86FF]"
            style={{ width: `${progress.bar}%` }}
          />
        </div>

        <div className="mt-2 flex justify-between px-1 text-[13px] font-normal opacity-80">
          <div>{progress.goal} дней</div>
          <div>{progress.leftDays} дня осталось</div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="text-[22px] font-semibold text-white/55">Вместе уже:</div>
        <div className="mt-1 text-[28px] font-semibold leading-tight">
          {formatTogether(diff.years, diff.months, diff.day)}
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <div className="flex gap-2 rounded-[33px] bg-black/30 px-5 py-4">
          <TimeBox value={format2(diff.hours)} label="часов" />
          <TimeBox value={format2(diff.minutes)} label="минут" />
          <TimeBox value={format2(diff.seconds)} label="секунд" />
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <div className="text-[30px] font-extrabold">Виджеты</div>
        {isEditingWidgets ? (
          <div className="rounded-full border border-[#4AA7FF]/60 bg-[#4AA7FF]/14 px-3 py-1 text-[12px] font-semibold text-white/90">
            Режим редактирования
          </div>
        ) : null}
      </div>

      {settings.widgets.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {settings.widgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              isEditing={isEditingWidgets}
              onDelete={onDeleteWidget}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[28px] border-2 border-dashed border-white/45 px-5 py-8 text-center text-[15px] text-white/72">
          Пока нет виджетов. Добавь первый, и здесь появится ваша история.
        </div>
      )}

      <Link
        href="/widget/new"
        className="mt-6 block rounded-[28px] border-2 border-dashed border-white/70 py-4 text-center text-[16px] font-normal text-white/90"
      >
        + добавить виджет
      </Link>

      <div className="mt-10 text-center text-[28px] font-extrabold">Альбом</div>

      <div className="mt-6 rounded-[28px] border-2 border-dashed border-white/55 py-4 text-center text-[16px] font-normal text-white/80">
        Дата событие
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {["фото", "фото", "фото"].map((item, index) => (
          <div
            key={index}
            className="flex aspect-square items-center justify-center rounded-[28px] border-2 border-dashed border-white/55 text-[14px] font-normal text-white/70"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="h-10" />
    </div>
  );
}
