"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { track } from "@/lib/analytics";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";
import type { VinDecodeResult } from "@/lib/vin";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; requestId?: string }
  | { status: "error"; message: string };

type DecodeState =
  | { status: "idle" }
  | { status: "decoding" }
  | { status: "success"; decoded: VinDecodeResult }
  | { status: "error"; message: string };

function normalizeVin(value: string) {
  return value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "").slice(0, 17);
}

function vehicleSummary(decoded: VinDecodeResult) {
  return [decoded.year, decoded.make, decoded.model, decoded.trim].filter(Boolean).join(" ");
}

export function FitmentRequestForm({ product }: { product?: Product | null }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vin, setVin] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [decodeState, setDecodeState] = useState<DecodeState>({ status: "idle" });
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const vinReady = vin.length === 17;
  const decoded = decodeState.status === "success" ? decodeState.decoded : null;
  const decodedLabel = decoded ? vehicleSummary(decoded) : "";

  const suggestedMessage = useMemo(() => {
    if (!product) return "";
    return `Please verify whether this part works for my vehicle: ${product.name} (${product.sku}).`;
  }, [product]);

  async function decodeVin() {
    const cleanVin = normalizeVin(vin);
    setVin(cleanVin);

    if (cleanVin.length !== 17) {
      setDecodeState({ status: "error", message: "VIN must be 17 characters." });
      return null;
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
        return null;
      }

      setDecodeState({ status: "success", decoded: json });
      return json;
    } catch (error) {
      const message = error instanceof Error ? error.message : "VIN decoder failed.";
      setDecodeState({ status: "error", message });
      return null;
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: "submitting" });

    const cleanVin = normalizeVin(vin);
    setVin(cleanVin);

    try {
      const res = await fetch("/api/fitment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          vin: cleanVin,
          productSlug: product?.slug,
          message: message || suggestedMessage,
          source: product ? "product-fitment-request" : "fitment-help",
          website,
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; request?: { id?: string }; decoded?: VinDecodeResult; error?: string; details?: string }
        | null;

      if (!res.ok || !json?.ok) {
        const errorMessage = json?.error || json?.details || `Request failed (${res.status})`;
        setSubmitState({ status: "error", message: errorMessage });
        return;
      }

      if (json.decoded) setDecodeState({ status: "success", decoded: json.decoded });
      track("vin_verify_clicked", { source: "fitment_request_submit", productSlug: product?.slug });
      setSubmitState({ status: "success", requestId: json.request?.id });
    } catch (error) {
      setSubmitState({ status: "error", message: error instanceof Error ? error.message : "Request failed" });
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/12 bg-white/[0.055] p-5 shadow-2xl shadow-black/20 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fatman-accent">VIN request</p>
              <h2 className="mt-2 text-2xl font-black">Send the vehicle details</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/62">
                We decode the VIN for the UI and save the request. Exact fitment confirmation comes later after the catalog/parts data is reviewed.
              </p>
            </div>
            {product ? (
              <Link href={`/product/${product.slug}`} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10">
                Back to part
              </Link>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/50">Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-fatman-accent" placeholder="Your name" required />
            </label>
            <label>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/50">Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-fatman-accent" placeholder="you@example.com" required />
            </label>
            <label>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/50">Phone optional</span>
              <input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-fatman-accent" placeholder="Optional" />
            </label>
            <label>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/50">VIN</span>
              <div className="mt-1 flex gap-2">
                <input value={vin} onChange={(event) => setVin(normalizeVin(event.target.value))} className="w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 font-mono text-white tracking-wider focus:outline-none focus:ring-1 focus:ring-fatman-accent" placeholder="17-character VIN" required />
                <button type="button" onClick={decodeVin} disabled={!vinReady || decodeState.status === "decoding"} className="rounded-lg border border-white/20 px-3 text-xs font-semibold text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45">
                  {decodeState.status === "decoding" ? "Decoding…" : "Decode"}
                </button>
              </div>
            </label>
          </div>

          {decodeState.status === "success" && decoded && (
            <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">VIN decoded</p>
              <p className="mt-2 text-lg font-black text-white">{decodedLabel || decoded.vin}</p>
              <div className="mt-3 grid gap-2 text-sm text-white/72 md:grid-cols-2">
                <p>Engine: {decoded.engine || "Not returned"}</p>
                <p>Body: {decoded.bodyClass || "Not returned"}</p>
                <p>Drive: {decoded.driveType || "Not returned"}</p>
                <p>Plant: {decoded.plantCountry || "Not returned"}</p>
              </div>
            </div>
          )}

          {decodeState.status === "error" && (
            <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-100">
              {decodeState.message}
            </div>
          )}

          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/50">Message</span>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} className="mt-1 h-32 w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-fatman-accent" placeholder={suggestedMessage || "Tell us what part you’re checking or what issue you’re solving."} />
          </label>

          <label className="hidden" aria-hidden="true">
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
          </label>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button disabled={submitState.status === "submitting"} className="rounded-xl bg-fatman-accent px-5 py-3 text-sm font-black text-fatman-900 hover:bg-fatman-accent-hover disabled:cursor-not-allowed disabled:opacity-50">
              {submitState.status === "submitting" ? "Saving request…" : "Submit fitment request"}
            </button>
            <p className="text-xs text-white/45">Saved to Fatman’s request queue.</p>
          </div>

          {submitState.status === "success" && (
            <div className="mt-5 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-50">
              <strong className="block text-white">Request saved.</strong>
              We have the VIN and product context. Reference: {submitState.requestId || "saved"}.
            </div>
          )}

          {submitState.status === "error" && (
            <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-100">
              <strong className="block text-red-50">Could not save request</strong>
              {submitState.message}
            </div>
          )}
        </form>

        <aside className="space-y-4">
          {product ? (
            <div className="rounded-3xl border border-white/12 bg-white/[0.055] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Checking part</p>
              <h3 className="mt-2 text-xl font-black">{product.name}</h3>
              <p className="mt-1 text-sm text-white/55">{product.brand} · SKU {product.sku}</p>
              <p className="mt-3 text-2xl font-black">{formatPrice(product.price)}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">This request will be tied to the product so support can review the part and decoded VIN together.</p>
            </div>
          ) : null}

          <div className="rounded-3xl border border-white/12 bg-white/[0.055] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">What VIN gives us</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/65">
              <li>• Year, make, model when available</li>
              <li>• Engine/body/trim clues when NHTSA returns them</li>
              <li>• Cleaner support queue data</li>
              <li>• Better starting point for later fitment matching</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-amber-400/25 bg-amber-400/10 p-5 text-sm leading-relaxed text-amber-50/85">
            <strong className="block text-amber-100">Important</strong>
            VIN decode is not the same as final part compatibility. This flow saves the request; exact fitment logic comes later.
          </div>
        </aside>
    </div>
  );
}
