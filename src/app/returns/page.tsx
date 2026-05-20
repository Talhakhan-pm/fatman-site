import { InfoCard, InfoGrid, InfoList, InfoPage, InfoSection } from "@/components/info-page";

export const metadata = {
  title: "Return Policy",
};

export default function ReturnsPage() {
  return (
    <InfoPage
      eyebrow="Returns"
      title="Return Policy"
      description="Returns are clearest when the part is unused, in original packaging, and the issue is reported quickly. If you’re unsure about fitment, ask before ordering — that is always the cleaner path."
      cta={{ href: "/contact", label: "Start a return request" }}
    >
      <InfoGrid>
        <InfoCard title="If we helped select the wrong part">
          <p>
            If you provided the needed vehicle details and we incorrectly guided you to the wrong part, contact us. We’ll review the case and work toward a replacement, exchange, or refund path.
          </p>
        </InfoCard>
        <InfoCard title="If the part arrives damaged">
          <p>
            Keep the packaging, take photos, and contact us quickly. Carrier claims need clear evidence, especially for damaged boxes or missing contents.
          </p>
        </InfoCard>
      </InfoGrid>

      <InfoSection title="Return condition requirements">
        <InfoList
          items={[
            "Parts must be unused and not installed.",
            "Original manufacturer packaging should be kept intact whenever possible.",
            "Order number, photos, and a clear issue description are required.",
            "Electrical, special-order, or opened items may have stricter return limits depending on supplier rules.",
          ]}
        />
      </InfoSection>

      <InfoSection title="If you selected the wrong part">
        <p>
          If a customer orders without verifying fitment and the selected part does not match the vehicle, return eligibility may be limited. Use Fitment / VIN Help before checkout when the fitment state is not confirmed.
        </p>
      </InfoSection>

      <InfoSection title="Missed delivery or returned shipments">
        <p>
          If a carrier returns an order because delivery could not be completed, reshipment may require additional shipping charges. Contact us quickly so we can help before the carrier closes the shipment window.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
