import { NextResponse } from "next/server";
import { products } from "@/lib/catalog";

export async function GET() {
  return NextResponse.json({ products });
}
