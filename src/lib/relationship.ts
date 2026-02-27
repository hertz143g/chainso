export type RelationshipSettings = {
  name1: string;
  name2: string;
  startDateISO: string; // "2024-02-09"
  photo1DataUrl?: string; // base64 dataURL
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
  // Считаем от полуночи даты начала (локальное время), как обычно ожидают люди
  const [y, m, d] = startISO.split("-").map(Number);
  const start = new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);

  const ms = now.getTime() - start.getTime();
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // “1 год, 8 месяцев, 26 дней” — делаем как календарную разницу (чтобы было “по-человечески”)
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let day = now.getDate() - start.getDate();

  if (day < 0) {
    // берём дни прошлого месяца
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