"use client";

import { useState, type CSSProperties } from "react";
import useClock from "@/hooks/useClock";
import { calcDiff, format2, type TimeDisplayStyle } from "@/lib/relationship";
import { clampTimeUnit, nextOrbitAngle } from "@/lib/timeDisplay";

function RollingDigit({ value }: { value: string }) {
  const [frame, setFrame] = useState({ value, previous: "" });
  if (frame.value !== value) setFrame({ value, previous: frame.value });

  return (
    <span className="timer-digit" aria-hidden="true">
      {frame.previous ? (
        <span key={`out-${frame.previous}`} className="timer-digit-previous">{frame.previous}</span>
      ) : null}
      <span key={`in-${frame.value}`} className={frame.previous ? "timer-digit-current timer-digit-enter" : "timer-digit-current"}>
        {frame.value}
      </span>
    </span>
  );
}

function TimeValue({ value, compact }: { value: number; compact: boolean }) {
  const text = format2(value);
  return (
    <span className="timer-value" aria-hidden="true">
      {compact ? text : text.split("").map((digit, index) => <RollingDigit key={index} value={digit} />)}
    </span>
  );
}

function Orbit({ value, max, compact, label }: { value: number; max: number; compact: boolean; label: string }) {
  const [orbit, setOrbit] = useState({ value, angle: value * 360 / max });
  if (value !== orbit.value) {
    setOrbit({ value, angle: nextOrbitAngle(orbit.value, value, max, orbit.angle) });
  }

  return (
    <div className="timer-orbit">
      <svg className="timer-orbit-svg" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="timer-orbit-track" cx="50" cy="50" r="43" />
        <circle
          className="timer-orbit-progress"
          cx="50" cy="50" r="43" pathLength="100"
          strokeDasharray="100 100"
          strokeDashoffset={100 - (value / max) * 100}
          style={{ transitionDuration: value === 0 || compact ? "0ms" : "850ms" }}
        />
      </svg>
      <span className="timer-orbit-hand" aria-hidden="true" style={{ transform: `rotate(${orbit.angle}deg)` }}>
        <span />
      </span>
      <div className="timer-orbit-content">
        <TimeValue value={value} compact={compact} />
        <span className="timer-label">{label}</span>
      </div>
    </div>
  );
}

export default function TimeDisplay({
  style, hours, minutes, seconds, compact = false,
}: {
  style: TimeDisplayStyle;
  hours: number;
  minutes: number;
  seconds: number;
  compact?: boolean;
}) {
  const units = [
    { value: clampTimeUnit(hours, 24), label: compact ? "ч" : "часов", max: 24 },
    { value: clampTimeUnit(minutes, 60), label: compact ? "м" : "минут", max: 60 },
    { value: clampTimeUnit(seconds, 60), label: compact ? "с" : "секунд", max: 60 },
  ];
  return (
    <div
      className={`theme-time-tray timer-display timer-${style}${compact ? " timer-compact" : ""}`}
      role={compact ? undefined : "timer"}
      aria-live="off"
      aria-label={compact ? undefined : `${units[0].value} ч ${units[1].value} мин ${units[2].value} сек`}
      aria-hidden={compact || undefined}
    >
      <div key={style} className="timer-layout">
        {units.map((unit) => style === "orbits" ? (
          <Orbit key={unit.label} {...unit} compact={compact} />
        ) : (
          <div key={unit.label} className="timer-cell">
            {style === "hourglass" ? (
              <div className="timer-liquid" aria-hidden="true" style={{ "--timer-fill": unit.value / unit.max } as CSSProperties}>
                <span className="timer-liquid-wave" />
              </div>
            ) : null}
            <TimeValue value={unit.value} compact={compact} />
            <span className="timer-label">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RelationshipTimer({ startDateISO, style, demo = false }: {
  startDateISO: string;
  style: TimeDisplayStyle;
  demo?: boolean;
}) {
  const now = useClock();
  const diff = calcDiff(startDateISO, now);
  return <TimeDisplay style={style} hours={demo ? 8 : diff.hours} minutes={demo ? 24 : diff.minutes} seconds={demo ? now.getSeconds() : diff.seconds} />;
}
