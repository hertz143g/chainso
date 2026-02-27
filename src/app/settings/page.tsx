import PhoneFrame from "@/components/layout/PhoneFrame";
import SettingsScreen from "@/components/pair/SettingsScreen";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[#0b1020] flex items-start justify-center py-6">
      <PhoneFrame>
        <SettingsScreen />
      </PhoneFrame>
    </main>
  );
}