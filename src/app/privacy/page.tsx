import { InfoCard, InfoGrid, InfoList, InfoPage, InfoSection } from "@/components/info-page";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy"
      title="Privacy Policy"
      description="We collect the information needed to run the store, support customers, process orders, and improve the shopping experience. We don’t need creepy data to sell car parts."
      cta={{ href: "/contact", label: "Privacy questions" }}
    >
      <InfoGrid>
        <InfoCard title="Information you provide">
          <InfoList items={["Name and contact details", "Shipping and billing information", "Order details", "Vehicle or VIN details you choose to send for fitment help", "Messages sent through support forms"]} />
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
            "Respond to fitment, warranty, return, and support requests.",
            "Improve product pages, categories, and checkout flows.",
            "Protect the store from fraud, abuse, or unauthorized access.",
          ]}
        />
      </InfoSection>

      <InfoSection title="Payments and service providers">
        <p>
          Payment details are handled by secure payment providers. We may share necessary information with vendors that help operate the store, including payment processors, shipping carriers, hosting services, analytics tools, and customer support systems.
        </p>
      </InfoSection>

      <InfoSection title="Your choices">
        <p>
          You can contact us to ask about personal information tied to your order or support history. Some records may need to be retained for accounting, fraud prevention, legal, or operational reasons.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
