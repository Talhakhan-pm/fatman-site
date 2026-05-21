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
    loadStarter,
    listError,
    handleLoad,
    loadingSlug,
  } = editor;

  return (
      <div className="space-y-3 rounded-xl border border-white/15 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Pick a product to edit</h2>
          <button
            type="button"
            className={ghostButtonClass}
            onClick={handleListProducts}
            disabled={listBusy}
          >
            {listBusy ? "Loading…" : products ? "Refresh" : "Load list"}
          </button>
        </div>
        <p className="text-sm text-white/60">
          Search existing products, then click <strong>Load</strong> to bring one into the
          editor.
        </p>
        <input
          type="text"
          className={inputClass}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleListProducts();
            }
          }}
          placeholder="Search by name, slug, or SKU"
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" className={ghostButtonClass} onClick={createNewProduct}>
            New blank product
          </button>
          <button type="button" className={ghostButtonClass} onClick={loadStarter}>
            Load sample product
          </button>
        </div>
        {listError && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
            {listError}
          </div>
        )}
        {products && (
          <div className="max-h-96 overflow-auto rounded-lg border border-white/10">
            {products.length === 0 ? (
              <p className="p-3 text-sm text-white/60">No products match.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-white/60">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium">Price</th>
                    <th className="px-3 py-2 font-medium">Live</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.slug} className="border-t border-white/5 align-top">
                      <td className="px-3 py-2">
                        <div className="font-medium text-white/90">{item.name}</div>
                        <div className="font-mono text-[11px] text-white/45">
                          {item.slug} · {item.sku}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-white/60">{item.category_slug}</td>
                      <td className="px-3 py-2 text-white/80">
                        ${Number(item.price).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-white/60">
                        {item.published ? "Yes" : "No"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          className={ghostButtonClass}
                          onClick={() => handleLoad(item.slug)}
                          disabled={loadingSlug === item.slug}
                        >
                          {loadingSlug === item.slug ? "Loading…" : "Load"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
  );
}
