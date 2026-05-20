import { InfoCard, InfoGrid, InfoList, InfoPage, InfoSection } from "@/components/info-page";

export const metadata = {
  title: "Terms & Conditions",
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms"
      title="Terms & Conditions"
      description="By using Fatman Parts or placing an order, you agree to the storefront rules below. The plain-English version: use the site honestly, verify fitment when needed, and contact us early if something goes wrong."
      cta={{ href: "/contact", label: "Contact support" }}
    >
      <InfoSection title="Storefront use">
        <p>
          Product information, pricing, availability, fitment data, and shipping estimates may change as supplier data, catalog data, or carrier conditions change. We work to keep the site accurate, but automotive catalog data can be imperfect.
        </p>
      </InfoSection>

      <InfoGrid>
        <InfoCard title="Fitment responsibility">
          <p>
            Confirmed Fit means we have enough data to show confidence. Verify Fitment or Fitment Unknown means you should contact us with VIN/trim/engine details before ordering.
          </p>
        </InfoCard>
        <InfoCard title="Pricing and availability">
          <p>
            Prices and availability can change before an order is finalized. If a supplier issue affects an order after purchase, we’ll contact you with options.
          </p>
        </InfoCard>
      </InfoGrid>

      <InfoSection title="Orders, cancellation, and returns">
        <InfoList
          items={[
            "Cancellation requests are handled based on order status.",
            "Once a shipment is handed to a carrier, the return policy applies.",
            "Returned items must meet condition and packaging requirements.",
            "Special-order, electrical, opened, installed, or supplier-restricted items may not be eligible for standard returns.",
          ]}
        />
      </InfoSection>

      <InfoSection title="Third-party links and services">
        <p>
          The site may rely on payment processors, shipping carriers, hosting providers, analytics, or other tools. Their services may have separate terms or privacy rules.
        </p>
      </InfoSection>

      <InfoSection title="Limitation of liability">
        <p>
          Fatman Parts is not responsible for indirect losses, installation mistakes, misuse, vehicle downtime, labor costs, or damage caused by incorrect installation. Always use qualified installation and verify fitment before installing parts.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
