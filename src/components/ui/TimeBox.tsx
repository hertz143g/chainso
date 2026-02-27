export default function TimeBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="w-[58px] rounded-[12px] bg-[#4a84e0] text-white text-center py-2">
      <div className="text-[14px] font-semibold leading-none">{value}</div>
      <div className="text-[9px] opacity-90 mt-1">{label}</div>
    </div>
  );
}