import { InfoCard, InfoGrid, InfoList, InfoPage, InfoSection } from "@/components/info-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description: "Learn about Fatman Parts delivery times, shipping carriers, handling of oversized packages, international duties, and reporting shipping damage.",
  alternates: {
    canonical: "/shipping",
  },
};

export default function ShippingPage() {
  return (
    <InfoPage
      eyebrow="Orders & logistics"
      title="Shipping & Delivery"
      description="Fatman Parts LLC ships from San Diego, CA and trusted fulfillment partners. We use reliable carriers, provide tracking, and contact customers when an order needs extra handling."
      cta={{ href: "/contact", label: "Ask about an order" }}
    >
      <InfoGrid>
        <InfoCard title="Dispatch timing">
          <p>
            When parts are in stock, we aim to ship within 3–6 working days depending on the brand, supplier, and item category.
          </p>
        </InfoCard>
        <InfoCard title="Carriers & tracking">
          <p>
            Orders may ship by UPS, FedEx, USPS, DHL, or another trusted carrier based on destination, package size, and service availability. Tracking is provided once the carrier receives the package.
          </p>
        </InfoCard>
      </InfoGrid>

      <InfoSection title="If an item is not in stock">
        <p>
          If a part is not currently in stock or needs to be ordered from a supplier, our support team will contact you by email with the expected preparation timeline. If there is a meaningful delay, we’ll explain your available options.
        </p>
      </InfoSection>

      <InfoSection title="Large or oversized parts">
        <p>
          Some automotive parts are expensive to move because of size, weight, or packaging requirements: body panels, bumpers, cargo carriers, exhausts, fenders, frames, grilles, roof racks, transmissions, wheels, windshields, engines, and similar items.
        </p>
        <p>
          If an order exceeds standard carrier limits or requires freight/special handling, an additional shipping charge may apply. We’ll invoice any extra required shipping cost by an accepted payment method before shipment is finalized.
        </p>
      </InfoSection>

      <InfoSection title="Import duties and taxes">
        <p>
          Fatman Parts is U.S.-based. If an international shipment is supported, the recipient is responsible for any import duties, taxes, brokerage fees, customs charges, or destination-country fees assessed by the carrier or government authority.
        </p>
      </InfoSection>

      <InfoSection title="Damaged parcels">
        <InfoList
          items={[
            "Inspect the package before opening when possible.",
            "Photograph visible damage, crushed corners, torn boxes, missing labels, or tampering.",
            "Keep the product and packaging until the issue is resolved.",
            "Report the issue to the carrier when required and contact help@fatmanparts.com with your order number, photos, and a clear description.",
          ]}
        />
      </InfoSection>

      <InfoSection title="Business details">
        <p>
          Fatman Parts LLC · 6779 Beadnell Way, San Diego, CA 92117 · (844) 737-1463 · help@fatmanparts.com
        </p>
      </InfoSection>
    </InfoPage>
  );
}
