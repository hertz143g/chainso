// src/components/ui/TimeBox.tsx
export default function TimeBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="theme-primary-button w-[86px] rounded-[18px] py-4 text-center">
      <div className="text-[28px] font-extrabold leading-none">{value}</div>
      <div className="text-[13px] font-semibold opacity-95 mt-1">{label}</div>
    </div>
  );
}
