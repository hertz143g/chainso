// src/components/pair/MainScreen.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TimeBox from "../ui/TimeBox";
import { calcDiff, format2, loadSettings, formatTogether } from "@/lib/relationship";

export default function MainScreen() {
  const [settings, setSettings] = useState(() => loadSettings());
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onFocus = () => setSettings(loadSettings());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const diff = useMemo(
    () => calcDiff(settings.startDateISO, now),
    [settings.startDateISO, now]
  );

  return (
    <div className="text-white">
      {/* ================= TOP BAR ================= */}
<div className="relative h-[52px]">
  <div className="absolute left-0 top-4 w-[44px] flex justify-start">
    <img
      src="/icons/brush.png"
      alt="brush"
      width={18}
      height={18}
      className="opacity-90"
    />
  </div>

  <div className="absolute left-1/2 top-4 -translate-x-1/2">
    <span className="text-[28px] font-extrabold leading-none">
      CHAINSO
    </span>
  </div>

  <div className="absolute right-0 top-4 w-[44px] flex justify-end">
    <Link href="/settings">
      <img
        src="/icons/gear.png"
        alt="settings"
        width={18}
        height={18}
        className="opacity-90"
      />
    </Link>
  </div>
</div>

      {/* ================= DAYS + HEART (плотнее и выше) ================= */}
<div className="mt-5 flex flex-col items-center">
  <div className="text-[17px] opacity-85 leading-none">
    {diff.days} ДНЕЙ
  </div>

  <div className="mt-1">
    <img
      src="/icons/heart.png"
      alt="heart"
      width={30}
      height={30}
      className="opacity-80"
    />
  </div>
</div>

      {/* ================= AVATARS (подтянуть ближе) ================= */}
      <div className="mt-0 flex justify-center gap-6">
        {/* Left */}
        <div className="flex flex-col items-center">
          <div className="w-[150px] h-[150px] rounded-full ring-[3px] ring-[#36A2FF] overflow-hidden bg-[#d9d9d9]">
            {settings.photo1DataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.photo1DataUrl}
                alt="avatar1"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="mt-3 text-[18px] font-semibold">{settings.name1}</div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-center">
          <div className="w-[150px] h-[150px] rounded-full ring-[3px] ring-[#36A2FF] overflow-hidden bg-[#d9d9d9]">
            {settings.photo2DataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.photo2DataUrl}
                alt="avatar2"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="mt-3 text-[18px] font-semibold">{settings.name2}</div>
        </div>
      </div>

      {/* ================= PROGRESS ================= */}
      <div className="mt-7">
        <div className="flex justify-end text-[13px] font-semibold opacity-85 pr-1">
          90%
        </div>

        <div className="mt-2 h-[10px] rounded-full bg-white/90 overflow-hidden">
          <div className="h-full bg-[#3F86FF] w-[90%] rounded-full" />
        </div>

        <div className="mt-2 flex justify-between text-[13px] font-normal opacity-80 px-1">
          <div>700 дней</div>
          <div>64 дня осталось</div>
        </div>
      </div>

      {/* ================= TOGETHER ================= */}
      <div className="mt-8 text-center">
        <div className="text-[18px] font-semibold text-white/55">Вместе уже:</div>
        <div className="mt-3 text-[24px] font-semibold leading-tight">
          {formatTogether(diff.years, diff.months, diff.day)}
        </div>
      </div>

      {/* ================= TIMER ================= */}
      <div className="mt-6 flex justify-center">
        <div className="bg-black/30 rounded-[26px] px-4 py-4 flex gap-3">
          <TimeBox value={format2(diff.hours)} label="часов" />
          <TimeBox value={format2(diff.minutes)} label="минут" />
          <TimeBox value={format2(diff.seconds)} label="секунд" />
        </div>
      </div>

      {/* ================= WIDGETS ================= */}
      <div className="mt-10 text-center text-[34px] font-extrabold">Виджеты</div>

      <div className="mt-6 bg-[#4A86E8] rounded-[34px] px-6 py-6">
        <div className="text-center text-[22px] font-extrabold">Первая встреча</div>
        <div className="mt-20 text-center text-[22px] font-extrabold">
          9 февраля 2024 года
        </div>
      </div>

      <div className="mt-6 bg-[#4A86E8] rounded-[34px] p-5 flex items-center gap-5">
        <div className="w-[92px] h-[92px] rounded-[26px] overflow-hidden bg-black" />
        <div>
          <div className="text-[22px] font-extrabold">Любимый трек</div>
          <div className="text-[18px] font-semibold text-white/90">Джизус - Верь</div>
        </div>
      </div>

      <Link
        href="/widget/new"
        className="mt-6 block text-center border-2 border-dashed border-white/70 rounded-[28px] py-4 text-[16px] font-normal text-white/90"
      >
        + добавить виджет
      </Link>

      {/* ================= ALBUM ================= */}
      <div className="mt-10 text-center text-[28px] font-extrabold">Альбом</div>

      <div className="mt-6 border-2 border-dashed border-white/55 rounded-[28px] py-4 text-center text-[16px] font-normal text-white/80">
        Дата событие
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {["фото", "фото", "фото"].map((t, i) => (
          <div
            key={i}
            className="aspect-square border-2 border-dashed border-white/55 rounded-[28px] flex items-center justify-center text-[14px] font-normal text-white/70"
          >
            {t}
          </div>
        ))}
      </div>

      <div className="h-10" />
    </div>
  );
}