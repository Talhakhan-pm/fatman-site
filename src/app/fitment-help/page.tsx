import { InfoCard, InfoGrid, InfoList, InfoPage, InfoSection } from "@/components/info-page";

export const metadata = {
  title: "Fitment / VIN Help",
};

export default function FitmentHelpPage() {
  return (
    <InfoPage
      eyebrow="Fitment support"
      title="Fitment / VIN Help"
      description="Wrong parts waste time. If a product is marked Verify Fitment or Fitment Unknown, send us the right details before ordering and we’ll help narrow it down."
      cta={{ href: "/contact", label: "Send fitment details" }}
    >
      <InfoGrid>
        <InfoCard title="Best details to send">
          <InfoList items={["VIN", "Year / Make / Model", "Trim or variant", "Engine", "Existing part number", "Photos of the current part if available"]} />
        </InfoCard>
        <InfoCard title="What the fitment labels mean">
          <InfoList items={["Confirmed Fit: strong match for the selected vehicle", "Verify Fitment: possible match, needs confirmation", "Fitment Unknown: not enough data yet", "Does Not Fit: known mismatch"]} />
        </InfoCard>
      </InfoGrid>

      <InfoSection title="Why VIN helps">
        <p>
          A VIN can reveal trim, production details, engine family, and other compatibility details that generic year/make/model browsing can miss. That matters especially for parts with mid-year changes or multiple options.
        </p>
      </InfoSection>

      <InfoSection title="Before you order">
        <p>
          If the product page does not show Confirmed Fit, do not guess. Contact us with the product link and vehicle details so we can help verify before you buy.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
