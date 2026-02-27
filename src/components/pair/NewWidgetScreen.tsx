// src/components/pair/NewWidgetScreen.tsx
"use client";

import Link from "next/link";

export default function NewWidgetScreen() {
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

      <div className="mt-6 bg-[#0e1b3d] rounded-[22px] p-4 space-y-3">
        {[
          "Событие: <событие>",
          "Дата: <дата>",
          "Фото на фоне: <фото>",
          "Цвет: <палитра>",
          "Тип виджета:",
        ].map((t, i) => (
          <div key={i} className="bg-[#e5e5e5] text-black rounded-full px-4 py-3 text-[14px]">
            {t}
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="border border-dashed border-white/60 rounded-[16px] h-[86px]" />
          <div className="border border-dashed border-white/60 rounded-[16px] h-[86px]" />
        </div>
      </div>
    </div>
  );
}