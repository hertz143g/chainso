// src/components/pair/MainScreen.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TimeBox from "../ui/TimeBox";
import {
  calcDiff,
  format2,
  formatDateLong,
  formatTogether,
  getGoalProgress,
  loadSettings,
  type RelationshipWidget,
} from "@/lib/relationship";

function WidgetCard({ widget }: { widget: RelationshipWidget }) {
  if (widget.type === "event") {
    return (
      <div
        className="mt-6 rounded-[34px] px-6 py-6 min-h-[208px] flex flex-col justify-between overflow-hidden bg-cover bg-center"
        style={{
          backgroundColor: widget.accentColor,
          backgroundImage: widget.imageDataUrl
            ? `linear-gradient(to top, rgba(8, 15, 33, 0.76), rgba(8, 15, 33, 0.24)), url(${widget.imageDataUrl})`
            : undefined,
        }}
      >
        <div className="text-center text-[22px] font-extrabold">{widget.title}</div>
        <div className="text-center text-[22px] font-extrabold">
          {formatDateLong(widget.dateISO)}
        </div>
      </div>
    );
  }

  return (
    <div
      className="mt-6 rounded-[34px] p-5 flex items-center gap-5"
      style={{ backgroundColor: widget.accentColor }}
    >
      <div className="w-[92px] h-[92px] rounded-[26px] overflow-hidden bg-black/25 flex items-center justify-center text-[30px]">
        {widget.coverDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={widget.coverDataUrl}
            alt={`${widget.artist} - ${widget.title}`}
            className="w-full h-full object-cover"
          />
        ) : (
          "♪"
        )}
      </div>
      <div>
        <div className="text-[22px] font-extrabold">{widget.title}</div>
        <div className="text-[18px] font-semibold text-white/90">{widget.artist}</div>
      </div>
    </div>
  );
}

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

  const { diff, progress } = useMemo(() => {
    const currentDiff = calcDiff(settings.startDateISO, now);

    return {
      diff: currentDiff,
      progress: getGoalProgress(currentDiff.days),
    };
  }, [settings.startDateISO, now]);

  return (
    <div className="text-white">
      {/* ================= TOP BAR ================= */}
      <div className="relative h-[52px]">
        <div className="absolute left-0 top-4 w-[44px] flex justify-start">
          <Image
            src="/icons/brush.png"
            alt="brush"
            width={18}
            height={18}
            className="opacity-90"
          />
        </div>

        <div className="absolute left-1/2 top-4 -translate-x-1/2">
          <span className="text-[28px] font-extrabold leading-none">CHAINSO</span>
        </div>

        <div className="absolute right-0 top-4 w-[44px] flex justify-end">
          <Link href="/settings">
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

      {/* ================= DAYS + HEART (плотнее и выше) ================= */}
      <div className="mt-5 flex flex-col items-center">
        <div className="text-[17px] opacity-85 leading-none">{diff.days} ДНЕЙ</div>

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
          {progress.percent}%
        </div>

        <div className="mt-2 h-[10px] rounded-full bg-white/90 overflow-hidden">
          <div
            className="h-full bg-[#3F86FF] rounded-full"
            style={{ width: `${progress.bar}%` }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[13px] font-normal opacity-80 px-1">
          <div>{progress.goal} дней</div>
          <div>{progress.leftDays} дня осталось</div>
        </div>
      </div>

      {/* ================= TOGETHER ================= */}
      <div className="mt-8 text-center">
        <div className="text-[22px] font-semibold text-white/55">Вместе уже:</div>
        <div className="mt-1 text-[28px] font-semibold leading-tight">
          {formatTogether(diff.years, diff.months, diff.day)}
        </div>
      </div>

      {/* ================= TIMER ================= */}
      <div className="mt-4 flex justify-center">
        <div className="bg-black/30 rounded-[33px] px-5 py-4 flex gap-2">
          <TimeBox value={format2(diff.hours)} label="часов" />
          <TimeBox value={format2(diff.minutes)} label="минут" />
          <TimeBox value={format2(diff.seconds)} label="секунд" />
        </div>
      </div>

      {/* ================= WIDGETS ================= */}
      <div className="mt-7 text-center text-[30px] font-extrabold">Виджеты</div>

      {settings.widgets.map((widget) => (
        <WidgetCard key={widget.id} widget={widget} />
      ))}

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
        {["фото", "фото", "фото"].map((item, index) => (
          <div
            key={index}
            className="aspect-square border-2 border-dashed border-white/55 rounded-[28px] flex items-center justify-center text-[14px] font-normal text-white/70"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="h-10" />
    </div>
  );
}
