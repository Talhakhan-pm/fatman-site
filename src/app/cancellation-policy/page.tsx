import { InfoCard, InfoGrid, InfoList, InfoPage, InfoSection } from "@/components/info-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description: "Understand our cancellation policies, timeframes, refunds, supplier fees, and how to cancel your order before it ships.",
  alternates: {
    canonical: "/cancellation-policy",
  },
};

export default function CancellationPolicyPage() {
  return (
    <InfoPage
      eyebrow="Orders"
      title="Cancellation Policy"
      description="Some parts are stocked, while others may be sourced from manufacturer or supplier distribution networks after checkout. Please review this policy before completing your purchase."
      cta={{ href: "/contact", label: "Request cancellation help" }}
    >
      <InfoSection title="When this policy applies">
        <p>
          This cancellation policy applies until the order is handed to the shipping carrier. Once the order is shipped, the Return Policy applies instead.
        </p>
      </InfoSection>

      <InfoGrid>
        <InfoCard title="Cancellation within 24 hours">
          <p>
            If you cancel a paid order within 24 hours, we do not charge a cancellation fee.
          </p>
          <InfoList items={["Item cost: 100% refundable", "Shipping cost: 100% refundable"]} />
          <p>
            For orders placed on Saturday or Sunday, the 24-hour period begins Monday at 12:00 AM.
          </p>
        </InfoCard>
        <InfoCard title="Cancellation after 24 hours">
          <p>
            If the order has not started processing, we can usually cancel without fees. If it is already processing, we may need to request cancellation from the supplier or distributor.
          </p>
          <InfoList items={["Item cost: 70% refundable if supplier cancellation fee applies", "Shipping cost: 100% refundable before shipment", "Cancellation fee: 30% when imposed after processing starts"]} />
        </InfoCard>
      </InfoGrid>

      <InfoSection title="Backordered parts">
        <p>
          If parts in your order are backordered, we’ll provide the expected timeline. If you agree to wait and later cancel, the supplier or manufacturer may retain a 30% cancellation fee.
        </p>
      </InfoSection>

      <InfoSection title="Force majeure and major disruptions">
        <p>
          War, natural disasters, pandemics, major transportation disruption, government restriction, sanctions, supplier interruption, or other events outside our control may affect sourcing, cancellation timing, and refund availability. Any applicable cancellation fee will be confirmed before we finalize the cancellation.
        </p>
      </InfoSection>

      <InfoSection title="How to request cancellation">
        <p>
          Email help@fatmanparts.com as soon as possible with your order number and cancellation reason. Faster contact gives us more room to stop processing before supplier fees or shipping steps begin.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
