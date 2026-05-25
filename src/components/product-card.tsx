"use client";

import Image from "next/image";
import Link from "next/link";
import { FitmentBadge } from "./fitment-badge";
import { useFitment } from "./use-fitment";
import { useGarage } from "./garage-provider";
import type { FitmentState } from "@/lib/fitment";
import { formatPrice, type Product } from "@/lib/catalog";
import { track } from "@/lib/analytics";
import { getProductDisplayMedia } from "@/lib/catalog-media";
import { useCart } from "@/components/cart-provider";
import { ProductAttributeBadges } from "@/components/product-attribute-badges";
import { canAddProductToCart, formatProductPrice, isQuoteRequired } from "@/lib/product-pricing";

function StockBadge({ stock }: { stock: Product["stock"] }) {
  if (stock === "in-stock") {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-200">
        <span className="relative mr-1.5 flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        In Stock
      </span>
    );
  }
  if (stock === "low-stock") {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-200">
        <span className="relative mr-1.5 flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
        </span>
        Low Stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-sky-400/25 bg-sky-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-sky-200">
      <span className="relative mr-1.5 flex h-1.5 w-1.5 rounded-full bg-sky-400" />
      Preorder
    </span>
  );
}

function ConfirmedFitBadge() {
  return (
    <Image
      src="/trust-icons/confirmed-fit-pill-green.png"
      alt="Confirmed Fit"
      width={966}
      height={317}
      className="h-8 w-auto shrink-0"
      sizes="132px"
    />
  );
}

function PartNumberBlock({ value }: { value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">OEM Part #</p>
      <p className="mt-0.5 truncate font-mono text-xs font-bold text-white" title={value}>
        {value}
      </p>
    </div>
  );
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
  const hasSavings = typeof product.compareAt === "number" && product.compareAt > product.price;
  const media = getProductDisplayMedia(product);
  const categoryLabel = product.category.replace(/-/g, " ");
  const partNumber = product.oemPartNumber || product.sku;
  const showConfirmedFit = fitment === "fits";
  const quoteRequired = isQuoteRequired(product);
  const canAddToCart = canAddProductToCart(product);

  return (
    <article className="group/card relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-black/10 transition-all duration-500 hover:-translate-y-1 hover:border-emerald-400/35 hover:bg-white/10 hover:shadow-2xl hover:shadow-black/20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-70" />

      <Link href={`/product/${product.slug}`} className="group/image relative block h-48 overflow-hidden bg-fatman-700">
        {media.src ? (
          <>
            <Image
              src={media.src}
              alt={media.alt}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover/image:scale-[1.05]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/10" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col justify-between bg-fatman-700/30 p-4">
            <div className="self-start rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/90 backdrop-blur-md">
              {categoryLabel}
            </div>
            <div>
              <p className="text-sm font-bold text-white/90">Image coming soon</p>
              <p className="mt-1 text-xs text-white/60">Fatman Parts catalog media pending</p>
            </div>
          </div>
        )}

        {product.stock !== "in-stock" && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <StockBadge stock={product.stock} />
          </div>
        )}

        {hasSavings && (
          <div className="absolute bottom-3 left-3 rounded-full border border-fatman-accent/40 bg-fatman-accent/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-lg">
            Save {formatPrice((product.compareAt ?? 0) - product.price)}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-black uppercase tracking-[0.18em] text-white/45">{product.brand}</p>
            <Link href={`/product/${product.slug}`}>
              <h3 className="mt-1 line-clamp-2 text-base font-black leading-tight text-white transition-colors duration-300 group-hover/card:text-emerald-100">
                {product.name}
              </h3>
            </Link>
          </div>
        </div>

        <div className="mt-3">
          <ProductAttributeBadges product={product} />
        </div>

        <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-white/60">{product.shortDescription}</p>

        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
          <PartNumberBlock value={partNumber} />
          {showConfirmedFit ? (
            <div className="flex items-center justify-center shrink-0">
              <ConfirmedFitBadge />
            </div>
          ) : (
            <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">
              <FitmentBadge state={fitment} />
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-1 flex-col justify-end">
          <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-4">
            <div>
              <span className="text-2xl font-black text-white drop-shadow-sm">{formatProductPrice(product)}</span>
              {quoteRequired ? (
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">Quote required</p>
              ) : (
                hasSavings && <p className="text-[11px] font-medium text-white/45 line-through">{formatPrice(product.compareAt ?? 0)}</p>
              )}
            </div>
            {canAddToCart ? (
              <button
                onClick={() => {
                  addItem(product);
                  track("add_to_cart", { slug: product.slug, price: product.price });
                }}
                className="group/btn relative overflow-hidden rounded-xl bg-fatman-accent px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-fatman-accent-hover hover:shadow-[0_0_20px_rgba(234,88,12,0.5)]"
              >
                <span className="relative z-10">Add</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
              </button>
            ) : (
              <Link
                href={`/fitment-help?product=${encodeURIComponent(product.slug)}`}
                className="rounded-xl border border-white/15 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.08em] text-white/85 transition hover:bg-white/10"
              >
                Ask
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
