import type { WidgetColorMode } from "@/lib/relationship";

type WidgetColorsSource = {
  accentColor: string;
  colorMode: WidgetColorMode;
  accentPalette?: string[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(color: string) {
  const value = color.trim().replace("#", "");
  if (value.length === 3) {
    return `#${value
      .split("")
      .map((char) => `${char}${char}`)
      .join("")}`.toUpperCase();
  }

  return `#${value.padEnd(6, "0").slice(0, 6)}`.toUpperCase();
}

function hexToRgb(color: string) {
  const normalized = normalizeHex(color).slice(1);

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`.toUpperCase();
}

function mixColors(colorA: string, colorB: string, weight: number) {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);

  return rgbToHex(
    a.r + (b.r - a.r) * weight,
    a.g + (b.g - a.g) * weight,
    a.b + (b.b - a.b) * weight,
  );
}

function getColorDistance(colorA: string, colorB: string) {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);

  return Math.sqrt(
    (a.r - b.r) ** 2 +
      (a.g - b.g) ** 2 +
      (a.b - b.b) ** 2,
  );
}

function buildSolidPalette(accentColor: string) {
  return [
    normalizeHex(accentColor),
    mixColors(accentColor, "#FFFFFF", 0.28),
    mixColors(accentColor, "#111827", 0.34),
  ];
}

export function getWidgetPalette({ accentColor, colorMode, accentPalette }: WidgetColorsSource) {
  if (colorMode === "adaptive" && accentPalette && accentPalette.length > 0) {
    const uniquePalette = accentPalette
      .map(normalizeHex)
      .filter((color, index, palette) => palette.indexOf(color) === index);

    if (uniquePalette.length >= 3) {
      return uniquePalette;
    }

    return [...uniquePalette, ...buildSolidPalette(accentColor)].slice(0, 4);
  }

  return buildSolidPalette(accentColor);
}

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File read error"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

async function loadImageFromDataUrl(dataUrl: string) {
  if (typeof window === "undefined") {
    throw new Error("Image loading is only available in the browser");
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image load error"));
    image.src = dataUrl;
  });
}

export async function prepareImageForStorage(
  file: File,
  options?: {
    maxDimension?: number;
    quality?: number;
    minQuality?: number;
    targetLength?: number;
  },
) {
  const sourceDataUrl = await readFileAsDataUrl(file);

  if (typeof window === "undefined") return sourceDataUrl;

  let image: HTMLImageElement;

  try {
    image = await loadImageFromDataUrl(sourceDataUrl);
  } catch {
    return sourceDataUrl;
  }

  const maxDimension = options?.maxDimension ?? 1280;
  const quality = options?.quality ?? 0.86;
  const minQuality = options?.minQuality ?? 0.62;
  const targetLength = options?.targetLength ?? 620_000;
  const largestSide = Math.max(image.width, image.height, 1);
  const scale = Math.min(1, maxDimension / largestSide);

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) return sourceDataUrl;

  let attemptScale = scale;
  let attemptQuality = quality;
  let bestDataUrl = sourceDataUrl;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const width = Math.max(1, Math.round(image.width * attemptScale));
    const height = Math.max(1, Math.round(image.height * attemptScale));

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const compressedDataUrl = canvas.toDataURL("image/jpeg", attemptQuality);
    const candidate = compressedDataUrl === "data:," ? sourceDataUrl : compressedDataUrl;

    if (candidate.length < bestDataUrl.length) {
      bestDataUrl = candidate;
    }

    if (candidate.length <= targetLength) {
      return candidate;
    }

    if (attemptQuality > minQuality + 0.05) {
      attemptQuality = Math.max(minQuality, attemptQuality - 0.08);
    } else {
      attemptScale *= 0.85;
    }
  }

  return bestDataUrl;
}

export async function extractPaletteFromDataUrl(dataUrl: string) {
  if (typeof window === "undefined") return [] as string[];

  return new Promise<string[]>((resolve) => {
    loadImageFromDataUrl(dataUrl)
      .then((image) => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { willReadFrequently: true });

        if (!context) {
          resolve([]);
          return;
        }

        const maxSize = 36;
        const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1);
        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const buckets = new Map<
          string,
          { count: number; r: number; g: number; b: number; vividness: number }
        >();

        for (let index = 0; index < data.length; index += 16) {
          const alpha = data[index + 3] ?? 0;
          if (alpha < 180) continue;

          const r = data[index] ?? 0;
          const g = data[index + 1] ?? 0;
          const b = data[index + 2] ?? 0;
          const maxChannel = Math.max(r, g, b);
          const minChannel = Math.min(r, g, b);
          const saturation = maxChannel - minChannel;
          const brightness = (r + g + b) / 3;

          if (brightness < 24) continue;
          if (brightness > 245 && saturation < 20) continue;

          const key = `${Math.round(r / 32) * 32}-${Math.round(g / 32) * 32}-${Math.round(b / 32) * 32}`;
          const bucket = buckets.get(key);

          if (bucket) {
            bucket.count += 1;
            bucket.r += r;
            bucket.g += g;
            bucket.b += b;
            bucket.vividness += saturation;
          } else {
            buckets.set(key, {
              count: 1,
              r,
              g,
              b,
              vividness: saturation,
            });
          }
        }

        const candidates = [...buckets.values()]
          .map((bucket) => ({
            color: rgbToHex(
              bucket.r / bucket.count,
              bucket.g / bucket.count,
              bucket.b / bucket.count,
            ),
            score: bucket.count * 1.2 + bucket.vividness / bucket.count,
          }))
          .sort((left, right) => right.score - left.score);

        const palette: string[] = [];

        for (const candidate of candidates) {
          if (palette.every((color) => getColorDistance(color, candidate.color) > 64)) {
            palette.push(candidate.color);
          }

          if (palette.length === 4) break;
        }

        resolve(palette);
      })
      .catch(() => resolve([]));
  });
}
