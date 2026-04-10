// src/components/pair/MainScreen.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WidgetVisual, {
  relationshipWidgetToVisualData,
} from "@/components/pair/WidgetVisual";
import useRelationshipSettings from "@/hooks/useRelationshipSettings";
import {
  calcDiff,
  format2,
  formatTogether,
  getGoalProgress,
  type RelationshipWidget,
  updateSettings,
} from "@/lib/relationship";
import TimeBox from "../ui/TimeBox";

function WidgetActions({
  widgetId,
  onDelete,
}: {
  widgetId: string;
  onDelete: (widgetId: string) => void;
}) {
  return (
    <div className="absolute right-2 top-2 z-30 flex gap-1.5">
      <Link
        href={`/widget/new?id=${widgetId}`}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-black/46 text-[15px] font-bold text-white backdrop-blur-md"
        aria-label="Изменить виджет"
      >
        ✎
      </Link>
      <button
        type="button"
        onClick={() => onDelete(widgetId)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-black/46 text-[18px] font-bold text-white backdrop-blur-md"
        aria-label="Удалить виджет"
      >
        ×
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
  return (
    <WidgetVisual
      widget={relationshipWidgetToVisualData(widget)}
      actions={isEditing ? <WidgetActions widgetId={widget.id} onDelete={onDelete} /> : null}
    />
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
          <div className="theme-avatar-ring h-[150px] w-[150px] overflow-hidden rounded-full bg-[#d9d9d9] ring-[3px]">
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
          <div className="theme-avatar-ring h-[150px] w-[150px] overflow-hidden rounded-full bg-[#d9d9d9] ring-[3px]">
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
            className="theme-primary-button h-full rounded-full"
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
