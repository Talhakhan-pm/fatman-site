import { InfoCard, InfoGrid, InfoList, InfoPage, InfoSection } from "@/components/info-page";

export const metadata = {
  title: "Warranty",
};

export default function WarrantyPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Warranty"
      description="Warranty coverage depends on the part, manufacturer, supplier, and installation circumstances. If something fails or arrives wrong, document it and contact us quickly."
      cta={{ href: "/contact", label: "Start warranty support" }}
    >
      <InfoGrid>
        <InfoCard title="What helps a claim">
          <InfoList items={["Order number", "Part number", "Clear photos or video", "Vehicle details", "Installation notes or technician diagnosis"]} />
        </InfoCard>
        <InfoCard title="What can limit coverage">
          <InfoList items={["Installed or modified parts", "Misuse or incorrect installation", "Incorrect vehicle application", "Missing packaging or documentation", "Normal wear items outside supplier coverage"]} />
        </InfoCard>
      </InfoGrid>

      <InfoSection title="Manufacturer and supplier rules">
        <p>
          Many automotive parts are covered according to manufacturer or supplier terms. We’ll review your request and help route it through the correct process when coverage is available.
        </p>
      </InfoSection>

      <InfoSection title="Before installation">
        <p>
          Compare the new part to the old part, verify part numbers when available, and stop before installation if anything looks wrong. Installed parts are much harder to resolve cleanly.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
