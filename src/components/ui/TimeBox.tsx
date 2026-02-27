// src/components/ui/TimeBox.tsx
export default function TimeBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="w-[86px] rounded-[18px] bg-[#3F86FF] text-white text-center py-4">
      <div className="text-[28px] font-extrabold leading-none">{value}</div>
      <div className="text-[13px] font-semibold opacity-95 mt-1">{label}</div>
    </div>
  );
}