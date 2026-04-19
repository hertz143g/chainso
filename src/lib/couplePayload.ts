import type { Prisma } from "@prisma/client";

import {
  getDefaultSettings,
  normalizeRelationshipSettings,
  type AppTheme,
  type RelationshipSettings,
} from "@/lib/relationship";

export type CouplePayload = {
  slug: string;
  settings: RelationshipSettings;
};

type CoupleWithBlocks = Prisma.CoupleGetPayload<{
  include: {
    widgets: true;
    albumPhotos: {
      include: {
        mediaAsset: true;
      };
    };
    drawingCanvases: true;
  };
}>;

function jsonObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function settingsFromCouple(couple: CoupleWithBlocks): CouplePayload {
  const settings = getDefaultSettings();

  const widgets = couple.widgets
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((widget) => jsonObject(widget.settings)) as Partial<RelationshipSettings>["widgets"];
  const albumPhotos = couple.albumPhotos
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((photo) =>
      jsonObject({
        id: photo.id,
        imageDataUrl: photo.mediaAsset.publicUrl,
        createdAtISO: photo.createdAt.toISOString(),
      }),
    ) as Partial<RelationshipSettings>["albumPhotos"];
  const drawingCanvases = couple.drawingCanvases
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((canvas) => jsonObject(canvas.snapshotData)) as Partial<
    RelationshipSettings
  >["drawingCanvases"];

  return {
    slug: couple.publicSlug,
    settings: normalizeRelationshipSettings({
      ...settings,
      name1: couple.name1 ?? settings.name1,
      name2: couple.name2 ?? settings.name2,
      startDateISO: couple.startDate ? couple.startDate.toISOString().slice(0, 10) : "",
      theme: couple.themeKey as AppTheme,
      customTheme: jsonObject(couple.themeSettings) as Partial<RelationshipSettings>["customTheme"],
      widgets,
      albumPhotos,
      drawingCanvases,
    }),
  };
}

export function toDateOrNull(dateISO: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return null;

  const [year, month, day] = dateISO.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : date;
}
