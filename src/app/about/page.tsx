import { InfoCard, InfoGrid, InfoList, InfoPage, InfoSection } from "@/components/info-page";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About Fatman Parts"
      title="Parts shopping without the guesswork"
      description="Fatman Parts is built for gearheads, mechanics, and everyday drivers who need the right automotive part without fighting a messy catalog. Our core operating principle is simple: fitment clarity, real support, and clean product information."
      cta={{ href: "/category", label: "Start shopping" }}
    >
      <InfoGrid>
        <InfoCard title="OEM-first confidence">
          <p>
            Our storefront is organized around part accuracy. Clear categories, useful specs, and verified fitment states mean you never have to guess if a part will work for your build.
          </p>
        </InfoCard>
        <InfoCard title="Real fitment support">
          <p>
            If a part needs verification, you can send us your VIN, trim, engine, and part-number details before ordering. We’ll verify it against our fitment databases and OEM catalogs.
          </p>
        </InfoCard>
      </InfoGrid>

      <InfoSection title="Our Promise">
        <p>
          We’d rather tell you to “verify fitment” than pretend a part is confirmed when it isn’t. Wrong parts waste time, money, and weekends. A serious parts store should help you avoid that before checkout.
        </p>
        <InfoList
          items={[
            "Cleaner category navigation for common automotive parts.",
            "Product pages that explain fitment status instead of hiding uncertainty.",
            "Support flows for VIN checks and exact part verification.",
            "Clear, straightforward shipping, returns, cancellation, and warranty policies.",
          ]}
        />
      </InfoSection>

      <InfoSection title="Built by builders">
        <p>
          We aren't just selling parts—we're turning wrenches on our own projects. We know the frustration of ordering the wrong part and waiting weeks for a return. We built Fatman Parts to be the store we wanted to shop at.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
