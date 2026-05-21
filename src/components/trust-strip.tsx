import Image from "next/image";

const trustItems = [
  { text: "Guaranteed Fitment", icon: "/trust-icons/fitment.png" },
  { text: "Fast U.S. Shipping", icon: "/trust-icons/shipping.png" },
  { text: "Easy Returns", icon: "/trust-icons/returns.png" },
  { text: "Support That Responds", icon: "/trust-icons/support.png" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-white/10 py-10">
      <style>{`
        body[data-theme="dark"] .trust-strip-image {
          display: none !important;
        }
      `}</style>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 sm:gap-8 lg:grid-cols-4 lg:gap-10">
        {trustItems.map((item) => (
          <div key={item.text} className="flex flex-col items-center justify-center text-center group">
            <div className="trust-strip-image relative h-16 w-16 sm:h-24 sm:w-24 lg:h-28 lg:w-28 shrink-0 transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-105">
              <Image src={item.icon} alt={item.text} fill className="object-contain" sizes="112px" />
            </div>
            <span className="font-bold uppercase tracking-[0.15em] text-[11px] text-white/80 -mt-4 cancel-mt-in-dark">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
