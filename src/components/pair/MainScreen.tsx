// src/components/pair/MainScreen.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import WidgetVisual, {
  relationshipWidgetToVisualData,
} from "@/components/pair/WidgetVisual";
import useRelationshipSettings from "@/hooks/useRelationshipSettings";
import {
  calcDiff,
  createWidgetId,
  format2,
  formatDateLong,
  formatTogether,
  getGoalProgress,
  ruPlural,
  type AvatarDisplayStyle,
  type DrawingCanvas,
  type RelationshipWidget,
  type TimeDisplayStyle,
  updateSettings,
} from "@/lib/relationship";
import { prepareImageForStorage } from "@/lib/widgetAppearance";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const DRAWING_CANVAS_WIDTH = 840;
const DRAWING_CANVAS_HEIGHT = 520;
const DRAWING_CANVAS_BACKGROUND = "#fffaf4";

type DrawingTool = "brush" | "eraser";
type WidgetDropPlacement = "before" | "after";

function fillDrawingCanvasBackground(context: CanvasRenderingContext2D) {
  context.fillStyle = DRAWING_CANVAS_BACKGROUND;
  context.fillRect(0, 0, DRAWING_CANVAS_WIDTH, DRAWING_CANVAS_HEIGHT);
}

function getCanvasPoint(canvas: HTMLCanvasElement, event: React.PointerEvent<HTMLCanvasElement>) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement
    ? Boolean(target.closest("a, button, input, label, select, textarea"))
    : false;
}

function getWidgetDropPlacement(
  event: React.PointerEvent<HTMLDivElement>,
  target: HTMLElement,
): WidgetDropPlacement {
  const rect = target.getBoundingClientRect();

  return event.clientY > rect.top + rect.height / 2 ? "after" : "before";
}

function WidgetActions({
  widgetId,
  onDelete,
}: {
  widgetId: string;
  onDelete: (widgetId: string) => void;
}) {
  return (
    <div className="absolute right-2 top-2 z-30 flex flex-wrap justify-end gap-1.5">
      <Link
        href={`/widget/new?id=${widgetId}`}
        className="theme-icon-button flex h-8 w-8 items-center justify-center rounded-full border text-[15px] font-bold"
        aria-label="Изменить виджет"
      >
        ✎
      </Link>
      <button
        type="button"
        onClick={() => onDelete(widgetId)}
        className="theme-icon-button flex h-8 w-8 items-center justify-center rounded-full border text-[18px] font-bold"
        aria-label="Удалить виджет"
      >
        ×
      </button>
    </div>
  );
}

