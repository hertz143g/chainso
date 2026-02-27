// src/components/pair/MainScreen.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TimeBox from "../ui/TimeBox";
import { calcDiff, format2, loadSettings } from "@/lib/relationship";

export default function MainScreen() {
  const [settings, setSettings] = useState(() => loadSettings());
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onFocus = () => setSettings(loadSettings());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const diff = useMemo(() => calcDiff(settings.startDateISO, now), [settings.startDateISO, now]);

  return (
    <div className="text-white">
      {/* TOP BAR */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-[18px] opacity-90">📌</div>
        <div className="text-[22px] font-extrabold tracking-wide">CHAINSO</div>
        <Link href="/settings" className="text-[18px] opacity-90 select-none">
          ⚙️
        </Link>
      </div>

      {/* DAYS + HEART */}
      <div className="mt-7 flex flex-col items-center">
        <div className="text-[16px] font-medium opacity-85">{diff.days} ДНЕЙ</div>
        <div className="mt-2 text-[34px] leading-none opacity-85">♡</div>
      </div>

      {/* AVATARS (как у тебя: большие круги) */}
      <div className="mt-6 flex justify-center gap-4">
        {/* left */}
        <div className="flex flex-col items-center">
          <div className="w-[150px] h-[150px] rounded-full ring-[3px] ring-[#36A2FF] overflow-hidden bg-[#d9d9d9]">
            {settings.photo1DataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.photo1DataUrl}
                alt="avatar1"
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <div className="mt-3 text-[20px] font-extrabold">{settings.name1}</div>
        </div>

        {/* right */}
        <div className="flex flex-col items-center">
          <div className="w-[150px] h-[150px] rounded-full ring-[3px] ring-[#36A2FF] overflow-hidden bg-[#d9d9d9]">
            {settings.photo2DataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.photo2DataUrl}
                alt="avatar2"
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <div className="mt-3 text-[20px] font-extrabold">{settings.name2}</div>
        </div>
      </div>

      {/* PROGRESS (как на твоём: проценты справа сверху, подписи снизу) */}
      <div className="mt-7">
        <div className="flex justify-end text-[14px] font-bold opacity-85 pr-1">90%</div>
        <div className="mt-2 h-[10px] rounded-full bg-white/90 overflow-hidden">
          <div className="h-full bg-[#3F86FF] w-[90%] rounded-full" />
        </div>
        <div className="mt-2 flex justify-between text-[14px] opacity-80 px-1">
          <div>700 дней</div>
          <div>64 дня осталось</div>
        </div>
      </div>

      {/* TOGETHER */}
      <div className="mt-8 text-center">
        <div className="text-[18px] font-semibold opacity-60">Вместе уже:</div>
        <div className="mt-3 text-[28px] font-extrabold leading-tight">
          {diff.years} год, {diff.months} месяцев, {diff.day} дней
        </div>
      </div>

      {/* TIMER PLATE (как у тебя: тёмная плашка + 3 большие кнопки) */}
      <div className="mt-6 flex justify-center">
        <div className="bg-black/30 rounded-[26px] px-4 py-4 flex gap-3">
          <TimeBox value={format2(diff.hours)} label="часов" />
          <TimeBox value={format2(diff.minutes)} label="минут" />
          <TimeBox value={format2(diff.seconds)} label="секунд" />
        </div>
      </div>

      {/* WIDGETS TITLE */}
      <div className="mt-10 text-center text-[34px] font-extrabold">Виджеты</div>

      {/* FIRST MEET CARD */}
      <div className="mt-6 bg-[#4A86E8] rounded-[34px] px-6 py-6">
        <div className="text-center text-[22px] font-extrabold">Первая встреча</div>
        <div className="mt-20 text-center text-[22px] font-extrabold">
          9 февраля 2024 года
        </div>
      </div>

      {/* TRACK CARD */}
      <div className="mt-6 bg-[#4A86E8] rounded-[34px] p-5 flex items-center gap-5">
        <div className="w-[92px] h-[92px] rounded-[26px] overflow-hidden bg-black">
          {/* если захочешь — сюда можно вставить обложку */}
        </div>
        <div>
          <div className="text-[22px] font-extrabold">Любимый трек</div>
          <div className="text-[18px] font-medium opacity-95">Джизус - Верь</div>
        </div>
      </div>

      {/* ADD WIDGET */}
      <Link
        href="/widget/new"
        className="mt-6 block text-center border-2 border-dashed border-white/70 rounded-[28px] py-4 text-[16px] font-medium opacity-90"
      >
        + добавить виджет
      </Link>

      {/* ALBUM */}
      <div className="mt-10 text-center text-[28px] font-extrabold">Альбом</div>

      <div className="mt-6 border-2 border-dashed border-white/55 rounded-[28px] py-4 text-center text-[16px] opacity-80">
        Дата событие
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {["фото", "фото", "фото"].map((t, i) => (
          <div
            key={i}
            className="aspect-square border-2 border-dashed border-white/55 rounded-[28px] flex items-center justify-center text-[14px] opacity-70"
          >
            {t}
          </div>
        ))}
      </div>

      <div className="h-10" />
    </div>
  );
}