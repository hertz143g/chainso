// src/lib/relationship.ts
export type RelationshipSettings = {
  name1: string;
  name2: string;
  startDateISO: string; // "2024-02-09"
  photo1DataUrl?: string;
  photo2DataUrl?: string;
};

const KEY = "chainso_settings_v1";

export const defaultSettings: RelationshipSettings = {
  name1: "Иван",
  name2: "Ксения",
  startDateISO: "2024-02-09",
  photo1DataUrl: undefined,
  photo2DataUrl: undefined,
};

export function loadSettings(): RelationshipSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<RelationshipSettings>;
    return {
      name1: parsed.name1 ?? defaultSettings.name1,
      name2: parsed.name2 ?? defaultSettings.name2,
      startDateISO: parsed.startDateISO ?? defaultSettings.startDateISO,
      photo1DataUrl: parsed.photo1DataUrl,
      photo2DataUrl: parsed.photo2DataUrl,
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(s: RelationshipSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function calcDiff(startISO: string, now = new Date()) {
  const [y, m, d] = startISO.split("-").map(Number);
  const start = new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);

  const ms = now.getTime() - start.getTime();
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let day = now.getDate() - start.getDate();

  if (day < 0) {
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    day += prevMonthLastDay;
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  years = Math.max(0, years);
  months = Math.max(0, months);
  day = Math.max(0, day);

  return { days, hours, minutes, seconds, years, months, day };
}

export function format2(n: number) {
  return String(n).padStart(2, "0");
}

export function ruPlural(n: number, one: string, few: string, many: string) {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;

  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export function formatTogether(y: number, m: number, d: number) {
  const parts: string[] = [];

  if (y !== 0) parts.push(`${y} ${ruPlural(y, "год", "года", "лет")}`);
  if (m !== 0) parts.push(`${m} ${ruPlural(m, "месяц", "месяца", "месяцев")}`);
  if (d !== 0) parts.push(`${d} ${ruPlural(d, "день", "дня", "дней")}`);

  if (parts.length === 0) parts.push("0 дней");
  return parts.join(", ");
}