function WidgetCard({
  widget,
  isEditing,
  isDragging,
  onDelete,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  widget: RelationshipWidget;
  isEditing: boolean;
  isDragging: boolean;
  onDelete: (widgetId: string) => void;
  onDragStart: (widgetId: string, event: React.PointerEvent<HTMLDivElement>) => void;
  onDragMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onDragEnd: (event: React.PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      data-widget-id={widget.id}
      className={cx(
        "relative col-span-2 transition duration-200",
        isEditing && "cursor-grab select-none touch-none active:cursor-grabbing",
        isDragging && "z-40 scale-[0.985] opacity-55 shadow-[0_22px_54px_var(--theme-shadow)]",
      )}
      onPointerDown={(event) => {
        if (!isEditing || event.button !== 0 || isInteractiveTarget(event.target)) return;
        onDragStart(widget.id, event);
      }}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
      onPointerCancel={onDragEnd}
    >
      <WidgetVisual
        widget={relationshipWidgetToVisualData(widget)}
        className={isEditing ? "ring-1 ring-[var(--theme-control-active-border)]" : undefined}
        actions={
          isEditing ? <WidgetActions widgetId={widget.id} onDelete={onDelete} /> : null
        }
      />
    </div>
  );
}

function CoupleAvatar({
  name,
  photoDataUrl,
  style,
}: {
  name: string;
  photoDataUrl?: string;
  style: AvatarDisplayStyle;
}) {
  const image = photoDataUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photoDataUrl} alt={name} className="h-full w-full object-cover" />
  ) : null;

  if (style === "duo-card") {
    return (
      <div className="flex w-[158px] flex-col items-center">
        <div className="theme-glass w-[154px] rounded-[34px] p-2.5 shadow-[0_18px_48px_var(--theme-shadow)] backdrop-blur-md">
          <div className="theme-avatar-ring theme-avatar-surface aspect-[5/6] w-full overflow-hidden rounded-[26px] ring-2">
            {image}
          </div>
          <div className="mt-2 truncate text-center text-[16px] font-extrabold leading-tight">
            {name}
          </div>
        </div>
      </div>
    );
  }

  if (style === "halo") {
    return (
      <div className="flex w-[158px] flex-col items-center">
        <div className="theme-glass w-[154px] rounded-[34px] p-2.5 shadow-[0_18px_48px_var(--theme-shadow)] backdrop-blur-md">
          <div className="theme-avatar-ring theme-avatar-surface aspect-[5/6] w-full overflow-hidden rounded-[26px] ring-2">
            {image}
          </div>
          <div className="mt-2 truncate text-center text-[16px] font-extrabold leading-tight">
            {name}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-[156px] flex-col items-center">
      <div className="theme-avatar-ring theme-avatar-surface h-[156px] w-[156px] overflow-hidden rounded-full ring-[3px]">
        {image}
      </div>
      <div className="mt-3 text-[18px] font-semibold">{name}</div>
    </div>
  );
}

function CoupleCameo({
  name1,
  name2,
  photo1DataUrl,
  photo2DataUrl,
}: {
  name1: string;
  name2: string;
  photo1DataUrl?: string;
  photo2DataUrl?: string;
}) {
  return (
    <div className="relative w-full pb-2 pt-3">
      <div className="relative mx-auto flex w-[316px] items-center justify-center">
        <div className="theme-avatar-ring theme-avatar-surface relative z-20 h-[176px] w-[176px] overflow-hidden rounded-full ring-[4px] shadow-[0_18px_46px_var(--theme-shadow)]">
          {photo1DataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo1DataUrl} alt={name1} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="theme-avatar-ring theme-avatar-surface relative z-10 -ml-8 h-[176px] w-[176px] overflow-hidden rounded-full ring-[4px] shadow-[0_18px_46px_var(--theme-shadow)]">
          {photo2DataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo2DataUrl} alt={name2} className="h-full w-full object-cover" />
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex justify-center">
        <div className="theme-glass rounded-full px-5 py-2 text-[17px] font-extrabold shadow-[0_12px_30px_var(--theme-shadow)] backdrop-blur-md">
          {name1} · {name2}
        </div>
      </div>
    </div>
  );
}

