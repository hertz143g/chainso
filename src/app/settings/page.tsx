// src/app/settings/page.tsx
import SettingsScreen from "@/components/pair/SettingsScreen";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1326] via-[#0e1b3d] to-[#4c5f86]">
      <div className="w-full max-w-[360px] mx-auto px-4 py-6">
        <SettingsScreen />
      </div>
    </main>
  );
}