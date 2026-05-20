export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-black">Privacy Policy</h1>
        <p className="mt-4 text-white/75">
          We keep this simple: we use your information to fulfill orders and support you.
          We don’t sell personal data.
        </p>
        <div className="mt-8 grid gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="font-semibold">What we collect</p>
            <p className="mt-1 text-white/70">
              Order details, shipping information, and any messages you send us.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="font-semibold">What we use it for</p>
            <p className="mt-1 text-white/70">
              Processing orders, providing support, and improving the storefront experience.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

