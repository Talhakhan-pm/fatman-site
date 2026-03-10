export default function ContactPage() {
  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-black">Contact</h1>
        <p className="mt-2 text-white/70">Need fitment help? Send VIN + part intent.</p>

        <form className="mt-6 space-y-4 rounded-xl border border-white/15 bg-white/5 p-5">
          <input className="w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2" placeholder="Name" />
          <input className="w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2" placeholder="Email" />
          <input className="w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2" placeholder="VIN (optional)" />
          <textarea className="h-32 w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2" placeholder="What part do you need?" />
          <button className="rounded-lg bg-fatman-accent px-4 py-2 font-semibold">Send</button>
        </form>
      </section>
    </div>
  );
}
