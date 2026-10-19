import AppFrame from "@/components/pair/AppFrame";
import GiftsScreen from "@/components/pair/GiftsScreen";

export const metadata = {
  title: "Маркетплейс подарков — CHAINSO",
};

export default function GiftsPage() {
  return (
    <AppFrame>
      <GiftsScreen />
    </AppFrame>
  );
}
