"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FitmentBadge } from "@/components/fitment-badge";
import { useGarage } from "@/components/garage-provider";
import { useFitment } from "@/components/use-fitment";
import { CompatibleProducts } from "@/components/product/compatible-products";
import { formatPrice, type Product } from "@/lib/catalog";
import { track } from "@/lib/analytics";
import { getProductDisplayMedia } from "@/lib/catalog-media";
import { useCart } from "@/components/cart-provider";
import type { VinDecodeResult } from "@/lib/vin";

function normalizeVin(value: string) {
  return value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "").slice(0, 17);
}

function vehicleSummary(decoded: VinDecodeResult) {
  return [decoded.year, decoded.make, decoded.model, decoded.trim].filter(Boolean).join(" ");
}

type DecodeState =
  | { status: "idle" }
  | { status: "decoding" }
  | { status: "success"; decoded: VinDecodeResult }
  | { status: "error"; message: string };

function getProductEyebrow(product: Product) {
  const brand = product.brand.trim();
  if (!brand || /^(blah(\s+blah)+|placeholder|test brand)$/i.test(brand)) {
    return product.category.replace(/-/g, " ");
  }
  return brand;
}

export function ProductPageClient({ product }: { product: Product }) {
  const { vehicle } = useGarage();
  const { addItem } = useCart();
  const fitment = useFitment(product.slug, vehicle);
  const media = getProductDisplayMedia(product);
  const categoryLabel = product.category.replace(/-/g, " ");
  const eyebrow = getProductEyebrow(product);

  const [showVinDecoder, setShowVinDecoder] = useState(false);
  const [vin, setVin] = useState("");
  const [decodeState, setDecodeState] = useState<DecodeState>({ status: "idle" });

  const vinReady = vin.length === 17;
  const decoded = decodeState.status === "success" ? decodeState.decoded : null;
  const decodedLabel = decoded ? vehicleSummary(decoded) : "";

  async function decodeVin() {
    const cleanVin = normalizeVin(vin);
    setVin(cleanVin);

    if (cleanVin.length !== 17) {
      setDecodeState({ status: "error", message: "VIN must be 17 characters." });
      return;
    }

    setDecodeState({ status: "decoding" });
    try {
      const res = await fetch("/api/fitment/vin/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin: cleanVin }),
      });
      const json = (await res.json().catch(() => null)) as VinDecodeResult | { error?: string } | null;

      if (!res.ok || !json || !("valid" in json) || !json.valid) {
        const message = json && "error" in json && json.error ? json.error : "VIN could not be decoded.";
        setDecodeState({ status: "error", message });
        return;
      }

      setDecodeState({ status: "success", decoded: json });
      track("vin_decoded", { source: "pdp_inline", vin: cleanVin });
    } catch (error) {
      const message = error instanceof Error ? error.message : "VIN decoder failed.";
      setDecodeState({ status: "error", message });
    }
  }

  useEffect(() => {
    track("view_item", { slug: product.slug, price: product.price });
  }, [product]);

  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <main className="mx-auto grid max-w-6xl gap-8 px-6 pb-10 pt-28 md:grid-cols-2 lg:pt-32">
        <div className="space-y-3 rounded-2xl border border-white/15 bg-white/5 p-6">
          <div className="relative h-80 overflow-hidden rounded-xl bg-fatman-700/60">
            {media.src ? (
              <>
                <Image src={media.src} alt={media.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col justify-between bg-[radial-gradient(circle_at_top,_rgba(255,106,0,0.22),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6">
                <span className="self-start rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                  {categoryLabel}
                </span>
                <div>
                  <p className="text-lg font-semibold text-white/90">Image coming soon</p>
                  <p className="mt-2 max-w-xs text-sm text-white/60">We have live fitment and product data, but this listing still needs final media.</p>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {media.src ? (
              <div className="relative col-span-1 h-16 overflow-hidden rounded-md border border-white/10 bg-fatman-700/50">
                <Image src={media.src} alt={media.alt} fill className="object-cover" sizes="120px" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="relative h-16 overflow-hidden rounded-md border border-white/10 bg-fatman-700/50">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,106,0,0.18),rgba(255,255,255,0.04))]" />
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-white/60">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-black">{product.name}</h1>
          <p className="mt-2 text-white/70">{product.shortDescription}</p>
          <div className="mt-4">
            <FitmentBadge state={fitment} />
          </div>

          <p className="mt-4 text-white/75">
            {fitment === "fits"
              ? "Confirmed fit for your selected vehicle."
              : fitment === "no-fit"
                ? "This part doesn't match your selected vehicle."
                : "Close match — verify with VIN before checkout. VIN check beats regret."}
          </p>
          {!showVinDecoder ? (
            <button
              onClick={() => {
                setShowVinDecoder(true);
                track("vin_verify_clicked", { slug: product.slug });
              }}
              className="mt-3 inline-block rounded-lg border border-white/20 px-3 py-2 text-sm text-white/85 hover:bg-white/10 transition-colors"
            >
              Verify with VIN
            </button>
          ) : (
            <div className="mt-4 rounded-xl border border-white/15 bg-white/5 p-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/50">Enter VIN</span>
                <div className="mt-2 flex gap-2">
                  <input
                    value={vin}
                    onChange={(event) => setVin(normalizeVin(event.target.value))}
                    className="w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 font-mono text-white tracking-wider focus:outline-none focus:ring-1 focus:ring-fatman-accent"
                    placeholder="17-character VIN"
                    required
                  />
                  <button
                    type="button"
                    onClick={decodeVin}
                    disabled={!vinReady || decodeState.status === "decoding"}
                    className="rounded-lg bg-fatman-accent px-4 py-2 text-sm font-black text-fatman-900 transition hover:bg-fatman-accent-hover disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {decodeState.status === "decoding" ? "Decoding…" : "Decode"}
                  </button>
                </div>
              </label>

              {decodeState.status === "success" && decoded && (
                <div className="mt-4 rounded-lg border border-emerald-400/25 bg-emerald-400/10 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">VIN decoded</p>
                  <p className="mt-1 text-sm font-black text-white">{decodedLabel || decoded.vin}</p>
                  <div className="mt-2 grid gap-1 text-xs text-white/72 sm:grid-cols-2">
                    <p>Engine: {decoded.engine || "N/A"}</p>
                    <p>Body: {decoded.bodyClass || "N/A"}</p>
                    <p>Drive: {decoded.driveType || "N/A"}</p>
                    <p>Plant: {decoded.plantCountry || "N/A"}</p>
                  </div>
                  <Link
                    href={`/fitment-help?product=${encodeURIComponent(product.slug)}`}
                    className="mt-3 inline-block rounded-md border border-white/20 px-3 py-1.5 text-xs text-white/85 hover:bg-white/10 transition-colors"
                  >
                    Submit for manual verification
                  </Link>
                </div>
              )}

              {decodeState.status === "error" && (
                <div className="mt-4 rounded-lg border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-100">
                  {decodeState.message}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-4">
            <p className="text-sm text-white/70">Estimated Dispatch</p>
            <p className="mt-1 text-lg font-bold">Ships in 24–48 hours</p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <p className="text-3xl font-black">{formatPrice(product.price)}</p>
            <button
              onClick={() => {
                addItem(product);
                track("add_to_cart", { slug: product.slug, price: product.price, source: "pdp" });
              }}
              className="rounded-lg bg-fatman-accent px-5 py-3 text-sm font-semibold transition hover:bg-fatman-accent-hover"
            >
              Add to Cart
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80 transition hover:bg-white/10">
              <div className="relative h-6 w-6 shrink-0"><Image src="/trust-icons/fitment.png" alt="Fitment" fill className="object-contain opacity-80" sizes="24px" /></div>
              <span className="leading-tight">Guaranteed fit</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80 transition hover:bg-white/10">
              <div className="relative h-6 w-6 shrink-0"><Image src="/trust-icons/shipping.png" alt="Shipping" fill className="object-contain opacity-80" sizes="24px" /></div>
              <span className="leading-tight">Fast U.S. shipping</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80 transition hover:bg-white/10">
              <div className="relative h-6 w-6 shrink-0"><Image src="/trust-icons/returns.png" alt="Returns" fill className="object-contain opacity-80" sizes="24px" /></div>
              <span className="leading-tight">Easy returns</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80 transition hover:bg-white/10">
              <div className="relative h-6 w-6 shrink-0"><Image src="/trust-icons/support.png" alt="Support" fill className="object-contain opacity-80" sizes="24px" /></div>
              <span className="leading-tight">Real support</span>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white">Specifications</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <p className="text-white/60">SKU</p>
              <p>{product.sku}</p>
              <p className="text-white/60">OEM Part #</p>
              <p>{product.oemPartNumber || "—"}</p>
              <p className="text-white/60">Shipping Class</p>
              <p className="capitalize">{product.shippingClass || "ground"}</p>
              <p className="text-white/60">Warranty</p>
              <p>{product.warrantyDays ? `${product.warrantyDays} days` : "—"}</p>
            </div>
          </div>
        </div>
      </main>

      <CompatibleProducts currentSlug={product.slug} categorySlug={product.category} />

      <div className="sticky bottom-0 border-t border-white/10 bg-fatman-900/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="text-lg font-black">{formatPrice(product.price)}</p>
          <button
            onClick={() => {
              addItem(product);
              track("add_to_cart", { slug: product.slug, price: product.price, source: "pdp_sticky" });
            }}
            className="rounded-lg bg-fatman-accent px-4 py-2 text-sm font-semibold"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
