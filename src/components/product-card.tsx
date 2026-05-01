"use client";

import Image from "next/image";
import Link from "next/link";
import { FitmentBadge } from "./fitment-badge";
import { useFitment } from "./use-fitment";
import { useGarage } from "./garage-provider";
import type { FitmentState } from "@/lib/fitment";
import { formatPrice } from "@/lib/catalog";
import { track } from "@/lib/analytics";
import { getProductDisplayMedia } from "@/lib/catalog-media";

type Product = {
  slug: string;
  name: string;
  brand: string;
  price: number;
  compareAt?: number;
  stock: "in-stock" | "low-stock" | "preorder";
  category: "engines" | "brakes" | "oem-parts" | "drivetrain" | "cooling" | "electrical" | "suspension";
  imageUrl?: string;
};

function StockBadge({ stock }: { stock: Product["stock"] }) {
  if (stock === "in-stock") {
    return <span className="rounded-full border border-green-400/30 bg-green-500/20 px-2 py-1 text-[10px] font-semibold text-green-200">In Stock</span>;
  }
  if (stock === "low-stock") {
    return <span className="rounded-full border border-amber-400/30 bg-amber-500/20 px-2 py-1 text-[10px] font-semibold text-amber-200">Low Stock</span>;
  }
  return <span className="rounded-full border border-blue-400/30 bg-blue-500/20 px-2 py-1 text-[10px] font-semibold text-blue-200">Preorder</span>;
}

export function ProductCard({
  product,
  fitmentState,
}: {
  product: Product;
  fitmentState?: FitmentState;
}) {
  const { vehicle } = useGarage();
  const fitment = useFitment(product.slug, vehicle, fitmentState);
  const hasSavings = typeof product.compareAt === "number" && product.compareAt > product.price;
  const media = getProductDisplayMedia(product);

  return (
    <article className="rounded-xl border border-white/15 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-fatman-accent">
      <Link href={`/product/${product.slug}`} className="relative block h-40 overflow-hidden rounded-lg bg-gradient-to-br from-fatman-700/80 via-fatman-800/80 to-fatman-900/90">
        {media.src ? (
          <>
            <Image src={media.src} alt={media.alt} fill className="object-cover transition duration-500 group-hover:scale-[1.02]" sizes="(max-width: 768px) 100vw, 33vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,106,0,0.25),_transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]" />
        )}
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
          {product.category.replace("-", " ")}
        </span>
      </Link>
      <div className="mt-3 flex items-center gap-2">
        <StockBadge stock={product.stock} />
        {hasSavings && (
          <span className="rounded-full border border-fatman-accent/40 bg-fatman-accent/20 px-2 py-1 text-[10px] font-semibold text-orange-100">
            Save {formatPrice((product.compareAt ?? 0) - product.price)}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs uppercase tracking-wider text-white/60">{product.brand}</p>
      <Link href={`/product/${product.slug}`}>
        <h3 className="mt-1 text-sm font-semibold text-white">{product.name}</h3>
      </Link>
      <div className="mt-2">
        <FitmentBadge state={fitment} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-white">{formatPrice(product.price)}</span>
          {hasSavings && <p className="text-xs text-white/55 line-through">{formatPrice(product.compareAt ?? 0)}</p>}
        </div>
        <button
          onClick={() => track("add_to_cart", { slug: product.slug, price: product.price })}
          className="rounded-lg bg-fatman-accent px-3 py-2 text-xs font-semibold transition hover:bg-fatman-accent-hover"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}
