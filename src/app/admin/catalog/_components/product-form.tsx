import type { useCatalogEditor } from "./use-catalog-editor";
import { inputClass, labelClass } from "./ui";
import { catalogRegistry } from "@/lib/catalog-registry";
import { ImageUploader } from "./image-uploader";

export function ProductForm({ editor }: { editor: ReturnType<typeof useCatalogEditor> }) {
  const {
    editor: editorState,
    setProductField,
    enableAutoSku,
    enableAutoSlug,
    autoSkuEnabled,
    autoSlugEnabled,
  } = editor;

  return (
    <div className="space-y-6">
      {/* Basics Card */}
      <div className="rounded-xl border border-white/15 bg-white/5 p-5">
        <h2 className="text-lg font-bold mb-4">Basic Details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>Name</label>
            <input
              className={`${inputClass} mt-1`}
              value={editorState.product.name}
              onChange={(event) => setProductField("name", event.target.value)}
              placeholder="Aluminum Radiator"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className={labelClass}>SKU</label>
              {!autoSkuEnabled && (
                <button
                  type="button"
                  onClick={enableAutoSku}
                  className="text-[10px] uppercase tracking-wider text-fatman-accent hover:underline"
                >
                  Auto-generate
                </button>
              )}
            </div>
            <input
              className={`${inputClass} mt-1`}
              value={editorState.product.sku}
              onChange={(event) => setProductField("sku", event.target.value)}
              placeholder="FTM-COL-1234"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className={labelClass}>URL Slug</label>
              {!autoSlugEnabled && (
                <button
                  type="button"
                  onClick={enableAutoSlug}
                  className="text-[10px] uppercase tracking-wider text-fatman-accent hover:underline"
                >
                  Auto-generate
                </button>
              )}
            </div>
            <input
              className={`${inputClass} mt-1`}
              value={editorState.product.slug}
              onChange={(event) => setProductField("slug", event.target.value)}
              placeholder="aluminum-radiator"
            />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              className={`${inputClass} mt-1`}
              value={editorState.product.category}
              onChange={(event) => setProductField("category", event.target.value)}
            >
              {catalogRegistry.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Brand</label>
            <input
              className={`${inputClass} mt-1`}
              value={editorState.product.brand}
              onChange={(event) => setProductField("brand", event.target.value)}
              placeholder="DriveCore"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Short description</label>
          <textarea
            className={`${inputClass} mt-1 min-h-28`}
            value={editorState.product.shortDescription}
            onChange={(event) => setProductField("shortDescription", event.target.value)}
            placeholder="Direct-fit replacement brake kit for heavy-duty use."
          />
        </div>
      </div>

      {/* Pricing & Inventory Card */}
      <div className="rounded-xl border border-white/15 bg-white/5 p-5">
        <h2 className="text-lg font-bold mb-4">Pricing & Inventory</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass}>Price (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`${inputClass} mt-1`}
              value={editorState.product.price}
              onChange={(event) => setProductField("price", event.target.value)}
              placeholder="199.99"
            />
          </div>
          <div>
            <label className={labelClass}>Compare-at (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`${inputClass} mt-1`}
              value={editorState.product.compareAt}
              onChange={(event) => setProductField("compareAt", event.target.value)}
              placeholder="249.99"
            />
          </div>
          <div>
            <label className={labelClass}>Stock status</label>
            <select
              className={`${inputClass} mt-1`}
              value={editorState.product.stock}
              onChange={(event) =>
                setProductField("stock", event.target.value as "in-stock" | "low-stock" | "preorder")
              }
            >
              <option value="in-stock">In stock</option>
              <option value="low-stock">Low stock</option>
              <option value="preorder">Pre-order</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipping & Specs Card */}
      <div className="rounded-xl border border-white/15 bg-white/5 p-5">
        <h2 className="text-lg font-bold mb-4">Shipping & Specifications</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass}>Shipping class</label>
            <select
              className={`${inputClass} mt-1`}
              value={editorState.product.shippingClass}
              onChange={(event) => setProductField("shippingClass", event.target.value)}
            >
              <option value="ground">Standard ground</option>
              <option value="freight">Freight (oversized)</option>
              <option value="digital">Digital / no shipping</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Warranty days</label>
            <input
              className={`${inputClass} mt-1`}
              value={editorState.product.warrantyDays}
              onChange={(event) => setProductField("warrantyDays", event.target.value)}
              placeholder="180"
            />
          </div>
          <div>
            <label className={labelClass}>OEM part number</label>
            <input
              className={`${inputClass} mt-1`}
              value={editorState.product.oemPartNumber}
              onChange={(event) => setProductField("oemPartNumber", event.target.value)}
              placeholder="OEM-12345"
            />
          </div>
        </div>
      </div>

      {/* Image Uploader */}
      <div className="rounded-xl border border-white/15 bg-white/5 p-5">
        <h2 className="text-lg font-bold">Product Media</h2>
        <ImageUploader editor={editor} />
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <label className={labelClass}>Or provide Image URL manually</label>
          <input
            className={`${inputClass} mt-1`}
            value={editorState.product.imageUrl}
            onChange={(event) => setProductField("imageUrl", event.target.value)}
            placeholder="/fatman-uploads/catalog/product-image.jpg"
          />
        </div>
      </div>

      {/* Publishing */}
      <div className="rounded-xl border border-white/15 bg-white/5 p-5">
        <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded bg-black/20 border-white/20 text-fatman-accent focus:ring-fatman-accent"
            checked={editorState.product.published}
            onChange={(event) => setProductField("published", event.target.checked)}
          />
          Product is live and visible on the storefront
        </label>
      </div>
    </div>
  );
}
