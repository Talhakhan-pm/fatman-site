const trustItems = [
  "Guaranteed Fitment",
  "Fast U.S. Shipping",
  "Easy Returns",
  "Support That Responds",
];

export function TrustStrip() {
  return (
    <section className="border-y border-white/10 bg-fatman-700/70">
      <div className="mx-auto grid max-w-6xl gap-2 px-6 py-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => (
          <div key={item} className="rounded-md bg-white/5 px-3 py-2 text-white/90">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
