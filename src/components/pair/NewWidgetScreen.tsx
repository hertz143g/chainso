"use client";

import Link from "next/link";

export default function NewWidgetScreen() {
  return (
    <>
      <div className="flex justify-between items-center text-white">
        <Link href="/" className="select-none">←</Link>
        <span className="font-semibold text-[14px]">Новый виджет</span>
        <span className="opacity-0">—</span>
      </div>

      <div className="mt-5 bg-[#0e1b3d] rounded-[22px] p-4 text-white">
        <div className="text-center font-semibold text-[12px] mb-4">Новый виджет</div>

        {[
          "Событие: <событие>",
          "Дата: <дата>",
          "Фото на фоне: <фото>",
          "Цвет: <палитра>",
          "Тип виджета:",
        ].map((t, i) => (
          <div
            key={i}
            className="bg-[#e5e5e5] text-black rounded-full px-4 py-2 text-[12px] mb-3"
          >
            {t}
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="border border-dashed border-white/60 rounded-[16px] h-[86px]" />
          <div className="border border-dashed border-white/60 rounded-[16px] h-[86px]" />
        </div>
      </div>
    </>
  );
}