import { ruPlural } from "@/lib/relationship";

export function eventDayLabel(dateISO: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return null;
  const [year, month, day] = dateISO.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  const delta = Math.round((Date.UTC(year, month - 1, day) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
  const count = Math.abs(delta);
  const duration = `${count} ${ruPlural(count, "день", "дня", "дней")}`;
  return delta === 0 ? "Сегодня" : delta > 0 ? `Через ${duration}` : `${duration} назад`;
}
