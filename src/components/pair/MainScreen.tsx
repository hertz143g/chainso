// src/components/pair/MainScreen.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TimeBox from "../ui/TimeBox";
import { calcDiff, format2, loadSettings } from "@/lib/relationship";

export default function MainScreen() {
  const [settings, setSettings] = useState(() => loadSettings());
  const [now, setNow] = useState(() => new Date());

  // Обновляем время каждую секунду
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Подхватываем изменения настроек после возврата со страницы settings
  useEffect(() => {
    const onFocus = () => setSettings(loadSettings());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const diff = useMemo(() => calcDiff(settings.startDateISO, now), [settings.startDateISO, now]);

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center text-white">
        <span>📌</span>
        <span className="font-semibold text-[14px] tracking-wide">CHAINSO</span>
        <Link href="/settings" className="select-none">
          ⚙️
        </Link>
      </div>

      {/* Days + heart */}
<div className="mt-6 text-center text-white translate-y-[18px]">
  <div className="text-[12px] opacity-80 translate-y-[15px]">{diff.days} ДНЕЙ</div>
  <div className="text-[18px] translate-y-[10px]">♡</div>
</div>

      {/* Avatars */}
      <div className="mt-4 flex justify-center gap-4">
        <div className="flex flex-col items-center">
          <div className="w-[82px] h-[82px] rounded-full ring-2 ring-[#4aa7ff] overflow-hidden bg-gray-300">
            {settings.photo1DataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.photo1DataUrl}
                alt="avatar1"
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <span className="text-white text-[11px] mt-2">{settings.name1}</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-[82px] h-[82px] rounded-full ring-2 ring-[#4aa7ff] overflow-hidden bg-gray-300">
            {settings.photo2DataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.photo2DataUrl}
                alt="avatar2"
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <span className="text-white text-[11px] mt-2">{settings.name2}</span>
        </div>
      </div>

      {/* Progress (как в макете — пока статично) */}
      <div className="mt-4 text-[10px] text-white/70 flex justify-between">
        <span>709 дней</span>
        <span>90%</span>
      </div>
      <div className="h-[6px] bg-white/20 rounded-full overflow-hidden mt-1">
        <div className="bg-[#4aa7ff] h-full w-[90%]" />
      </div>
      <div className="text-[10px] text-white/70 text-right mt-1">64 дня осталось</div>

      {/* Together */}
      <div className="mt-4 text-center text-white/70 text-[10px]">Вместе уже:</div>
      <div className="text-center text-white font-semibold text-[12px] mt-1">
        {diff.years} год, {diff.months} месяцев, {diff.day} дней
      </div>

      {/* Timer (динамика каждую секунду) */}
      <div className="flex justify-center gap-2 mt-3">
        <TimeBox value={format2(diff.hours)} label="часов" />
        <TimeBox value={format2(diff.minutes)} label="минут" />
        <TimeBox value={format2(diff.seconds)} label="секунд" />
      </div>

      {/* Widgets */}
      <div className="mt-5 text-center text-white font-semibold text-[14px]">Виджеты</div>

      <div className="mt-3 bg-[#4a84e0] rounded-[16px] px-4 py-5 text-white">
        <div className="text-[12px] font-semibold">Первая встреча</div>
        <div className="mt-6 text-center text-[12px] font-semibold">9 февраля 2024 года</div>
      </div>

      <div className="mt-3 bg-[#4a84e0] rounded-[16px] p-3 text-white flex gap-3">
        <div className="w-[48px] h-[48px] rounded-[12px] bg-black" />
        <div>
          <div className="text-[12px] font-semibold">Любимый трек</div>
          <div className="text-[10px] opacity-90">Джизус - Верь</div>
        </div>
      </div>

      <Link
        href="/widget/new"
        className="mt-3 block w-full border border-dashed border-white/60 rounded-[16px] py-2 text-white/80 text-[11px] text-center"
      >
        + добавить виджет
      </Link>

      {/* Album */}
      <div className="mt-5 text-center text-white font-semibold text-[14px]">Альбом</div>

      <div className="mt-3 border border-dashed border-white/60 rounded-[16px] py-2 text-center text-white/70 text-[11px]">
        Дата событие
      </div>

      <div className="mt-3 flex gap-2">
        {["фото", "фото", "фото"].map((p, i) => (
          <div
            key={i}
            className="flex-1 aspect-square border border-dashed border-white/60 rounded-[16px] text-white/60 flex items-center justify-center text-[10px]"
          >
            {p}
          </div>
        ))}
      </div>
    </>
  );
}