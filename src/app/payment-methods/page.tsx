import { InfoCard, InfoGrid, InfoList, InfoPage, InfoSection } from "@/components/info-page";

export const metadata = {
  title: "Payment Methods",
};

export default function PaymentMethodsPage() {
  return (
    <InfoPage
      eyebrow="Checkout"
      title="Payment Methods"
      description="Fatman Parts LLC supports the common payment methods customers expect in the U.S., with secure processing and clear checkout totals."
      cta={{ href: "/cart", label: "View cart" }}
    >
      <InfoGrid>
        <InfoCard title="Credit & debit cards">
          <p>
            We accept major U.S. card networks including Visa, Mastercard, American Express, and Discover through a secure payment processor.
          </p>
        </InfoCard>
        <InfoCard title="Digital wallets">
          <p>
            Where available, Apple Pay, Google Pay, PayPal, and other common accelerated checkout options may appear based on your device, browser, and payment provider support.
          </p>
        </InfoCard>
      </InfoGrid>

      <InfoSection title="Payment security">
        <p>
          Payment information is processed through encrypted checkout flows. Fatman Parts does not directly store full credit card numbers on its own servers.
        </p>
      </InfoSection>

      <InfoSection title="Why a payment may fail">
        <InfoList
          items={[
            "Billing address or ZIP code mismatch.",
            "Bank fraud protection or spending limits.",
            "Expired card or insufficient funds.",
            "Browser/device wallet verification failure.",
          ]}
        />
        <p>
          If payment keeps failing, contact help@fatmanparts.com with the item you’re trying to order and we’ll help troubleshoot.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
