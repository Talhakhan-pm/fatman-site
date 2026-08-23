"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFitment } from "./use-fitment";
import { useGarage } from "./garage-provider";
import type { FitmentState } from "@/lib/fitment";
import { formatPrice, type Product } from "@/lib/catalog-types";
import { track } from "@/lib/analytics";
import { getProductDisplayMedia } from "@/lib/catalog-media";
import { useCart } from "@/components/cart-provider";
import { getProductDisplayBadges } from "@/lib/product-badges";
import { canAddProductToCart, formatProductPrice, isQuoteRequired } from "@/lib/product-pricing";

function StockBadge({ stock }: { stock: Product["stock"] }) {
  if (stock === "in-stock") return null; // healthy stock is the quiet default
  const cls = stock === "low-stock" ? "low" : "pre";
  return (
    <span className={`fm-stock ${cls}`}>
      <span className="pd" aria-hidden="true" />
      {stock === "low-stock" ? "Low Stock" : "Preorder"}
    </span>
  );
}

/**
 * Fitment truth pill — rebuilt in CSS to match the confirmed-fit brand asset
 * (mint fill, green ring, check seal). Green is reserved for fitment wins;
 * verify stays amber, no-fit red, per docs/fitment-ux-rule-set.md.
 * Labels come in long (desktop) and short (mobile 2-col tiles) variants.
 */
const FIT_LABELS: Record<FitmentState, { lg: string; sm: string }> = {
  fits: { lg: "Confirmed Fit", sm: "Fits" },
  verify: { lg: "Verify Fitment", sm: "Verify" },
  "no-fit": { lg: "Does Not Fit", sm: "No Fit" },
};

function FitPill({ state }: { state: FitmentState }) {
  const ck = state === "fits" ? (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  ) : state === "verify" ? (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
      <path d="M12 8v5" /><circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  ) : (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );

  const cls = state === "fits" ? "fits" : state === "verify" ? "verify" : "nofit";
  const label = FIT_LABELS[state];
  return (
    <span className={`fm-fit-pill ${cls}`}>
      <span className="ck" aria-hidden="true">{ck}</span>
      <span className="lg">{label.lg}</span>
      <span className="sm">{label.sm}</span>
    </span>
  );
}

function AttributeChips({ product }: { product: Product }) {
  const badges = getProductDisplayBadges(product);
  return (
    <div className="fm-chips">
      {badges.map((badge) => (
        <span key={`${badge.kind}-${badge.value}`} className={`fm-chip ${badge.kind === "partSource" ? "oem" : ""}`}>
          {badge.label === "OEM" ? "Genuine OEM" : badge.label}
        </span>
      ))}
      <span className="fm-chip">Ships 24h</span>
    </div>
  );
}

/**
 * Subtle spec-plate tilt + glare for fine pointers. Skipped entirely for
 * reduced-motion users and touch devices; the card is fully usable without it.
 */
