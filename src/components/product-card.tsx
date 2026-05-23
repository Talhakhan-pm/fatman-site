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

function StockBadge({ stock }: { stock: Product["stock"] }) {
  if (stock === "in-stock") {
    return (
      <span className="stock-badge stock-badge--success">
        <span className="relative flex h-1.5 w-1.5 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
        In Stock
      </span>
    );
  }
  if (stock === "low-stock") {
    return (
      <span className="stock-badge stock-badge--warning">
        <span className="relative flex h-1.5 w-1.5 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
        </span>
        Low Stock
      </span>
    );
  }
  return (
    <span className="stock-badge stock-badge--info">
      <span className="relative flex h-1.5 w-1.5 mr-1.5">
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500"></span>
      </span>
      Preorder
    </span>
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

  return (
    <article className="group/card relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-fatman-accent/50 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-black/40">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />
      
      <Link href={`/product/${product.slug}`} className="group relative block h-44 overflow-hidden rounded-xl bg-fatman-800">
        {media.src ? (
          <>
            <Image src={media.src} alt={media.alt} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]" sizes="(max-width: 768px) 100vw, 33vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col justify-between p-3 bg-fatman-700/30">
            <div className="self-start rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/90 backdrop-blur-md">
              {categoryLabel}
            </div>
            <div>
              <p className="text-sm font-bold text-white/90">Image coming soon</p>
              <p className="mt-1 text-xs text-white/60">Fatman Parts catalog media pending</p>
            </div>
          </div>
        )}
      </Link>
      <div className="mt-3 flex items-center gap-2">
        <StockBadge stock={product.stock} />
        {hasSavings && (
          <span className="inline-flex items-center rounded-full border border-fatman-accent/40 bg-fatman-accent/20 px-2.5 py-1 text-[10px] font-bold text-orange-100 uppercase tracking-wider">
            <svg className="w-3 h-3 mr-1 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 8.167a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.25 3.75H4.75a1 1 0 00-1 1v5.5a1 1 0 00.293.707l9.5 9.5a1 1 0 001.414 0l5.5-5.5a1 1 0 000-1.414l-9.5-9.5a1 1 0 00-.707-.293z" />
            </svg>
            Save {formatPrice((product.compareAt ?? 0) - product.price)}
          </span>
        )}
      </div>
      <div className="mt-2">
        <ProductAttributeBadges product={product} />
      </div>
      <p className="mt-2 text-xs uppercase tracking-wider text-white/60">{product.brand}</p>
      <Link href={`/product/${product.slug}`}>
        <h3 className="mt-1 text-sm font-semibold text-white">{product.name}</h3>
      </Link>
      <div className="mt-2">
        <FitmentBadge state={fitment} />
      </div>
      <div className="mt-4 flex flex-1 flex-col justify-end">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xl font-black text-white drop-shadow-sm">{formatPrice(product.price)}</span>
            {hasSavings && <p className="text-[11px] font-medium text-white/55 line-through">{formatPrice(product.compareAt ?? 0)}</p>}
          </div>
          <button
            onClick={() => {
              addItem(product);
              track("add_to_cart", { slug: product.slug, price: product.price });
            }}
            className="group/btn relative overflow-hidden rounded-xl bg-fatman-accent px-4 py-2.5 text-xs font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-fatman-accent-hover hover:shadow-[0_0_20px_rgba(234,88,12,0.5)]"
          >
            <span className="relative z-10">Add to Cart</span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
          </button>
        </div>
      </div>
    </article>
  );
}
