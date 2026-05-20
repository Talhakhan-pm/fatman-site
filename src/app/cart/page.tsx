import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart-page-client";

export const metadata: Metadata = {
  title: "Cart | Fatman Parts",
  description: "Review your Fatman Parts cart before secure checkout.",
  alternates: { canonical: "/cart" },
};

export default function CartPage() {
  return <CartPageClient />;
}
