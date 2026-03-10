"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { Vehicle } from "@/lib/fitment";

type GarageContextValue = {
  vehicle: Vehicle | null;
  setVehicle: (vehicle: Vehicle | null) => void;
};

const GarageContext = createContext<GarageContextValue | undefined>(undefined);

const STORAGE_KEY = "fatman_my_garage";

// Listeners for useSyncExternalStore
let listeners: Array<() => void> = [];

function subscribe(cb: () => void) {
  listeners = [...listeners, cb];
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

function emitChange() {
  for (const l of listeners) l();
}

function getSnapshot(): string | null {
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

function parseVehicle(raw: string | null): Vehicle | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Vehicle;
  } catch {
    return null;
  }
}

export function GarageProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const vehicle = useMemo(() => parseVehicle(raw), [raw]);

  const setVehicle = useCallback((next: Vehicle | null) => {
    if (typeof window === "undefined") return;

    if (!next) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }

    emitChange();
  }, []);

  const value = useMemo(() => ({ vehicle, setVehicle }), [vehicle, setVehicle]);

  return <GarageContext.Provider value={value}>{children}</GarageContext.Provider>;
}

export function useGarage() {
  const context = useContext(GarageContext);
  if (!context) {
    throw new Error("useGarage must be used inside GarageProvider");
  }
  return context;
}
