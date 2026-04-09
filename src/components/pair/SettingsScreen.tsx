// src/components/pair/SettingsScreen.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  type RelationshipSettings,
  updateSettings,
} from "@/lib/relationship";
import useRelationshipSettings from "@/hooks/useRelationshipSettings";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File read error"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useRelationshipSettings();
  const [draft, setDraft] = useState<RelationshipSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const current = draft ?? settings;

  const patchDraft = (patch: Partial<RelationshipSettings>) => {
    setDraft((prev) => ({
      ...(prev ?? settings),
      ...patch,
    }));
  };

  const onFileChange =
    (field: "photo1DataUrl" | "photo2DataUrl") =>
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files?.[0];
      if (!file) return;

      const url = await readFileAsDataURL(file);
      patchDraft(
        field === "photo1DataUrl" ? { photo1DataUrl: url } : { photo2DataUrl: url },
      );
      event.currentTarget.value = "";
    };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    updateSettings((prev) => ({
      ...prev,
      ...current,
      widgets: current.widgets,
    }));

    router.push("/");
  };

  return (
    <div className="text-white">
      <div className="relative flex items-center">
        <Link href="/" className="w-8 text-left select-none">
          ←
        </Link>
        <div className="absolute left-0 right-0 pointer-events-none text-center text-[18px] font-semibold">
          Настройки
        </div>
        <div className="w-8" />
      </div>

      <form onSubmit={onSubmit} className="mt-6 rounded-[22px] bg-[#0e1b3d] p-4">
        <div className="mb-4 flex items-center gap-3">
          <label className="flex h-[74px] w-[74px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#e5e5e5] ring-2 ring-[#4aa7ff]">
            {current.photo1DataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.photo1DataUrl}
                alt="Фото первого человека"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[22px]">📷</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange("photo1DataUrl")}
            />
          </label>

          <input
            value={current.name1}
            onChange={(event) => patchDraft({ name1: event.target.value })}
            placeholder="Имя"
            className="flex-1 rounded-full bg-[#e5e5e5] px-4 py-3 text-[14px] text-black outline-none"
          />
        </div>

        <div className="mb-6 flex items-center gap-3">
          <label className="flex h-[74px] w-[74px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#e5e5e5] ring-2 ring-[#4aa7ff]">
            {current.photo2DataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.photo2DataUrl}
                alt="Фото второго человека"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[22px]">📷</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange("photo2DataUrl")}
            />
          </label>

          <input
            value={current.name2}
            onChange={(event) => patchDraft({ name2: event.target.value })}
            placeholder="Имя"
            className="flex-1 rounded-full bg-[#e5e5e5] px-4 py-3 text-[14px] text-black outline-none"
          />
        </div>

        <div className="mb-2 text-[13px] text-white/80">Дата начала отношений:</div>
        <input
          type="date"
          value={current.startDateISO}
          onChange={(event) => patchDraft({ startDateISO: event.target.value })}
          className="w-full rounded-full bg-[#e5e5e5] px-4 py-3 text-[14px] text-black outline-none"
        />

        <button
          type="submit"
          disabled={isSaving}
          className="mt-6 w-full rounded-[18px] bg-[#3F86FF] py-3 text-[16px] font-semibold text-white disabled:opacity-60"
        >
          Сохранить
        </button>
      </form>
    </div>
  );
}
