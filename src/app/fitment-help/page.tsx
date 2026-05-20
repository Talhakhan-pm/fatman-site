import { FitmentRequestForm } from "@/components/fitment-request-form";
import { InfoCard, InfoGrid, InfoList, InfoPage, InfoSection } from "@/components/info-page";
import { getProduct } from "@/lib/catalog-db";

export const metadata = {
  title: "Fitment / VIN Help",
};

export default async function FitmentHelpPage({
  searchParams,
}: {
  searchParams?: Promise<{ product?: string }>;
}) {
  const params = await searchParams;
  const productSlug = typeof params?.product === "string" ? params.product : "";
  const product = productSlug ? await getProduct(productSlug) : null;

  return (
    <InfoPage
      eyebrow="Fitment support"
      title="Fitment / VIN Help"
      description="Wrong parts waste time. Decode your VIN, send the product context, and we’ll save the request for review before final fitment logic goes live."
      cta={{ href: product ? `/product/${product.slug}` : "/category", label: product ? "Back to product" : "Browse parts" }}
    >
      <InfoGrid>
        <InfoCard title="What this does now">
          <InfoList items={["Validates and decodes the VIN", "Saves the customer request in Supabase", "Attaches product SKU/name when launched from a product page", "Keeps exact part compatibility review separate for later"]} />
        </InfoCard>
        <InfoCard title="What VIN can reveal">
          <InfoList items={["Year / Make / Model", "Trim or variant when available", "Engine details when available", "Body and drivetrain clues from NHTSA data"]} />
        </InfoCard>
      </InfoGrid>

      <FitmentRequestForm product={product} />

      <InfoSection title="Why VIN helps">
        <p>
          A VIN can reveal trim, production details, engine family, and other compatibility details that generic year/make/model browsing can miss. It is a strong starting point, not a final compatibility guarantee by itself.
        </p>
      </InfoSection>

      <InfoSection title="Before you order">
        <p>
          If the product page does not show Confirmed Fit, do not guess. Send the VIN and product context first so the request is captured cleanly.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
