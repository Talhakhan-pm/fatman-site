import type { Metadata } from "next";
import { CheckoutSuccessClient } from "@/components/checkout-success-client";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your Fatman Parts order confirmation.",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  return <CheckoutSuccessClient sessionId={params.session_id} />;
}