function TimeDisplay({
  style,
  hours,
  minutes,
  seconds,
}: {
  style: TimeDisplayStyle;
  hours: string;
  minutes: string;
  seconds: string;
}) {
  const units = [
    { value: hours, label: "часов", max: 24 },
    { value: minutes, label: "минут", max: 60 },
    { value: seconds, label: "секунд", max: 60 },
  ];

  if (style === "glass") {
    return (
      <div className="theme-time-tray grid w-full grid-cols-3 rounded-[30px] px-4 py-4 text-center">
        {units.map((unit, index) => (
          <div
            key={unit.label}
            className={cx(index > 0 && "border-l border-[var(--theme-card-border)]")}
          >
            <div className="text-[30px] font-extrabold leading-none">{unit.value}</div>
            <div className="theme-muted-text mt-1 text-[12px] font-semibold">{unit.label}</div>
          </div>
        ))}
      </div>
    );
  }

  if (style === "orbits") {
    const secondsAngle = Number(seconds) * 6;

    return (
      <div className="theme-time-tray relative min-h-[142px] w-full overflow-hidden rounded-[38px] p-4">
        <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[var(--theme-primary)] opacity-10 blur-2xl" />
        <div className="relative z-10 grid h-full grid-cols-[minmax(0,1fr)_104px] items-center gap-4">
          <div className="grid min-w-0 grid-cols-2 gap-3">
            <div className="theme-glass rounded-[24px] px-3 py-4 text-center">
              <div className="text-[42px] font-black leading-none tracking-[-0.07em]">
                {hours}
              </div>
              <div className="theme-muted-text mt-2 text-[11px] font-bold uppercase tracking-[0.12em]">
                часы
              </div>
            </div>
            <div className="theme-glass rounded-[24px] px-3 py-4 text-center">
              <div className="text-[42px] font-black leading-none tracking-[-0.07em]">
                {minutes}
              </div>
              <div className="theme-muted-text mt-2 text-[11px] font-bold uppercase tracking-[0.12em]">
                минуты
              </div>
            </div>
          </div>

          <div
            className="flex h-[104px] w-[104px] items-center justify-center rounded-full p-2 shadow-[0_16px_42px_var(--theme-shadow)]"
            style={
              {
                background: `conic-gradient(var(--theme-primary) ${secondsAngle}deg, var(--theme-control-bg) 0deg)`,
              } as CSSProperties
            }
          >
            <div className="theme-glass relative flex h-full w-full flex-col items-center justify-center rounded-full">
              <span className="absolute h-5 w-5 rounded-full bg-[var(--theme-primary)] opacity-25 blur-md" />
              <span className="absolute h-3 w-3 animate-ping rounded-full bg-[var(--theme-primary)] opacity-30" />
              <div className="text-[30px] font-black leading-none">{seconds}</div>
              <div className="theme-muted-text mt-1 text-[10px] font-bold uppercase tracking-[0.14em]">
                сек
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-time-tray relative min-h-[136px] w-full overflow-hidden rounded-[36px] px-4 py-4">
      <div className="relative z-10 grid grid-cols-3 gap-3 text-center">
        {units.map((unit) => {
          const numericValue = Number(unit.value);
          const fill = Number.isFinite(numericValue)
            ? Math.min(100, Math.max(8, (numericValue / unit.max) * 100))
            : 8;

          return (
            <div
              key={unit.label}
              className="theme-glass relative min-w-0 overflow-hidden rounded-b-[30px] rounded-t-[18px] px-2 py-4"
            >
              <div
                className="absolute inset-x-0 bottom-0 bg-[var(--theme-primary)] opacity-25"
                style={{ height: `${fill}%` }}
              />
              <div className="relative z-10 text-[31px] font-black leading-none tracking-[-0.04em]">
                {unit.value}
              </div>
              <div className="theme-muted-text relative z-10 mt-2 text-[10px] font-bold uppercase tracking-[0.12em]">
                {unit.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DrawingCanvasEditor({
  canvas,
  onClose,
  onSave,
}: {
  canvas?: DrawingCanvas;
  onClose: () => void;
  onSave: (imageDataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [tool, setTool] = useState<DrawingTool>("brush");
  const [color, setColor] = useState("#1f2937");
  const [size, setSize] = useState(9);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    const context = canvasElement?.getContext("2d");
    if (!canvasElement || !context) return;

    let isActive = true;
    fillDrawingCanvasBackground(context);

    if (canvas?.imageDataUrl) {
      const image = new window.Image();
      image.onload = () => {
        if (!isActive) return;
        fillDrawingCanvasBackground(context);
        context.drawImage(image, 0, 0, DRAWING_CANVAS_WIDTH, DRAWING_CANVAS_HEIGHT);
      };
      image.src = canvas.imageDataUrl;
    }

    return () => {
      isActive = false;
    };
  }, [canvas?.id, canvas?.imageDataUrl]);

  const applyStrokeStyle = (context: CanvasRenderingContext2D) => {
    context.lineCap = "round";
    context.lineJoin = "round";
    context.globalCompositeOperation = "source-over";
    context.strokeStyle = tool === "eraser" ? DRAWING_CANVAS_BACKGROUND : color;
    context.fillStyle = tool === "eraser" ? DRAWING_CANVAS_BACKGROUND : color;
    context.lineWidth = tool === "eraser" ? size * 1.8 : size;
  };

  const drawDot = (context: CanvasRenderingContext2D, point: { x: number; y: number }) => {
    context.beginPath();
    context.arc(point.x, point.y, context.lineWidth / 2, 0, Math.PI * 2);
    context.fill();
  };

  const beginDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvasElement = canvasRef.current;
    const context = canvasElement?.getContext("2d");
    if (!canvasElement || !context) return;

    const point = getCanvasPoint(canvasElement, event);
    canvasElement.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = point;
    applyStrokeStyle(context);
    drawDot(context, point);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;

    event.preventDefault();
    const canvasElement = canvasRef.current;
    const context = canvasElement?.getContext("2d");
    if (!canvasElement || !context) return;

    const point = getCanvasPoint(canvasElement, event);
    const previousPoint = lastPointRef.current ?? point;
    applyStrokeStyle(context);
    context.beginPath();
    context.moveTo(previousPoint.x, previousPoint.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPointRef.current = point;
  };

  const endDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    if (typeof window !== "undefined" && !window.confirm("Очистить холст?")) return;

    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    fillDrawingCanvasBackground(context);
  };

  const saveCanvas = () => {
    const sourceCanvas = canvasRef.current;
    if (!sourceCanvas) return;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = DRAWING_CANVAS_WIDTH;
    exportCanvas.height = DRAWING_CANVAS_HEIGHT;

    const context = exportCanvas.getContext("2d");
    if (!context) return;

    fillDrawingCanvasBackground(context);
    context.drawImage(sourceCanvas, 0, 0);
    onSave(exportCanvas.toDataURL("image/jpeg", 0.9));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(5,8,18,0.74)] px-4 py-4 backdrop-blur-2xl">
      <div className="mx-auto flex min-h-full w-full max-w-[920px] flex-col justify-center">
        <div className="theme-panel rounded-[34px] p-3">
          <div className="flex items-center justify-between gap-3 px-1 pb-3">
            <div>
              <div className="text-[24px] font-extrabold leading-tight">
                {canvas ? "Редактировать холст" : "Новый холст"}
              </div>
              <div className="theme-muted-text mt-1 text-[13px] font-semibold">
                Нарисуй что-нибудь свое и нажми Готово.
              </div>
            </div>
            <button
              type="button"
              onClick={saveCanvas}
              className="theme-primary-button flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[20px] font-black shadow-[0_12px_26px_var(--theme-shadow)]"
              aria-label="Сохранить и закрыть редактор холста"
            >
              ✓
            </button>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[var(--theme-card-border)] bg-[#fffaf4] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]">
            <canvas
              ref={canvasRef}
              width={DRAWING_CANVAS_WIDTH}
              height={DRAWING_CANVAS_HEIGHT}
              className="block h-auto w-full touch-none"
              onPointerDown={beginDrawing}
              onPointerMove={draw}
              onPointerUp={endDrawing}
              onPointerCancel={endDrawing}
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="theme-glass grid gap-3 rounded-[24px] p-3 sm:grid-cols-[auto_auto_1fr] sm:items-center">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTool("brush")}
                  className={cx(
                    "theme-icon-button rounded-full border px-4 py-2 text-[13px] font-bold",
                    tool === "brush" && "theme-icon-button-active",
                  )}
                >
                  Кисть
                </button>
                <button
                  type="button"
                  onClick={() => setTool("eraser")}
                  className={cx(
                    "theme-icon-button rounded-full border px-4 py-2 text-[13px] font-bold",
                    tool === "eraser" && "theme-icon-button-active",
                  )}
                >
                  Ластик
                </button>
              </div>

              <label className="flex items-center gap-2 text-[13px] font-bold">
                Цвет
                <input
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.currentTarget.value)}
                  className="h-9 w-12 cursor-pointer rounded-full border-0 bg-transparent p-0"
                  aria-label="Цвет кисти"
                />
              </label>

              <label className="grid gap-1 text-[12px] font-bold">
                Толщина: {size}
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={size}
                  onChange={(event) => setSize(Number(event.currentTarget.value))}
                  className="accent-[var(--theme-primary)]"
                  aria-label="Толщина кисти"
                />
              </label>
            </div>

            <div className="flex gap-2 sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="theme-icon-button rounded-full border px-4 py-2 text-[13px] font-bold"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={clearCanvas}
                className="theme-icon-button rounded-full border px-4 py-2 text-[13px] font-bold"
              >
                Очистить
              </button>
              <button
                type="button"
                onClick={saveCanvas}
                className="theme-primary-button rounded-full px-5 py-2 text-[13px] font-extrabold shadow-[0_14px_28px_var(--theme-shadow)]"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawingCanvasCard({
  canvas,
  isEditing,
  onOpen,
  onDelete,
}: {
  canvas: DrawingCanvas;
  isEditing: boolean;
  onOpen: (canvasId: string) => void;
  onDelete: (canvasId: string) => void;
}) {
  return (
    <div className="relative aspect-[4/3] min-w-[230px]">
      <button
        type="button"
        onClick={() => onOpen(canvas.id)}
        className="theme-glass h-full w-full overflow-hidden rounded-[30px] border border-[var(--theme-card-border)] text-left shadow-[0_18px_44px_var(--theme-shadow)] transition duration-200 hover:-translate-y-0.5"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={canvas.imageDataUrl}
          alt="Холст"
          className="h-[72%] w-full bg-[#fffaf4] object-cover"
        />
        <div className="px-3 py-2">
          <div className="text-[14px] font-extrabold">Холст</div>
          <div className="theme-muted-text mt-0.5 truncate text-[11px] font-semibold">
            {formatDateLong(canvas.updatedAtISO.slice(0, 10))}
          </div>
        </div>
      </button>
      {isEditing ? (
        <button
          type="button"
          onClick={() => onDelete(canvas.id)}
          className="theme-icon-button absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border text-[18px] font-bold"
          aria-label="Удалить холст"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}

export default function MainScreen() {
  const settings = useRelationshipSettings();
  const albumInputRef = useRef<HTMLInputElement>(null);
  const widgetDragRef = useRef<{
    id: string;
    pointerId: number;
    startX: number;
    startY: number;
    isDragging: boolean;
    lastHoverKey: string | null;
  } | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [isEditingWidgets, setIsEditingWidgets] = useState(false);
  const [isUploadingAlbum, setIsUploadingAlbum] = useState(false);
  const [editingCanvasId, setEditingCanvasId] = useState<string | null>(null);
  const [draggingWidgetId, setDraggingWidgetId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { diff, progress } = useMemo(() => {
    const currentDiff = calcDiff(settings.startDateISO, now);

    return {
      diff: currentDiff,
      progress: getGoalProgress(currentDiff.days),
    };
  }, [settings.startDateISO, now]);
  const activeDrawingCanvas = useMemo(() => {
    if (!editingCanvasId || editingCanvasId === "new") return undefined;
    return settings.drawingCanvases.find((canvas) => canvas.id === editingCanvasId);
  }, [editingCanvasId, settings.drawingCanvases]);

  const onDeleteWidget = (widgetId: string) => {
    if (typeof window !== "undefined") {
      const shouldDelete = window.confirm("Удалить этот виджет?");
      if (!shouldDelete) return;
    }

    updateSettings((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((widget) => widget.id !== widgetId),
    }));
  };

  const onReorderWidget = (
    draggedWidgetId: string,
    targetWidgetId: string,
    placement: WidgetDropPlacement,
  ) => {
    updateSettings((prev) => {
      if (draggedWidgetId === targetWidgetId) return prev;

      const draggedWidget = prev.widgets.find((widget) => widget.id === draggedWidgetId);
      if (!draggedWidget) return prev;

      const withoutDraggedWidget = prev.widgets.filter(
        (widget) => widget.id !== draggedWidgetId,
      );
      const targetIndex = withoutDraggedWidget.findIndex(
        (widget) => widget.id === targetWidgetId,
      );
      if (targetIndex < 0) return prev;

      const insertIndex = placement === "after" ? targetIndex + 1 : targetIndex;
      const widgets = [...withoutDraggedWidget];
      widgets.splice(insertIndex, 0, draggedWidget);

      const orderChanged = widgets.some((widget, index) => widget.id !== prev.widgets[index]?.id);
      if (!orderChanged) return prev;

      return {
        ...prev,
        widgets,
      };
    });
  };

  const onStartWidgetDrag = (
    widgetId: string,
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    widgetDragRef.current = {
      id: widgetId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      isDragging: false,
      lastHoverKey: null,
    };
  };

  const onWidgetDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = widgetDragRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const movedDistance = Math.hypot(
      event.clientX - dragState.startX,
      event.clientY - dragState.startY,
    );

    if (!dragState.isDragging) {
      if (movedDistance < 8) return;
      dragState.isDragging = true;
      setDraggingWidgetId(dragState.id);
    }

    event.preventDefault();

    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-widget-id]");
    const targetWidgetId = target?.dataset.widgetId;

    if (!target || !targetWidgetId || targetWidgetId === dragState.id) return;

    const placement = getWidgetDropPlacement(event, target);
    const hoverKey = `${targetWidgetId}:${placement}`;
    if (dragState.lastHoverKey === hoverKey) return;

    dragState.lastHoverKey = hoverKey;
    onReorderWidget(dragState.id, targetWidgetId, placement);
  };

  const onEndWidgetDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = widgetDragRef.current;

    if (
      dragState &&
      dragState.pointerId === event.pointerId &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    widgetDragRef.current = null;
    setDraggingWidgetId(null);
  };

  const onPickAlbumPhotos = () => {
    albumInputRef.current?.click();
  };

  const onAlbumPhotosChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";

    if (files.length === 0) return;

    setIsUploadingAlbum(true);

    try {
      const photos = await Promise.all(
        files.map(async (file) => ({
          id: createWidgetId(),
          imageDataUrl: await prepareImageForStorage(file, {
            maxDimension: 980,
            quality: 0.82,
            targetLength: 520_000,
          }),
          createdAtISO: new Date().toISOString(),
        })),
      );

      updateSettings((prev) => ({
        ...prev,
        albumPhotos: [...photos, ...prev.albumPhotos],
      }));
    } catch {
      window.alert("Не удалось добавить фото в альбом. Попробуй выбрать другое изображение.");
    } finally {
      setIsUploadingAlbum(false);
    }
  };

  const onDeleteAlbumPhoto = (photoId: string) => {
    updateSettings((prev) => ({
      ...prev,
      albumPhotos: prev.albumPhotos.filter((photo) => photo.id !== photoId),
    }));
  };

  const onSaveDrawingCanvas = (imageDataUrl: string) => {
    const timestamp = new Date().toISOString();
    const currentCanvasId = editingCanvasId;

    updateSettings((prev) => {
      if (currentCanvasId && currentCanvasId !== "new") {
        return {
          ...prev,
          drawingCanvases: prev.drawingCanvases.map((canvas) =>
            canvas.id === currentCanvasId
              ? {
                  ...canvas,
                  imageDataUrl,
                  updatedAtISO: timestamp,
                }
              : canvas,
          ),
        };
      }

      return {
        ...prev,
        drawingCanvases: [
          {
            id: createWidgetId(),
            imageDataUrl,
            createdAtISO: timestamp,
            updatedAtISO: timestamp,
          },
          ...prev.drawingCanvases,
        ],
      };
    });

    setEditingCanvasId(null);
  };

  const onDeleteDrawingCanvas = (canvasId: string) => {
    if (typeof window !== "undefined") {
      const shouldDelete = window.confirm("Удалить этот холст?");
      if (!shouldDelete) return;
    }

    updateSettings((prev) => ({
      ...prev,
      drawingCanvases: prev.drawingCanvases.filter((canvas) => canvas.id !== canvasId),
    }));
  };

  const albumDateLabel =
    settings.albumPhotos.length > 0
      ? formatDateLong(settings.albumPhotos[0]?.createdAtISO.slice(0, 10) ?? settings.startDateISO)
      : "Добавь первые фото";
  const canvasCountLabel =
    settings.drawingCanvases.length > 0
      ? `${settings.drawingCanvases.length} ${ruPlural(
          settings.drawingCanvases.length,
          "холст",
          "холста",
          "холстов",
        )}`
      : "Нажми плюс и нарисуй первый";

  return (
    <div className="theme-screen">
      {editingCanvasId ? (
        <DrawingCanvasEditor
          canvas={activeDrawingCanvas}
          onClose={() => setEditingCanvasId(null)}
          onSave={onSaveDrawingCanvas}
        />
      ) : null}

      <div className="relative h-[52px]">
        <div className="absolute left-0 top-3">
          <button
            type="button"
            onClick={() => setIsEditingWidgets((value) => !value)}
            className={`theme-icon-button flex h-[38px] w-[38px] items-center justify-center rounded-full border ${
              isEditingWidgets ? "theme-icon-button-active" : ""
            }`}
            aria-label="Переключить режим редактирования виджетов"
          >
            <Image
              src="/icons/brush.png"
              alt="brush"
              width={18}
              height={18}
              className="opacity-90"
            />
          </button>
        </div>

        <div className="absolute left-1/2 top-4 -translate-x-1/2">
          <span className="text-[28px] font-extrabold leading-none">CHAINSO</span>
        </div>

        <div className="absolute right-0 top-3">
          <Link
            href="/settings"
            className="theme-icon-button flex h-[38px] w-[38px] items-center justify-center rounded-full border"
            aria-label="Открыть настройки"
          >
            <Image
              src="/icons/gear.png"
              alt="settings"
              width={18}
              height={18}
              className="opacity-90"
            />
          </Link>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center">
        <div className="theme-subtle-text text-[17px] font-semibold leading-none">
          {diff.days} ДНЕЙ
        </div>

        <div className="mt-1">
          <Image
            src="/icons/heart.png"
            alt="heart"
            width={30}
            height={30}
            className="opacity-80"
          />
        </div>
      </div>

      <div className="mt-0 flex justify-center gap-4">
        {settings.avatarDisplayStyle === "duo-card" ? (
          <CoupleCameo
            name1={settings.name1}
            name2={settings.name2}
            photo1DataUrl={settings.photo1DataUrl}
            photo2DataUrl={settings.photo2DataUrl}
          />
        ) : (
          <>
            <CoupleAvatar
              name={settings.name1}
              photoDataUrl={settings.photo1DataUrl}
              style={settings.avatarDisplayStyle}
            />
            <CoupleAvatar
              name={settings.name2}
              photoDataUrl={settings.photo2DataUrl}
              style={settings.avatarDisplayStyle}
            />
          </>
        )}
      </div>

      <div className="mt-7">
        <div className="theme-subtle-text flex justify-end pr-1 text-[13px] font-semibold">
          {progress.percent}%
        </div>

        <div className="theme-progress-track mt-2 h-[10px] overflow-hidden rounded-full">
          <div
            className="theme-primary-button h-full rounded-full"
            style={{ width: `${progress.bar}%` }}
          />
        </div>

        <div className="theme-subtle-text mt-2 flex justify-between px-1 text-[13px] font-normal">
          <div>{progress.goal} дней</div>
          <div>{progress.leftDays} дня осталось</div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="theme-subtle-text text-[22px] font-semibold">Вместе уже:</div>
        <div className="mt-1 text-[28px] font-semibold leading-tight">
          {formatTogether(diff.years, diff.months, diff.day)}
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <TimeDisplay
          style={settings.timeDisplayStyle}
          hours={format2(diff.hours)}
          minutes={format2(diff.minutes)}
          seconds={format2(diff.seconds)}
        />
      </div>

      <div className="mt-7 flex items-center justify-between">
        <div className="text-[30px] font-extrabold">Виджеты</div>
        {isEditingWidgets ? (
          <div className="theme-action-chip rounded-full border px-3 py-1 text-[12px] font-semibold">
            Зажми и перетащи
          </div>
        ) : null}
      </div>

      {settings.widgets.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {settings.widgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              isEditing={isEditingWidgets}
              isDragging={draggingWidgetId === widget.id}
              onDelete={onDeleteWidget}
              onDragStart={onStartWidgetDrag}
              onDragMove={onWidgetDragMove}
              onDragEnd={onEndWidgetDrag}
            />
          ))}
        </div>
      ) : (
        <div className="theme-dashed-card mt-6 rounded-[28px] border-2 border-dashed px-5 py-8 text-center text-[15px]">
          Пока нет виджетов. Добавь первый, и здесь появится ваша история.
        </div>
      )}

      <Link
        href="/widget/new"
        className="theme-dashed-card-strong mt-6 block rounded-[28px] border-2 border-dashed py-4 text-center text-[16px] font-semibold"
      >
        + добавить виджет
      </Link>

      <div className="mt-10 flex items-center justify-between gap-3">
        <div>
          <div className="text-[28px] font-extrabold">Холсты</div>
          <div className="theme-muted-text mt-1 text-[13px] font-semibold">
            {canvasCountLabel}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditingCanvasId("new")}
          className="theme-action-chip rounded-full border px-3 py-1.5 text-[12px] font-bold"
        >
          + холст
        </button>
      </div>

      {settings.drawingCanvases.length > 0 ? (
        <div className="-mx-1 mt-5 flex gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {settings.drawingCanvases.map((canvas) => (
            <DrawingCanvasCard
              key={canvas.id}
              canvas={canvas}
              isEditing={isEditingWidgets}
              onOpen={setEditingCanvasId}
              onDelete={onDeleteDrawingCanvas}
            />
          ))}
        </div>
      ) : null}

      <div className="mt-10 flex items-center justify-between">
        <div className="text-[28px] font-extrabold">Альбом</div>
        <button
          type="button"
          onClick={onPickAlbumPhotos}
          disabled={isUploadingAlbum}
          className="theme-action-chip rounded-full border px-3 py-1.5 text-[12px] font-bold disabled:opacity-55"
        >
          {isUploadingAlbum ? "Загрузка..." : "+ фото"}
        </button>
      </div>

      <div className="theme-dashed-card mt-5 rounded-[28px] border-2 border-dashed px-4 py-3 text-center text-[15px] font-semibold">
        {albumDateLabel}
      </div>

      {settings.albumPhotos.length > 0 ? (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {settings.albumPhotos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-[24px] shadow-[0_14px_34px_var(--theme-shadow)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.imageDataUrl}
                alt="Фото из альбома"
                className="h-full w-full object-cover"
              />
              {isEditingWidgets ? (
                <button
                  type="button"
                  onClick={() => onDeleteAlbumPhoto(photo.id)}
                  className="theme-icon-button absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border text-[16px] font-bold"
                  aria-label="Удалить фото из альбома"
                >
                  ×
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {["фото", "фото", "фото"].map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={onPickAlbumPhotos}
              className="theme-dashed-card flex aspect-square items-center justify-center rounded-[24px] border-2 border-dashed text-[14px] font-normal"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      <input
        ref={albumInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onAlbumPhotosChange}
      />

      <div className="h-10" />
    </div>
  );
}
