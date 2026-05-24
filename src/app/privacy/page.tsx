import { InfoCard, InfoGrid, InfoList, InfoPage, InfoSection } from "@/components/info-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Fatman Parts LLC collects, uses, and secures your information when processing orders and providing vehicle fitment support.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy"
      title="Privacy Policy"
      description="Fatman Parts LLC collects the information needed to run the store, process orders, support customers, and improve the shopping experience. We don’t need creepy data to sell car parts."
      cta={{ href: "/contact", label: "Privacy questions" }}
    >
      <InfoSection title="Company responsible for this policy">
        <p>
          Fatman Parts LLC · 6779 Beadnell Way, San Diego, CA 92117 · (844) 737-1463 · help@fatmanparts.com
        </p>
      </InfoSection>

      <InfoGrid>
        <InfoCard title="Information you provide">
          <InfoList items={["Name and contact details", "Shipping and billing information", "Order details", "Vehicle, VIN, color, engine, trim, or part details you choose to send for fitment help", "Messages sent through support forms or email"]} />
        </InfoCard>
        <InfoCard title="Technical information">
          <InfoList items={["Device and browser information", "Site usage data", "Cookies or similar technologies", "Fraud-prevention and security signals"]} />
        </InfoCard>
      </InfoGrid>

      <InfoSection title="How we use information">
        <InfoList
          items={[
            "Process orders and payments.",
            "Ship products and send tracking information.",
            "Respond to fitment, warranty, return, cancellation, and support requests.",
            "Improve product pages, categories, checkout, and support flows.",
            "Protect the store from fraud, abuse, chargebacks, or unauthorized access.",
          ]}
        />
      </InfoSection>

      <InfoSection title="Payments and service providers">
        <p>
          Payment details are handled by secure payment providers. We may share necessary information with providers that help operate the store, including payment processors, shipping carriers, hosting services, analytics tools, fraud-prevention systems, and customer support systems.
        </p>
      </InfoSection>

      <InfoSection title="Your choices">
        <p>
          You can contact help@fatmanparts.com to ask about personal information tied to your order or support history. Some records may need to be retained for accounting, fraud prevention, tax, legal, or operational reasons.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
