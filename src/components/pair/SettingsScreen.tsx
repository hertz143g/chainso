"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { loadSettings, saveSettings, type RelationshipSettings } from "@/lib/relationship";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File read error"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export default function SettingsScreen() {
  const [s, setS] = useState<RelationshipSettings>(() => loadSettings());

  const file1Ref = useRef<HTMLInputElement>(null);
  const file2Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setS(loadSettings());
  }, []);

  const onPick1 = () => file1Ref.current?.click();
  const onPick2 = () => file2Ref.current?.click();

  const onFile1 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await readFileAsDataURL(f);
    setS((prev) => ({ ...prev, photo1DataUrl: url }));
    e.target.value = "";
  };

  const onFile2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await readFileAsDataURL(f);
    setS((prev) => ({ ...prev, photo2DataUrl: url }));
    e.target.value = "";
  };

  const onSave = () => {
    saveSettings(s);
  };

  return (
    <>
      {/* Header: стрелка слева, "Настройки" по центру, справа пусто */}
      <div className="relative flex items-center text-white">
        <Link href="/" className="w-8 text-left select-none">
          ←
        </Link>
        <div className="absolute left-0 right-0 text-center font-semibold text-[14px] pointer-events-none">
          Настройки
        </div>
        <div className="w-8" />
      </div>

      <div className="mt-5 bg-[#0e1b3d] rounded-[22px] p-4">
        <div className="text-white text-[12px] font-semibold text-center mb-4">
          Настройки
        </div>

        {/* Ряд 1 */}
        <div className="flex items-center gap-3 mb-4">
          {/* камера-кнопка */}
          <button
            type="button"
            onClick={onPick1}
            className="w-[52px] h-[52px] rounded-full bg-[#e5e5e5] ring-2 ring-[#4aa7ff] flex items-center justify-center text-[18px]"
          >
            📷
          </button>

          <input
            value={s.name1}
            onChange={(e) => setS({ ...s, name1: e.target.value })}
            className="flex-1 rounded-full px-4 py-2 text-[12px] bg-[#e5e5e5] text-black outline-none"
          />
        </div>

        {/* Ряд 2 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={onPick2}
            className="w-[52px] h-[52px] rounded-full bg-[#e5e5e5] ring-2 ring-[#4aa7ff] flex items-center justify-center text-[18px]"
          >
            📷
          </button>

          <input
            value={s.name2}
            onChange={(e) => setS({ ...s, name2: e.target.value })}
            className="flex-1 rounded-full px-4 py-2 text-[12px] bg-[#e5e5e5] text-black outline-none"
          />
        </div>

        <div className="text-white text-[11px] mb-2">Дата начала отношений:</div>

        <input
          type="date"
          value={s.startDateISO}
          onChange={(e) => setS({ ...s, startDateISO: e.target.value })}
          className="w-full rounded-full px-4 py-2 text-[12px] bg-[#e5e5e5] text-black outline-none"
        />

        {/* Кнопка сохранить ТОЛЬКО снизу */}
        <button
          onClick={onSave}
          className="mt-5 w-full rounded-[16px] bg-[#4a84e0] text-white py-2 text-[12px] font-semibold"
        >
          Сохранить
        </button>

        {/* скрытые инпуты файлов */}
        <input
          ref={file1Ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile1}
        />
        <input
          ref={file2Ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile2}
        />
      </div>
    </>
  );
}