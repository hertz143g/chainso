import PhoneFrame from "@/components/layout/PhoneFrame";
import NewWidgetScreen from "@/components/pair/NewWidgetScreen";

export default function NewWidgetPage() {
  return (
    <main className="min-h-screen bg-[#0b1020] flex items-start justify-center py-6">
      <PhoneFrame>
        <NewWidgetScreen />
      </PhoneFrame>
    </main>
  );
}