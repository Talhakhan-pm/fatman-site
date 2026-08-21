"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { formatPrice, type Product } from "@/lib/catalog-types";
import { canAddProductToCart } from "@/lib/product-pricing";

const CART_STORAGE_KEY = "fatman-cart-v1";

export type CartLine = {
  product: Product;
  quantity: number;
  addedAt: string;
};

type CartContextValue = {
  lines: CartLine[];
  mounted: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(99, Math.floor(quantity)));
}

function parseStoredCart(value: string | null): CartLine[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as Partial<CartLine>[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((line): line is CartLine => Boolean(line?.product?.slug && line.product.name))
      .filter((line) => canAddProductToCart(line.product))
      .map((line) => ({
        product: line.product,
        quantity: normalizeQuantity(Number(line.quantity ?? 1)),
        addedAt: typeof line.addedAt === "string" ? line.addedAt : new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [mounted, setMounted] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartLine | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLines(parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY)));
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  }, [lines, mounted]);

  useEffect(() => {
    if (!lastAdded) return;
    const timer = window.setTimeout(() => setLastAdded(null), 4200);
    return () => window.clearTimeout(timer);
  }, [lastAdded]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    if (!canAddProductToCart(product)) return;

    const safeQuantity = normalizeQuantity(quantity);
    const addedAt = new Date().toISOString();

    setLines((current) => {
      const existing = current.find((line) => line.product.slug === product.slug);
      let nextLine: CartLine;

      if (existing) {
        nextLine = {
          ...existing,
          product,
          quantity: normalizeQuantity(existing.quantity + safeQuantity),
          addedAt,
        };
        setLastAdded(nextLine);
        return current.map((line) => (line.product.slug === product.slug ? nextLine : line));
      }

      nextLine = { product, quantity: safeQuantity, addedAt };
      setLastAdded(nextLine);
      return [nextLine, ...current];
    });
  }, []);

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    if (quantity <= 0) {
      setLines((current) => current.filter((line) => line.product.slug !== slug));
      return;
    }

    setLines((current) =>
      current.map((line) =>
        line.product.slug === slug ? { ...line, quantity: normalizeQuantity(quantity) } : line,
      ),
    );
  }, []);

  const removeItem = useCallback((slug: string) => {
    setLines((current) => current.filter((line) => line.product.slug !== slug));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

    return {
      lines,
      mounted,
      itemCount,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [addItem, clearCart, lines, mounted, removeItem, updateQuantity]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {lastAdded && (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-fatman-accent/40 bg-fatman-900/95 p-4 text-white shadow-2xl shadow-black/35 backdrop-blur md:left-auto md:right-6 md:mx-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fatman-accent">Added to cart</p>
              <p className="mt-1 line-clamp-1 font-bold">{lastAdded.product.name}</p>
              <p className="mt-1 text-sm text-white/65">
                Qty {lastAdded.quantity} · {formatPrice(lastAdded.product.price * lastAdded.quantity)}
              </p>
            </div>
            <button onClick={() => setLastAdded(null)} className="text-lg leading-none text-white/60 hover:text-white" aria-label="Dismiss cart confirmation">
              ×
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-semibold">
            <Link href="/cart" className="rounded-lg border border-white/15 px-3 py-2 text-center text-white/85 hover:bg-white/10">
              View cart
            </Link>
            <Link href="/checkout" className="rounded-lg bg-fatman-accent px-3 py-2 text-center text-fatman-900 hover:bg-fatman-accent-hover">
              Checkout
            </Link>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
