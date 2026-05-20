import { InfoCard, InfoGrid, InfoList, InfoPage, InfoSection } from "@/components/info-page";

export const metadata = {
  title: "Return Policy",
};

export default function ReturnsPage() {
  return (
    <InfoPage
      eyebrow="Returns"
      title="Return Policy"
      description="This policy starts once an order is handed to the shipping carrier. Before shipment, the Cancellation Policy applies. If you’re unsure about fitment, ask before ordering."
      cta={{ href: "/contact", label: "Start a return request" }}
    >
      <InfoGrid>
        <InfoCard title="If we selected the wrong part">
          <p>
            If you asked our support team for help, provided the needed vehicle details such as VIN, color, engine, trim, or part information, and we incorrectly selected the part, we’ll ask you to return the item to our warehouse.
          </p>
          <p>
            Once approved, we can refund the order cost and cover return shipping, or offer an exchange for the correct part.
          </p>
        </InfoCard>
        <InfoCard title="Return condition">
          <InfoList items={["Parts must be returned within 14 days of receipt.", "Parts must be in original factory packaging.", "Parts must be unused and not installed.", "Returns may be denied if the part shows signs of use, installation, damage, or missing packaging."]} />
        </InfoCard>
      </InfoGrid>

      <InfoSection title="If parts were lost or damaged during shipping">
        <InfoList
          items={[
            "Take photos/videos of damaged packaging, missing parts, cuts, openings, or tampering.",
            "If possible, document the damage with the courier present.",
            "Keep the packaging and damaged item until the claim is resolved.",
            "Submit the claim to help@fatmanparts.com within 14 days of receipt.",
          ]}
        />
        <p>
          Once the carrier claim is reviewed and approved, we’ll offer the appropriate replacement or refund path for the damaged or missing parts.
        </p>
      </InfoSection>

      <InfoSection title="If you incorrectly selected parts">
        <p>
          If you did not consult us before purchase and ordered the wrong part, we cannot guarantee return or exchange eligibility. Automotive manufacturers and suppliers often do not accept returns for incorrectly selected parts. Please use Fitment / VIN Help before checkout if you are unsure.
        </p>
      </InfoSection>

      <InfoSection title="If you changed your mind after delivery">
        <p>
          Because many automotive parts are manufacturer/supplier-controlled items, we generally cannot accept returns or exchanges simply because the part is no longer needed after receipt. Verify necessity and compatibility before paying.
        </p>
      </InfoSection>

      <InfoSection title="If an order could not be delivered and was returned">
        <p>
          If a shipment returns to us because it could not be delivered for reasons outside Fatman Parts’ control, we can reship it after you pay the return shipping cost plus the new reshipment cost. If we cannot contact you or arrange reshipment within 2 months, the order may be considered completed and the parts may be disposed of.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
