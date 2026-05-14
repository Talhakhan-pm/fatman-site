import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAllowedAdminRequest } from "@/lib/admin-api";
import { createSupabaseAdminClient } from "@/lib/supabase";

const ALLOWED_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/svg+xml", ".svg"],
]);

const STORAGE_BUCKET = "fatman-catalog";
const STORAGE_FOLDER = "catalog";

async function ensureBucket() {
  const supabase = createSupabaseAdminClient();
  const { data: bucket, error: getError } = await supabase.storage.getBucket(STORAGE_BUCKET);

  if (!getError && bucket) return supabase;

  const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: [...ALLOWED_TYPES.keys()],
  });

  if (createError && createError.message !== `Bucket already exists`) {
    throw new Error(`Failed to prepare Supabase Storage bucket: ${createError.message}`);
  }

  return supabase;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(req: Request) {
  if (!isAllowedAdminRequest(req, "FATMAN_ADMIN_WRITE_KEY")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const slug = String(formData.get("slug") || "product").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }

    const ext = ALLOWED_TYPES.get(file.type);
    if (!ext) {
      return NextResponse.json(
        { error: "Unsupported image type. Use JPG, PNG, WEBP, GIF, or SVG." },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeSlug = slugify(slug || file.name || "product");
    const fileName = `${safeSlug || "product"}-${randomUUID().slice(0, 8)}${ext}`;
    const objectPath = `${STORAGE_FOLDER}/${fileName}`;

    const supabase = await ensureBucket();
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(objectPath, bytes, {
        contentType: file.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) {
      throw new Error(`Supabase Storage upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      fileName,
      bucket: STORAGE_BUCKET,
      path: objectPath,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
