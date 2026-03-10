const posts = [
  {
    title: "How to Avoid Buying the Wrong Engine Part",
    excerpt: "Use YMME + VIN verification to cut return pain and downtime.",
  },
  {
    title: "OEM vs Aftermarket: What Actually Matters",
    excerpt: "The truth: quality, fitment consistency, and total cost over time.",
  },
  {
    title: "Fast Shipping Myths in Auto Parts",
    excerpt: "What 'ships fast' should really mean before you click checkout.",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-black">Fatman Garage Blog</h1>
        <p className="mt-2 text-white/70">Funny tone. Useful info. Zero fluff.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.title} className="rounded-xl border border-white/15 bg-white/5 p-5">
              <h2 className="text-lg font-semibold">{post.title}</h2>
              <p className="mt-2 text-sm text-white/70">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
