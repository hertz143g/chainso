// src/app/page.tsx
import MainScreen from "@/components/pair/MainScreen";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1326] via-[#0e1b3d] to-[#4c5f86]">
      {/* “мобильный холст”, без рамки телефона */}
      <div className="w-full max-w-[360px] mx-auto px-4 py-6">
        <MainScreen />
      </div>
    </main>
  );
}