// src/lib/relationship.ts
export type WidgetType = "event" | "memory" | "track";
export type WidgetColorMode = "solid" | "adaptive";
export type AppTheme =
  | "sun-cycle"
  | "linen"
  | "sage"
  | "aurora"
  | "noir"
  | "ember"
  | "neo"
  | "custom";
export type TimeDisplayStyle = "hourglass" | "glass" | "orbits";
export type AvatarDisplayStyle = "classic" | "halo" | "duo-card";

export type CustomThemeSettings = {
  backgroundColor: string;
  surfaceColor: string;
  primaryColor: string;
  textColor: string;
};

export type BaseWidget = {
  id: string;
  type: WidgetType;
  accentColor: string;
  colorMode: WidgetColorMode;
  accentPalette?: string[];
  createdAtISO: string;
};

export type EventWidget = BaseWidget & {
  type: "event";
  title: string;
  dateISO: string;
  subtitle?: string;
  imageDataUrl?: string;
};

export type MemoryWidget = BaseWidget & {
  type: "memory";
  title: string;
  dateISO?: string;
  note?: string;
  imageDataUrl?: string;
};

export type TrackWidget = BaseWidget & {
  type: "track";
  title: string;
  artist: string;
  note?: string;
  coverDataUrl?: string;
  trackUrl?: string;
  platform?: string;
};

export type RelationshipWidget = EventWidget | MemoryWidget | TrackWidget;

export type AlbumPhoto = {
  id: string;
  imageDataUrl: string;
  createdAtISO: string;
};

export type RelationshipSettings = {
  name1: string;
  name2: string;
  startDateISO: string; // "2024-02-09"
  theme: AppTheme;
  customTheme: CustomThemeSettings;
  timeDisplayStyle: TimeDisplayStyle;
  avatarDisplayStyle: AvatarDisplayStyle;
  photo1DataUrl?: string;
  photo2DataUrl?: string;
  widgets: RelationshipWidget[];
  albumPhotos: AlbumPhoto[];
};

const KEY = "chainso_settings_v2";
const LEGACY_KEY = "chainso_settings_v1";
const SETTINGS_UPDATED_EVENT = "chainso:settings-updated";
let cachedSettings: RelationshipSettings | null = null;

const DEFAULT_CUSTOM_THEME: CustomThemeSettings = {
  backgroundColor: "#101828",
  surfaceColor: "#1D2939",
  primaryColor: "#84CAFF",
  textColor: "#F8FBFF",
};

function createDefaultWidgets(): RelationshipWidget[] {
  return [
    {
      id: "default-event",
      type: "event",
      title: "Первая встреча",
      dateISO: "2024-02-09",
      subtitle: "Тот самый день",
      accentColor: "#4A86E8",
      colorMode: "solid",
      createdAtISO: "2024-02-09T00:00:00.000Z",
    },
    {
      id: "default-memory",
      type: "memory",
      title: "Лучший кадр",
      dateISO: "2024-04-12",
      note: "Оставь здесь любимый снимок",
      accentColor: "#E86FA5",
      colorMode: "solid",
      createdAtISO: "2024-04-12T00:00:00.000Z",
    },
    {
      id: "default-track",
      type: "track",
      title: "Верь",
      artist: "Джизус",
      note: "Ваш общий трек",
      platform: "Музыка",
      accentColor: "#5AA897",
      colorMode: "solid",
      createdAtISO: "2024-02-12T00:00:00.000Z",
    },
  ];
}

export function getDefaultSettings(): RelationshipSettings {
  return {
    name1: "Иван",
    name2: "Ксения",
    startDateISO: "2024-02-09",
    theme: "sun-cycle",
    customTheme: { ...DEFAULT_CUSTOM_THEME },
    timeDisplayStyle: "glass",
    avatarDisplayStyle: "classic",
    photo1DataUrl: undefined,
    photo2DataUrl: undefined,
    widgets: createDefaultWidgets(),
    albumPhotos: [],
  };
}

export const defaultSettings = getDefaultSettings();

function cloneSettings(settings: RelationshipSettings): RelationshipSettings {
  return {
    ...settings,
    customTheme: { ...settings.customTheme },
    widgets: settings.widgets.map((widget) => ({
      ...widget,
      accentPalette: widget.accentPalette ? [...widget.accentPalette] : undefined,
    })),
    albumPhotos: settings.albumPhotos.map((photo) => ({ ...photo })),
  };
}

