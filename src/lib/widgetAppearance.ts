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

async function readFileAsDataUrl(file: Blob) {
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
  if (!file.type.startsWith("image/")) {
    throw new Error("Выбери изображение");
  }
  if (!file.size || file.size > 32 * 1024 * 1024) {
    throw new Error("Изображение должно быть не больше 32 МБ");
  }
  if (typeof window === "undefined") throw new Error("Browser required");

  const objectUrl = URL.createObjectURL(file);
  const canvas = document.createElement("canvas");
  try {
    const image = await loadImageFromDataUrl(objectUrl);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing unavailable");

    const maxDimension = options?.maxDimension ?? 1280;
    const minQuality = options?.minQuality ?? 0.62;
    const targetLength = options?.targetLength ?? 360_000;
    let scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight, 1));
    let quality = options?.quality ?? 0.86;
    let bestDataUrl = "";

    for (let attempt = 0; attempt < 12; attempt += 1) {
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      // toBlob yields to the browser between attempts instead of repeatedly
      // blocking interaction with synchronous JPEG/base64 encoding.
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Image encoding failed")), "image/jpeg", quality);
      });
      const candidate = await readFileAsDataUrl(blob);
      if (!bestDataUrl || candidate.length < bestDataUrl.length) bestDataUrl = candidate;
      if (candidate.length <= targetLength) return candidate;

      if (quality > minQuality + 0.05) quality = Math.max(minQuality, quality - 0.08);
      else scale *= 0.78;
    }
    if (bestDataUrl.length > targetLength) throw new Error("Image is too large to store");
    return bestDataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
    canvas.width = 0;
    canvas.height = 0;
  }
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
