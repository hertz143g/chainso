"use client";

import { createContext, useContext, type Dispatch, type SetStateAction } from "react";
import type { RelationshipSettings } from "@/lib/relationship";

export const AppearancePreviewContext = createContext<Dispatch<SetStateAction<RelationshipSettings | null>> | null>(null);

export function useAppearancePreview() {
  return useContext(AppearancePreviewContext);
}