function createFallbackSettings(): RelationshipSettings {
  return cloneSettings(defaultSettings);
}

function readAndNormalizeSettings(): RelationshipSettings {
  if (typeof window === "undefined") return createFallbackSettings();

  try {
    const raw = readStoredSettings();
    if (!raw) return createFallbackSettings();

    return normalizeSettings(JSON.parse(raw) as Partial<RelationshipSettings>);
  } catch {
    return createFallbackSettings();
  }
}

function readStoredSettings(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
}

export function createWidgetId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `widget-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseWidget(widget: unknown): RelationshipWidget | null {
  if (!widget || typeof widget !== "object") return null;

  const raw = widget as Record<string, unknown>;
  const id = typeof raw.id === "string" ? raw.id : createWidgetId();
  const accentColor = typeof raw.accentColor === "string" ? raw.accentColor : "#4A86E8";
  const colorMode = raw.colorMode === "adaptive" ? "adaptive" : "solid";
  const accentPalette = Array.isArray(raw.accentPalette)
    ? raw.accentPalette.filter((color): color is string => typeof color === "string").slice(0, 4)
    : undefined;
  const createdAtISO =
    typeof raw.createdAtISO === "string" ? raw.createdAtISO : new Date().toISOString();

  if (raw.type === "event") {
    if (typeof raw.title !== "string" || typeof raw.dateISO !== "string") return null;

    return {
      id,
      type: "event",
      title: raw.title,
      dateISO: raw.dateISO,
      subtitle: typeof raw.subtitle === "string" ? raw.subtitle : undefined,
      imageDataUrl: typeof raw.imageDataUrl === "string" ? raw.imageDataUrl : undefined,
      accentColor,
      colorMode,
      accentPalette,
      createdAtISO,
    };
  }

  if (raw.type === "memory") {
    if (typeof raw.title !== "string") return null;

    return {
      id,
      type: "memory",
      title: raw.title,
      dateISO: typeof raw.dateISO === "string" ? raw.dateISO : undefined,
      note: typeof raw.note === "string" ? raw.note : undefined,
      imageDataUrl: typeof raw.imageDataUrl === "string" ? raw.imageDataUrl : undefined,
      accentColor,
      colorMode,
      accentPalette,
      createdAtISO,
    };
  }

  if (raw.type === "track") {
    if (typeof raw.title !== "string" || typeof raw.artist !== "string") return null;

    return {
      id,
      type: "track",
      title: raw.title,
      artist: raw.artist,
      note: typeof raw.note === "string" ? raw.note : undefined,
      coverDataUrl: typeof raw.coverDataUrl === "string" ? raw.coverDataUrl : undefined,
      trackUrl: typeof raw.trackUrl === "string" ? raw.trackUrl : undefined,
      platform: typeof raw.platform === "string" ? raw.platform : undefined,
      accentColor,
      colorMode,
      accentPalette,
      createdAtISO,
    };
  }

  return null;
}

function parseAlbumPhoto(photo: unknown): AlbumPhoto | null {
  if (!photo || typeof photo !== "object") return null;

  const raw = photo as Record<string, unknown>;
  if (typeof raw.imageDataUrl !== "string") return null;

  return {
    id: typeof raw.id === "string" ? raw.id : createWidgetId(),
    imageDataUrl: raw.imageDataUrl,
    createdAtISO:
      typeof raw.createdAtISO === "string" ? raw.createdAtISO : new Date().toISOString(),
  };
}

function parseTheme(theme: unknown, fallback: AppTheme): AppTheme {
  if (
    theme === "sun-cycle" ||
    theme === "linen" ||
    theme === "sage" ||
    theme === "aurora" ||
    theme === "noir" ||
    theme === "ember" ||
    theme === "neo" ||
    theme === "custom"
  ) {
    return theme;
  }
  if (theme === "kitty") return "linen";
  if (theme === "aquarium") return "sage";
  if (theme === "pearl") return "aurora";
  return fallback;
}

function parseTimeDisplayStyle(style: unknown, fallback: TimeDisplayStyle): TimeDisplayStyle {
  if (style === "hourglass" || style === "glass" || style === "orbits") return style;
  if (style === "cards") return "hourglass";
  return fallback;
}

function parseAvatarDisplayStyle(style: unknown, fallback: AvatarDisplayStyle): AvatarDisplayStyle {
  if (style === "classic" || style === "halo" || style === "duo-card") return style;
  return fallback;
}

function parseHexColor(color: unknown, fallback: string) {
  if (typeof color !== "string") return fallback;
  const trimmed = color.trim();

  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed
      .slice(1)
      .split("")
      .map((char) => `${char}${char}`)
      .join("")}`;
  }

  return fallback;
}

