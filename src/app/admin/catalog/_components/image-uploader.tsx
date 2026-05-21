import type { useCatalogEditor } from "./use-catalog-editor";
import { ghostButtonClass, labelClass } from "./ui";

export function ImageUploader({ editor }: { editor: ReturnType<typeof useCatalogEditor> }) {
  const {
    editor: editorState,
    imageUploadBusy,
    imageUploadError,
    handleImageUpload,
    setProductField,
    setImageUploadError,
    imagePreviewUrl,
  } = editor;

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <label className={labelClass}>Product image</label>
          <p className="mt-1 text-sm text-white/60">
            Upload a picture here. We will save it and fill the image URL automatically.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <label className={`${ghostButtonClass} cursor-pointer`}>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleImageUpload(file);
                  event.currentTarget.value = "";
                }}
              />
              {imageUploadBusy ? "Uploading image…" : "Choose image"}
            </label>
            <button
              type="button"
              className={ghostButtonClass}
              onClick={() => {
                setProductField("imageUrl", "");
                setImageUploadError(null);
              }}
              disabled={imageUploadBusy || !editorState.product.imageUrl}
            >
              Clear image
            </button>
          </div>
          {imageUploadError && (
            <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
              {imageUploadError}
            </div>
          )}
        </div>
        <div className="w-full max-w-xs">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
            Preview
          </div>
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-fatman-700/60">
            {imagePreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreviewUrl}
                alt={editorState.product.name || "Product preview"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="px-4 text-center text-sm text-white/45">
                No image yet
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