function useCardTilt() {
  const ref = useRef<HTMLElement | null>(null);
  const enabled =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      const card = ref.current;
      if (!card || e.pointerType !== "mouse") return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.transform = `rotateX(${(0.5 - py) * 4}deg) rotateY(${(px - 0.5) * 5}deg) translateY(-3px)`;
      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);
    },
    [enabled],
  );

  const onPointerLeave = useCallback(() => {
    const card = ref.current;
    if (card) card.style.transform = "";
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}

export function ProductCard({
  product,
  fitmentState,
}: {
  product: Product;
  fitmentState?: FitmentState;
}) {
  const { vehicle } = useGarage();
  const { addItem } = useCart();
  const fitment = useFitment(product.slug, vehicle, fitmentState);
  const tilt = useCardTilt();
  const [justAdded, setJustAdded] = useState(false);
  const addTimer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(addTimer.current), []);

  const handleAdd = useCallback(() => {
    addItem(product);
    track("add_to_cart", { slug: product.slug, price: product.price });
    setJustAdded(true);
    window.clearTimeout(addTimer.current);
    addTimer.current = window.setTimeout(() => setJustAdded(false), 1500);
  }, [addItem, product]);

  const hasSavings = typeof product.compareAt === "number" && product.compareAt > product.price;
  const media = getProductDisplayMedia(product);
  const badges = getProductDisplayBadges(product);
  const partNumber = product.oemPartNumber || product.sku;
  const quoteRequired = isQuoteRequired(product);
  const canAddToCart = canAddProductToCart(product);
  const partTag = `PARTS · ${partNumber.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase()}`;
  // With no garage vehicle the fit row is normally hidden — but a page can
  // pass a resolved verdict (/fits carries its vehicle in the URL), and then
  // the pill is exactly the information this card exists to surface.
  const showFitRow = Boolean(vehicle) || fitmentState !== undefined;

  return (
    <article
      ref={tilt.ref}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      className={`fm-card ${showFitRow ? "" : "no-vehicle"}`}
      aria-label={`${product.brand} ${product.name}, OEM ${partNumber}`}
    >
      <Link href={`/product/${product.slug}`} className="fm-card-media" aria-label={`View ${product.name}`}>
        {media.src ? (
          <Image
            src={media.src}
            alt={media.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1020px) 50vw, 33vw"
          />
        ) : (
          <div className="noimg">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M3 15l4-4 3 3 5-5 6 6" />
            </svg>
            Photo on request
          </div>
        )}
        <span className="corner tl" aria-hidden="true" />
        <span className="corner br" aria-hidden="true" />
        <span className="cat-tag">{partTag}</span>
        <span className="glare" aria-hidden="true" />
        <div className="fm-badges">
          <StockBadge stock={product.stock} />
          {hasSavings && <span className="fm-save">Save {formatPrice((product.compareAt ?? 0) - product.price)}</span>}
        </div>
      </Link>

      <div className="fm-card-body">
        {/* brand meta line: on phones it absorbs the attribute chips
            (FORD · USED · GENUINE OEM) so nothing floats over the image
            tile; desktop keeps the bare brand + the body chip row. */}
        <p className="fm-brand">
          {product.brand}
          {badges.map((badge) => (
            <span className="m" key={`m-${badge.kind}-${badge.value}`}>
              {badge.label === "OEM" ? "Genuine OEM" : badge.label}
            </span>
          ))}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="fm-name">{product.name}</h3>
        </Link>
        <p className="fm-desc">{product.shortDescription}</p>

        <div className="fm-partno" title={`OEM part number ${partNumber}`}>
          <span className="lbl">OEM&nbsp;#</span>
          <b>{partNumber}</b>
          <span className="barcode" aria-hidden="true">
            {Array.from({ length: 9 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
        </div>

        <AttributeChips product={product} />

        <div className="fm-fit-row">
          <FitPill state={fitment} />
          <p className="fm-fit-note">
            {fitment === "fits"
              ? "Fits your selected vehicle"
              : fitment === "verify"
                ? "May fit — confirm VIN before ordering"
                : "Not compatible with your vehicle"}
          </p>
        </div>

        <div className="fm-card-foot">
          <div className="fm-price">
            {quoteRequired ? (
              <span className="quote">Request Quote</span>
            ) : (
              <>
                <b>{formatProductPrice(product)}</b>
                {hasSavings && <span className="was">{formatPrice(product.compareAt ?? 0)}</span>}
              </>
            )}
          </div>
          {canAddToCart ? (
            <button
              onClick={handleAdd}
              className={`fm-btn fm-btn-add ${justAdded ? "added" : ""}`}
              aria-label={`Add ${product.name} to cart`}
            >
              {justAdded ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m4.5 12.5 5 5 10-11" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              )}
              <span className="txt">Add</span>
            </button>
          ) : (
            <Link href={`/fitment-help?product=${encodeURIComponent(product.slug)}`} className="fm-btn fm-btn-quote">
              Request Quote
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
