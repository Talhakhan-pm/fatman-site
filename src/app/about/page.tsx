import { InfoCard, InfoGrid, InfoList, InfoPage, InfoSection } from "@/components/info-page";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About Fatman Parts"
      title="Parts shopping without the guesswork"
      description="Fatman Parts is built for people who need the right automotive part without fighting a messy catalog. The brand voice can be bold, but the operating principle is serious: fitment clarity, useful support, and clean product information."
      cta={{ href: "/category", label: "Start shopping" }}
    >
      <InfoGrid>
        <InfoCard title="OEM-first confidence">
          <p>
            The storefront is organized around part accuracy: clear categories, useful specs, and fitment states that avoid overpromising when data is incomplete.
          </p>
        </InfoCard>
        <InfoCard title="Fitment support">
          <p>
            If a part needs verification, customers can send VIN, trim, engine, and part-number details before ordering.
          </p>
        </InfoCard>
      </InfoGrid>

      <InfoSection title="What we’re building">
        <p>
          Fatman Parts is moving from a static parts demo into a real storefront: live catalog management, product pages, category browsing, cart flows, and vehicle-aware discovery that helps customers shop by what fits their car.
        </p>
        <InfoList
          items={[
            "Cleaner category navigation for common automotive parts.",
            "Product pages that explain fitment status instead of hiding uncertainty.",
            "Support flows for VIN checks and part verification.",
            "Storefront pages that make shipping, returns, cancellation, warranty, and payment expectations easier to understand.",
          ]}
        />
      </InfoSection>

      <InfoSection title="Our promise">
        <p>
          We’d rather say “verify fitment” than pretend a part is confirmed when it isn’t. Wrong parts waste time. A serious parts store should help customers avoid that before checkout.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
