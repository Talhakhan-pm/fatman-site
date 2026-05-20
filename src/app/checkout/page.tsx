import type { Metadata } from "next";
import { CheckoutPageClient } from "@/components/checkout-page-client";

export const metadata: Metadata = {
  title: "Checkout | Fatman Parts",
  description: "Start secure checkout for your Fatman Parts order.",
  alternates: { canonical: "/checkout" },
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