function parseCustomTheme(theme: unknown, fallback: CustomThemeSettings): CustomThemeSettings {
  if (!theme || typeof theme !== "object") return { ...fallback };

  const raw = theme as Record<string, unknown>;

  return {
    backgroundColor: parseHexColor(raw.backgroundColor, fallback.backgroundColor),
    surfaceColor: parseHexColor(raw.surfaceColor, fallback.surfaceColor),
    primaryColor: parseHexColor(raw.primaryColor, fallback.primaryColor),
    textColor: parseHexColor(raw.textColor, fallback.textColor),
  };
}

function normalizeSettings(
  parsed: Partial<RelationshipSettings> | null | undefined,
): RelationshipSettings {
  const fallback = createFallbackSettings();

  if (!parsed) return fallback;

  const parsedWidgets = Array.isArray(parsed.widgets) ? parsed.widgets : null;
  const widgets = parsedWidgets
    ? parsedWidgets
        .map(parseWidget)
        .filter((widget): widget is RelationshipWidget => widget !== null)
    : fallback.widgets;
  const parsedAlbumPhotos = Array.isArray(parsed.albumPhotos) ? parsed.albumPhotos : null;
  const albumPhotos = parsedAlbumPhotos
    ? parsedAlbumPhotos
        .map(parseAlbumPhoto)
        .filter((photo): photo is AlbumPhoto => photo !== null)
    : fallback.albumPhotos;

  return {
    name1: typeof parsed.name1 === "string" && parsed.name1.trim().length > 0
      ? parsed.name1
      : fallback.name1,
    name2: typeof parsed.name2 === "string" && parsed.name2.trim().length > 0
      ? parsed.name2
      : fallback.name2,
    startDateISO:
      typeof parsed.startDateISO === "string" && parsed.startDateISO.length > 0
        ? parsed.startDateISO
        : fallback.startDateISO,
    theme: parseTheme(parsed.theme, fallback.theme),
    customTheme: parseCustomTheme(parsed.customTheme, fallback.customTheme),
    timeDisplayStyle: parseTimeDisplayStyle(parsed.timeDisplayStyle, fallback.timeDisplayStyle),
    avatarDisplayStyle: parseAvatarDisplayStyle(
      parsed.avatarDisplayStyle,
      fallback.avatarDisplayStyle,
    ),
    photo1DataUrl:
      typeof parsed.photo1DataUrl === "string" ? parsed.photo1DataUrl : undefined,
    photo2DataUrl:
      typeof parsed.photo2DataUrl === "string" ? parsed.photo2DataUrl : undefined,
    widgets,
    albumPhotos,
  };
}

export function loadSettings(): RelationshipSettings {
  if (typeof window === "undefined") return defaultSettings;

  if (!cachedSettings) {
    cachedSettings = readAndNormalizeSettings();
  }

  return cachedSettings;
}

function emitSettingsUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
}

export function saveSettings(settings: RelationshipSettings) {
  if (typeof window === "undefined") return;

  const normalized = normalizeSettings(settings);
  cachedSettings = normalized;
  localStorage.setItem(KEY, JSON.stringify(normalized));
  localStorage.removeItem(LEGACY_KEY);
  emitSettingsUpdated();
}

export function updateSettings(
  updater: (current: RelationshipSettings) => RelationshipSettings,
) {
  const nextSettings = updater(loadSettings());
  saveSettings(nextSettings);
  return nextSettings;
}

export function subscribeSettings(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === LEGACY_KEY) {
      cachedSettings = readAndNormalizeSettings();
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SETTINGS_UPDATED_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SETTINGS_UPDATED_EVENT, callback);
  };
}

export function getSettingsSnapshot() {
  return loadSettings();
}

export function getSettingsServerSnapshot() {
  return defaultSettings;
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
  const goal = Math.max(100, Math.ceil((days + 1) / 100) * 100);
  const percentRaw = (days / goal) * 100;
  const percent = Math.floor(percentRaw);
  const leftDays = Math.max(0, goal - days);
  const bar = Math.min(100, Math.max(0, percentRaw));

  return { goal, percent, leftDays, bar };
}
