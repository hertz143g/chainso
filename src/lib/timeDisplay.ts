export function clampTimeUnit(value: number, max: number) {
  return Number.isFinite(value) ? Math.min(max - 1, Math.max(0, Math.floor(value))) : 0;
}

// Keep the orbit moving forward at 59 → 00 instead of rotating backwards.
export function nextOrbitAngle(previous: number, value: number, max: number, angle: number) {
  return angle + ((value - previous + max) % max) * (360 / max);
}
