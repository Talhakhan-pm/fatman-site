import { InfoCard, InfoGrid, InfoList, InfoPage, InfoSection } from "@/components/info-page";

export const metadata = {
  title: "Shipping & Delivery",
};

export default function ShippingPage() {
  return (
    <InfoPage
      eyebrow="Orders & logistics"
      title="Shipping & Delivery"
      description="We keep shipping clear before and after checkout: fast dispatch when inventory is ready, tracking when the carrier has the parcel, and a heads-up if an item needs extra handling."
      cta={{ href: "/contact", label: "Ask about an order" }}
    >
      <InfoGrid>
        <InfoCard title="Dispatch timing">
          <p>
            In-stock items are prepared as quickly as possible. Special-order, oversized, or supplier-sourced parts may need extra processing time before they ship.
          </p>
        </InfoCard>
        <InfoCard title="Tracking">
          <p>
            Once an order ships, tracking information is provided so you can follow the package from carrier pickup to delivery.
          </p>
        </InfoCard>
      </InfoGrid>

      <InfoSection title="Large or oversized parts">
        <p>
          Some automotive parts are expensive to move because of size, weight, or packaging requirements: body panels, bumpers, wheels, exhaust components, engines, transmissions, glass, and similar items.
        </p>
        <p>
          If an item requires freight, special handling, or additional carrier charges, we’ll contact you before finalizing that shipment cost.
        </p>
      </InfoSection>

      <InfoSection title="Delivery issues or damage">
        <InfoList
          items={[
            "Inspect the package before opening when possible.",
            "Photograph visible damage, crushed corners, torn boxes, or missing labels.",
            "Keep the packaging until the issue is resolved.",
            "Contact us with your order number, photos, and a clear description of the problem.",
          ]}
        />
      </InfoSection>

      <InfoSection title="International orders">
        <p>
          Fatman Parts is U.S.-focused. If an international shipment is supported, the buyer may be responsible for import duties, taxes, brokerage fees, or customs delays charged by the destination country or carrier.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
