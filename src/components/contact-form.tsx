"use client";

import { useState } from "react";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; requestId?: string; source?: string }
  | { status: "error"; message: string };

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [vin, setVin] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: "submitting" });

    try {
      const res = await fetch("/api/contact/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          vin,
          orderNumber,
          message,
          website,
          source: "contact-form",
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; source?: string; request?: { id?: string }; error?: string; details?: string }
        | null;

      if (!res.ok || !json?.ok) {
        setSubmitState({ status: "error", message: json?.error || json?.details || `Request failed (${res.status})` });
        return;
      }

      setSubmitState({ status: "success", requestId: json.request?.id, source: json.source });
      setSubject("");
      setVin("");
      setOrderNumber("");
      setMessage("");
    } catch (error) {
      setSubmitState({ status: "error", message: error instanceof Error ? error.message : "Request failed" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-white/15 bg-white/5 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2" placeholder="Name" required />
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2" placeholder="Email" required />
        <input value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2" placeholder="Phone (optional)" />
        <input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} className="w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2" placeholder="Order number (optional)" />
      </div>
      <input value={subject} onChange={(event) => setSubject(event.target.value)} className="w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2" placeholder="Subject" />
      <input value={vin} onChange={(event) => setVin(event.target.value.toUpperCase())} className="w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 font-mono tracking-wider" placeholder="VIN (optional, preferred for fitment)" />
      <textarea value={message} onChange={(event) => setMessage(event.target.value)} className="h-32 w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2" placeholder="Order number, product link, part number, vehicle details, or what part you need" required />

      <label className="hidden" aria-hidden="true">
        Website
        <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button disabled={submitState.status === "submitting"} className="rounded-lg bg-fatman-accent px-4 py-2 font-semibold text-fatman-900 transition hover:bg-fatman-accent-hover disabled:cursor-not-allowed disabled:opacity-50">
          {submitState.status === "submitting" ? "Sending…" : "Send"}
        </button>
        <span className="text-xs text-white/45">Saved to the Fatman support inbox.</span>
      </div>

      {submitState.status === "success" && (
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm text-emerald-50">
          <strong className="block text-white">Message saved.</strong>
          Reference: {submitState.requestId || "saved"} {submitState.source ? `(${submitState.source})` : ""}
        </div>
      )}

      {submitState.status === "error" && (
        <div className="rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-100">
          <strong className="block text-red-50">Could not send message</strong>
          {submitState.message}
        </div>
      )}
    </form>
  );
}
