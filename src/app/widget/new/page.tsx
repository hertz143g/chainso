// src/app/widget/new/page.tsx
import NewWidgetScreen from "@/components/pair/NewWidgetScreen";

export default function NewWidgetPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1326] via-[#0e1b3d] to-[#4c5f86]">
      <div className="w-full max-w-[360px] mx-auto px-4 py-6 overflow-x-hidden">
        <NewWidgetScreen />
      </div>
    </main>
  );
}