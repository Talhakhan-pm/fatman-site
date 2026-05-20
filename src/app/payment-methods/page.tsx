import { InfoCard, InfoGrid, InfoPage, InfoSection } from "@/components/info-page";

export const metadata = {
  title: "Payment Methods",
};

export default function PaymentMethodsPage() {
  return (
    <InfoPage
      eyebrow="Checkout"
      title="Payment Methods"
      description="Checkout should feel boring in the best way: clear totals, secure processing, and no sketchy surprises."
      cta={{ href: "/cart", label: "View cart" }}
    >
      <InfoGrid>
        <InfoCard title="Cards">
          <p>
            We plan to support major credit and debit cards through a secure payment processor. Card details are handled by the payment provider, not stored directly by Fatman Parts.
          </p>
        </InfoCard>
        <InfoCard title="Digital wallets">
          <p>
            Where available, wallet options such as Apple Pay, Google Pay, or similar accelerated checkout methods may appear based on device, browser, and payment provider support.
          </p>
        </InfoCard>
      </InfoGrid>

      <InfoSection title="Payment security">
        <p>
          Payment information is processed through encrypted checkout flows. We use order and contact details to process transactions, support customers, prevent fraud, and fulfill shipments.
        </p>
      </InfoSection>

      <InfoSection title="Payment issues">
        <p>
          If a payment fails, double-check billing details, card limits, and bank fraud alerts. If the issue continues, contact support with the item you’re trying to order and we’ll help you troubleshoot.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
