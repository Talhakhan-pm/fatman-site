import type { Vehicle } from "@/lib/fitment";

export const demoVehicle: Vehicle = {
  year: "2022",
  make: "Honda",
  model: "Accord",
  engine: "2.0T",
};

export const DEMO_MODE_STORAGE_KEY = "fatman_demo_mode";

export function enableDemoMode() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_MODE_STORAGE_KEY, "1");
  window.localStorage.setItem("fatman_my_garage", JSON.stringify(demoVehicle));
}

export function disableDemoMode() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
}

export function isDemoMode() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DEMO_MODE_STORAGE_KEY) === "1";
}
