import { useEffect } from "react";
import type { useCatalogEditor } from "./use-catalog-editor";
import { ghostButtonClass, inputClass } from "./ui";

export function ProductPicker({ editor }: { editor: ReturnType<typeof useCatalogEditor> }) {
  const {
    handleListProducts,
    listBusy,
    products,
    search,
    setSearch,
    createNewProduct,
    listError,
    handleLoad,
    loadingSlug,
  } = editor;

  // Auto-load product list on mount
  useEffect(() => {
    void handleListProducts();
  }, []);

  // Debounced real-time search
  useEffect(() => {
    const timer = setTimeout(() => {
      void handleListProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 shadow-inner space-y-4">
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1.5">
          Pick a product
        </h3>
        <p className="text-xs text-white/60">
          Type to search existing products, then click <strong className="text-white">Load</strong> to bring it in.
        </p>
      </div>
      
      <div className="relative">
        <input
          type="text"
          className={inputClass}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, slug, or SKU"
        />
        {listBusy && (
          <span className="absolute right-3 top-2.5 flex h-4 w-4 animate-spin rounded-full border-2 border-fatman-accent border-t-transparent" />
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-white/80 hover:bg-white/5 transition"
          onClick={createNewProduct}
        >
          + New Product
        </button>
      </div>

      {listError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
          {listError}
        </div>
      )}

      {products && (
        <div className="max-h-72 overflow-auto rounded-lg border border-white/10 
          [&::-webkit-scrollbar]:w-2 
          [&::-webkit-scrollbar-track]:bg-black/20 
          [&::-webkit-scrollbar-thumb]:bg-white/10 
          hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          {products.length === 0 ? (
            <p className="p-3 text-xs text-white/50 text-center">No products found.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 bg-[#161a22] text-white/60 shadow-sm">
                <tr>
                  <th className="px-3 py-2 font-black uppercase tracking-wider text-[10px]">Product / SKU</th>
                  <th className="px-3 py-2 font-black uppercase tracking-wider text-[10px]">Price</th>
                  <th className="px-3 py-2 font-black uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {products.map((item) => {
                  const isCurrent = item.slug === editor.editor.originalSlug;
                  return (
                    <tr
                      key={item.slug}
                      className={`border-t border-white/5 align-middle transition-colors ${
                        isCurrent
                          ? "bg-fatman-accent/10 border-l-2 border-l-fatman-accent"
                          : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <td className="px-3 py-2.5">
                        <div className={`font-bold leading-tight ${isCurrent ? "text-fatman-accent" : "text-white/95"}`}>
                          {item.name}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] text-white/40">
                          {item.sku}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-white/80">
                        ${Number(item.price).toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          item.published
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                            : "bg-white/5 text-white/40 border border-white/10"
                        }`}>
                          {item.published ? "Live" : "Draft"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          className={`rounded px-2.5 py-1 text-[10px] font-black uppercase tracking-wide transition ${
                            isCurrent
                              ? "bg-fatman-accent text-fatman-900 border border-fatman-accent pointer-events-none"
                              : "border border-white/20 text-white/85 hover:bg-white/5"
                          }`}
                          onClick={() => !isCurrent && handleLoad(item.slug)}
                          disabled={loadingSlug === item.slug || isCurrent}
                        >
                          {loadingSlug === item.slug ? "Loading…" : isCurrent ? "Active" : "Load"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
