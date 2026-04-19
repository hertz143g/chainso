import { NextResponse } from "next/server";
import { MediaAssetKind, WidgetType } from "@prisma/client";

import { settingsFromCouple, toDateOrNull } from "@/lib/couplePayload";
import { prisma } from "@/lib/db";
import {
  normalizeRelationshipSettings,
  type RelationshipSettings,
} from "@/lib/relationship";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function notFound() {
  return NextResponse.json({ error: "Couple not found" }, { status: 404 });
}

async function loadCouple(slug: string) {
  return prisma.couple.findUnique({
    where: { publicSlug: slug },
    include: {
      widgets: true,
      albumPhotos: {
        include: {
          mediaAsset: true,
        },
      },
      drawingCanvases: true,
    },
  });
}

function widgetType(type: string) {
  if (type === "event") return WidgetType.EVENT;
  if (type === "memory") return WidgetType.MEMORY;
  if (type === "track") return WidgetType.TRACK;
  return WidgetType.CUSTOM;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const couple = await loadCouple(slug);

  if (!couple) return notFound();

  return NextResponse.json(settingsFromCouple(couple));
}

export async function PUT(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const body = (await request.json()) as { settings?: unknown };
  const settings = normalizeRelationshipSettings(
    body.settings as Partial<RelationshipSettings> | null | undefined,
  );

  // TODO: require auth and verify CoupleMember OWNER/EDITOR before production use.
  const couple = await prisma.$transaction(async (tx) => {
    const updatedCouple = await tx.couple.upsert({
      where: { publicSlug: slug },
      create: {
        publicSlug: slug,
        name1: settings.name1,
        name2: settings.name2,
        startDate: toDateOrNull(settings.startDateISO),
        themeKey: settings.theme,
        themeSettings: settings.customTheme,
        visibility: "PUBLIC",
        publishedAt: new Date(),
      },
      update: {
        name1: settings.name1,
        name2: settings.name2,
        startDate: toDateOrNull(settings.startDateISO),
        themeKey: settings.theme,
        themeSettings: settings.customTheme,
        publishedAt: new Date(),
      },
    });

    await tx.widget.deleteMany({ where: { coupleId: updatedCouple.id } });
    await tx.albumPhoto.deleteMany({ where: { coupleId: updatedCouple.id } });
    await tx.drawingCanvas.deleteMany({ where: { coupleId: updatedCouple.id } });
    await tx.mediaAsset.deleteMany({ where: { coupleId: updatedCouple.id } });

    await Promise.all(
      settings.widgets.map((widget, index) =>
        tx.widget.create({
          data: {
            id: widget.id,
            coupleId: updatedCouple.id,
            type: widgetType(widget.type),
            title: "title" in widget ? widget.title : null,
            body:
              "note" in widget
                ? widget.note ?? null
                : "subtitle" in widget
                  ? widget.subtitle ?? null
                  : null,
            startsAt:
              "dateISO" in widget && widget.dateISO ? toDateOrNull(widget.dateISO) : null,
            sortOrder: index,
            settings: widget,
          },
        }),
      ),
    );

    await Promise.all(
      settings.albumPhotos.map((photo, index) =>
        tx.mediaAsset
          .create({
            data: {
              coupleId: updatedCouple.id,
              kind: MediaAssetKind.IMAGE,
              storageKey: `local-album/${updatedCouple.id}/${photo.id}`,
              publicUrl: photo.imageDataUrl,
            },
          })
          .then((asset) =>
            tx.albumPhoto.create({
              data: {
                id: photo.id,
                coupleId: updatedCouple.id,
                mediaAssetId: asset.id,
                sortOrder: index,
              },
            }),
          ),
      ),
    );

    await Promise.all(
      settings.drawingCanvases.map((canvas, index) =>
        tx.drawingCanvas.create({
          data: {
            id: canvas.id,
            coupleId: updatedCouple.id,
            snapshotData: canvas,
            sortOrder: index,
          },
        }),
      ),
    );

    return tx.couple.findUniqueOrThrow({
      where: { id: updatedCouple.id },
      include: {
        widgets: true,
        albumPhotos: {
          include: {
            mediaAsset: true,
          },
        },
        drawingCanvases: true,
      },
    });
  });

  return NextResponse.json(settingsFromCouple(couple));
}
