import { InfoCard, InfoGrid, InfoPage, InfoSection } from "@/components/info-page";

export const metadata = {
  title: "Cancellation Policy",
};

export default function CancellationPolicyPage() {
  return (
    <InfoPage
      eyebrow="Orders"
      title="Cancellation Policy"
      description="Automotive parts can move fast once an order is submitted. This policy explains when cancellations are simple and when supplier or processing costs may apply."
      cta={{ href: "/contact", label: "Request cancellation help" }}
    >
      <InfoGrid>
        <InfoCard title="Before processing starts">
          <p>
            If your order has not entered processing, sourcing, packing, or shipment preparation, we’ll do our best to cancel it cleanly.
          </p>
        </InfoCard>
        <InfoCard title="After processing starts">
          <p>
            If a part has already been sourced, ordered from a supplier, packed, or prepared for shipment, cancellation may be limited or may involve restocking, supplier, or processing costs.
          </p>
        </InfoCard>
      </InfoGrid>

      <InfoSection title="Special-order parts">
        <p>
          Some parts are not stocked locally and may be ordered specifically for a customer. Once a supplier accepts a special-order request, cancellation may not be guaranteed.
        </p>
      </InfoSection>

      <InfoSection title="After shipment">
        <p>
          Once an order is handed to the carrier, cancellation no longer applies. At that point, the return policy controls what can happen next.
        </p>
      </InfoSection>

      <InfoSection title="How to request cancellation">
        <p>
          Contact us as soon as possible with your order number and the reason for the request. The faster you reach out, the more options we usually have.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
