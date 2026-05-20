import { InfoCard, InfoGrid, InfoList, InfoPage, InfoSection } from "@/components/info-page";

export const metadata = {
  title: "Terms & Conditions",
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms"
      title="Terms & Conditions"
      description="By using Fatman Parts or placing an order, you agree to the storefront rules below. Use the site honestly, verify fitment when needed, and contact us early if something goes wrong."
      cta={{ href: "/contact", label: "Contact support" }}
    >
      <InfoSection title="Company information">
        <p>
          These Terms & Conditions apply to Fatman Parts LLC, 6779 Beadnell Way, San Diego, CA 92117. Contact: help@fatmanparts.com.
        </p>
      </InfoSection>

      <InfoSection title="Storefront use">
        <p>
          Product information, pricing, availability, fitment data, and shipping estimates may change as supplier data, catalog data, or carrier conditions change. We work to keep the site accurate, but automotive catalog data can be imperfect.
        </p>
      </InfoSection>

      <InfoGrid>
        <InfoCard title="Fitment responsibility">
          <p>
            Confirmed Fit means we have enough data to show confidence. Verify Fitment or Fitment Unknown means you should contact us with VIN, color, trim, engine, or part-number details before ordering.
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
            "Cancellation within 24 hours is eligible for 100% item and shipping refund if the order has not shipped.",
            "Cancellation after 24 hours may be subject to a 30% supplier/distributor cancellation fee once processing has started.",
            "Once a shipment is handed to a carrier, the Return Policy applies.",
            "Parts must be unused, uninstalled, and in original factory packaging for return consideration.",
            "Incorrectly selected, change-of-mind, special-order, opened, installed, electrical, or supplier-restricted parts may not be eligible for standard returns.",
          ]}
        />
      </InfoSection>

      <InfoSection title="Third-party links and services">
        <p>
          The site may rely on payment processors, shipping carriers, hosting providers, analytics, fraud-prevention tools, or other services. Their services may have separate terms or privacy rules.
        </p>
      </InfoSection>

      <InfoSection title="Limitation of liability">
        <p>
          Fatman Parts is not responsible for indirect losses, installation mistakes, misuse, vehicle downtime, labor costs, customs charges, delivery delays outside our control, or damage caused by incorrect installation. Always use qualified installation and verify fitment before installing parts.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
