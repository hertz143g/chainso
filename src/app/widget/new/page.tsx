// src/app/widget/new/page.tsx
import AppFrame from "@/components/pair/AppFrame";
import NewWidgetScreen from "@/components/pair/NewWidgetScreen";
import { Suspense } from "react";

export default function NewWidgetPage() {
  return (
    <AppFrame>
      <Suspense fallback={null}>
        <NewWidgetScreen />
      </Suspense>
    </AppFrame>
  );
}
