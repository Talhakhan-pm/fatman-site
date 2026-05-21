"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type FitmentRequestRow = {
  id: string;
  status: string;
  source: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  vin: string;
  productSlug: string | null;
  productSku: string | null;
  productName: string | null;
  vehicleYear: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleTrim: string | null;
  vehicleEngine: string | null;
  message: string | null;
  createdAt: string;
};

type ApiResponse = {
  source?: string;
  fallbackReason?: string;
  requests?: FitmentRequestRow[];
  error?: string;
};

function vehicleLabel(request: FitmentRequestRow) {
  return [request.vehicleYear, request.vehicleMake, request.vehicleModel, request.vehicleTrim]
    .filter(Boolean)
    .join(" ");
}

export default function AdminFitmentRequestsPage() {
  const [requests, setRequests] = useState<FitmentRequestRow[]>([]);
  const [source, setSource] = useState<string | null>(null);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadRequests() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/fitment-requests/list", { cache: "no-store" });
      const json = (await res.json().catch(() => null)) as ApiResponse | null;

      if (!res.ok) {
        setError(json?.error || `Request failed (${res.status})`);
        setRequests([]);
        return;
      }

      setRequests(json?.requests ?? []);
      setSource(json?.source ?? null);
      setFallbackReason(json?.fallbackReason ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setRequests([]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void loadRequests();
  }, []);

  return (
    <main className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-fatman-accent">Admin</p>
            <h1 className="mt-2 text-4xl font-black">Fitment requests</h1>
            <p className="mt-2 max-w-2xl text-white/65">
              VIN help submissions from the storefront. Local references mean the preview fallback caught the request before Supabase is fully migrated.
            </p>
          </div>
          <button onClick={loadRequests} className="rounded-lg bg-fatman-accent px-4 py-2 text-sm font-black text-fatman-900 hover:bg-fatman-accent-hover">
            {busy ? "Loading…" : "Refresh"}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/60">
          {source && <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Source: {source}</span>}
          {fallbackReason && <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-amber-100">Fallback: {fallbackReason}</span>}
          <Link href="/fitment-help" className="rounded-full border border-white/15 bg-white/5 px-3 py-1 hover:bg-white/10">Open form</Link>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-red-100">
            {error}
          </div>
        )}

        {!busy && !error && requests.length === 0 && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-black">No fitment requests yet.</h2>
            <p className="mt-2 text-white/60">Submit one from the VIN help form, then refresh this page.</p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {requests.map((request) => (
            <article key={request.id} className="rounded-3xl border border-white/12 bg-white/[0.055] p-5 shadow-xl shadow-black/10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-fatman-accent px-2.5 py-1 text-xs font-black text-fatman-900">{request.status}</span>
                    <span className="text-xs text-white/45">{new Date(request.createdAt).toLocaleString()}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-black">{request.customerName}</h2>
                  <p className="text-sm text-white/62">{request.customerEmail}{request.customerPhone ? ` · ${request.customerPhone}` : ""}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold tracking-wider">{request.vin}</p>
                  <p className="mt-1 text-sm text-white/62">{vehicleLabel(request) || "Vehicle not decoded"}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Product</p>
                  <p className="mt-2 font-bold">{request.productName || "No product attached"}</p>
                  {request.productSku && <p className="mt-1 text-sm text-white/55">SKU {request.productSku}</p>}
                  {request.productSlug && (
                    <Link href={`/product/${request.productSlug}`} className="mt-3 inline-block text-sm font-semibold text-fatman-accent hover:text-fatman-accent-hover">
                      View product →
                    </Link>
                  )}
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Decoded engine</p>
                  <p className="mt-2 font-bold">{request.vehicleEngine || "Not returned"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Reference</p>
                  <p className="mt-2 break-all font-mono text-xs text-white/70">{request.id}</p>
                  <p className="mt-2 text-xs text-white/45">{request.source}</p>
                </div>
              </div>

              {request.message && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/15 p-4 text-sm text-white/75">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Message</p>
                  <p className="mt-2 whitespace-pre-wrap">{request.message}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
