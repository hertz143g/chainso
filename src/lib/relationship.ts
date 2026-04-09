// src/lib/relationship.ts
export type RelationshipSettings = {
  name1: string;
  name2: string;
  startDateISO: string; // "2024-02-09"
  photo1DataUrl?: string;
  photo2DataUrl?: string;
  widgets: RelationshipWidget[];
};

export type WidgetType = "event" | "track";

type BaseWidget = {
  id: string;
  type: WidgetType;
  accentColor: string;
  createdAtISO: string;
};

export type EventWidget = BaseWidget & {
  type: "event";
  title: string;
  dateISO: string;
  imageDataUrl?: string;
};

export type TrackWidget = BaseWidget & {
  type: "track";
  title: string;
  artist: string;
  coverDataUrl?: string;
};

export type RelationshipWidget = EventWidget | TrackWidget;

const KEY = "chainso_settings_v1";

export const defaultSettings: RelationshipSettings = {
  name1: "Иван",
  name2: "Ксения",
  startDateISO: "2024-02-09",
  photo1DataUrl: undefined,
  photo2DataUrl: undefined,
  widgets: [
    {
      id: "default-event",
      type: "event",
      title: "Первая встреча",
      dateISO: "2024-02-09",
      accentColor: "#4A86E8",
      createdAtISO: "2024-02-09T00:00:00.000Z",
    },
    {
      id: "default-track",
      type: "track",
      title: "Верь",
      artist: "Джизус",
      accentColor: "#4A86E8",
      createdAtISO: "2024-02-09T00:00:00.000Z",
    },
  ],
};

function parseWidget(widget: unknown): RelationshipWidget | null {
  if (!widget || typeof widget !== "object") return null;

  const raw = widget as Record<string, unknown>;
  const id = typeof raw.id === "string" ? raw.id : createWidgetId();
  const accentColor =
    typeof raw.accentColor === "string" ? raw.accentColor : "#4A86E8";
  const createdAtISO =
    typeof raw.createdAtISO === "string" ? raw.createdAtISO : new Date().toISOString();

  if (raw.type === "event") {
    if (typeof raw.title !== "string" || typeof raw.dateISO !== "string") return null;
    return {
      id,
      type: "event",
      title: raw.title,
      dateISO: raw.dateISO,
      accentColor,
      createdAtISO,
      imageDataUrl: typeof raw.imageDataUrl === "string" ? raw.imageDataUrl : undefined,
    };
  }

  if (raw.type === "track") {
    if (typeof raw.title !== "string" || typeof raw.artist !== "string") return null;
    return {
      id,
      type: "track",
      title: raw.title,
      artist: raw.artist,
      accentColor,
      createdAtISO,
      coverDataUrl: typeof raw.coverDataUrl === "string" ? raw.coverDataUrl : undefined,
    };
  }

  return null;
}

export function loadSettings(): RelationshipSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<RelationshipSettings>;
    const widgets = Array.isArray(parsed.widgets)
      ? parsed.widgets.map(parseWidget).filter((widget): widget is RelationshipWidget => widget !== null)
      : defaultSettings.widgets;

    return {
      name1: parsed.name1 ?? defaultSettings.name1,
      name2: parsed.name2 ?? defaultSettings.name2,
      startDateISO: parsed.startDateISO ?? defaultSettings.startDateISO,
      photo1DataUrl: parsed.photo1DataUrl,
      photo2DataUrl: parsed.photo2DataUrl,
      widgets,
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(s: RelationshipSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function createWidgetId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `widget-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

export function formatDateLong(dateISO: string) {
  const [year, month, day] = dateISO.split("-").map(Number);
  const date = new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getGoalProgress(days: number) {
  // следующая цель кратная 100, но минимум 100
  const goal = Math.max(100, Math.ceil((days + 1) / 100) * 100);
  const percentRaw = (days / goal) * 100;

  // 43.421 -> 43
  const percent = Math.floor(percentRaw);

  const leftDays = Math.max(0, goal - days);

  // ширина полосы: не больше 100%
  const bar = Math.min(100, Math.max(0, percentRaw));

  return { goal, percent, leftDays, bar };
}
