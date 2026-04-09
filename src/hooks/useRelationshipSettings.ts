"use client";

import { useSyncExternalStore } from "react";
import {
  getSettingsServerSnapshot,
  getSettingsSnapshot,
  subscribeSettings,
} from "@/lib/relationship";

export default function useRelationshipSettings() {
  return useSyncExternalStore(
    subscribeSettings,
    getSettingsSnapshot,
    getSettingsServerSnapshot,
  );
}
