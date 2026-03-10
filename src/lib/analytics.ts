export type AnalyticsEvent =
  | "view_item"
  | "add_to_cart"
  | "begin_checkout"
  | "fitment_confirmed"
  | "vin_verify_clicked"
  | "vin_decoded";

export function track(event: AnalyticsEvent, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const data = { event, ts: Date.now(), ...payload };
  // for future GTM/GA hookup
  (window as Window & { dataLayer?: unknown[] }).dataLayer =
    (window as Window & { dataLayer?: unknown[] }).dataLayer ?? [];
  (window as Window & { dataLayer?: unknown[] }).dataLayer?.push(data);

  // dev visibility
  if (process.env.NODE_ENV !== "production") {
    console.log("[analytics]", data);
  }
}
