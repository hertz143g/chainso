export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[260px] mx-auto">
      <div className="border border-[#1c2d4a] rounded-[20px] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-b from-[#0b1326] via-[#0e1b3d] to-[#4c5f86] min-h-[920px] px-4 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}