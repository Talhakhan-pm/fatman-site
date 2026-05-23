import { generatedCategories, generatedProducts } from "@/lib/generated-data";
import type { CategorySlug } from "@/lib/catalog-registry";

export type Product = {
  sku: string;
  slug: string;
  category: CategorySlug;
  brand: string;
  name: string;
  shortDescription: string;
  price: number;
  compareAt?: number;
  stock: "in-stock" | "low-stock" | "preorder";
  imageUrl?: string;
  shippingClass?: string;
  warrantyDays?: number;
  oemPartNumber?: string;
};

export type Category = {
  slug: CategorySlug;
  title: string;
  description: string;
  productCount: number;
  realImageCount: number;
};

const curatedCoolingProducts: Product[] = [
  {
    sku: "FTM-COL-2001",
    slug: "aluminum-radiator-oe-2-row",
    category: "engine-cooling-exhaust",
    brand: "DriveCore",
    name: "2-Row Aluminum Radiator with OE-Style Side Tanks",
    shortDescription: "Direct-fit replacement radiator with aluminum core, crimped composite side tanks, and factory-mount geometry for daily-driver cooling repairs.",
    price: 289.99,
    compareAt: 339.99,
    stock: "in-stock",
    imageUrl: "/fatman-assets/cooling-us-catalog-2026-04-27/radiator-aluminum-oe.svg",
    shippingClass: "ground",
    warrantyDays: 180,
    oemPartNumber: "OEM-COL-2001",
  },
  {
    sku: "FTM-COL-2002",
    slug: "dual-electric-fan-shroud-assembly",
    category: "engine-cooling-exhaust",
    brand: "Powerline",
    name: "Dual Electric Radiator Fan and Shroud Assembly",
    shortDescription: "Complete dual-fan module with molded shroud, factory-style motor mounts, and connector-ready layout for late-model radiator service jobs.",
    price: 364.99,
    compareAt: 429.99,
    stock: "in-stock",
    imageUrl: "/fatman-assets/cooling-us-catalog-2026-04-27/fan-assembly-dual-electric.svg",
    shippingClass: "ground",
    warrantyDays: 180,
    oemPartNumber: "OEM-COL-2002",
  },
  {
    sku: "FTM-COL-2003",
    slug: "cast-aluminum-water-pump",
    category: "engine-cooling-exhaust",
    brand: "Nippon OEM",
    name: "Cast Aluminum Engine Water Pump with Hub",
    shortDescription: "New replacement water pump with cast housing, pressed bearing assembly, and pulley-mount hub for stock belt-drive cooling systems.",
    price: 149.99,
    compareAt: 189.99,
    stock: "in-stock",
    imageUrl: "/fatman-assets/cooling-us-catalog-2026-04-27/water-pump-cast-aluminum.svg",
    shippingClass: "ground",
    warrantyDays: 180,
    oemPartNumber: "OEM-COL-2003",
  },
  {
    sku: "FTM-COL-2004",
    slug: "thermostat-housing-gasket-kit",
    category: "engine-cooling-exhaust",
    brand: "OEM Direct",
    name: "Thermostat Housing Kit with Thermostat and Gasket",
    shortDescription: "Service kit combining cast thermostat housing, installed thermostat, and sealing gasket for common leak and overheating repairs.",
    price: 86.99,
    compareAt: 109.99,
    stock: "in-stock",
    imageUrl: "/fatman-assets/cooling-us-catalog-2026-04-27/thermostat-housing-kit.svg",
    shippingClass: "ground",
    warrantyDays: 180,
    oemPartNumber: "OEM-COL-2004",
  },
  {
    sku: "FTM-COL-2005",
    slug: "coolant-overflow-reservoir-tank",
    category: "engine-cooling-exhaust",
    brand: "TrueDrive",
    name: "Coolant Overflow Reservoir Tank with Cap",
    shortDescription: "Translucent recovery tank with installed cap and molded mounting ears, built to restore coolant overflow capacity on cracked or stained originals.",
    price: 74.99,
    compareAt: 94.99,
    stock: "low-stock",
    imageUrl: "/fatman-assets/cooling-us-catalog-2026-04-27/coolant-reservoir-tank.svg",
    shippingClass: "ground",
    warrantyDays: 180,
    oemPartNumber: "OEM-COL-2005",
  },
  {
    sku: "FTM-COL-2006",
    slug: "upper-lower-radiator-hose-set",
    category: "engine-cooling-exhaust",
    brand: "ThermaFlow",
    name: "Molded Upper and Lower Radiator Hose Set",
    shortDescription: "Pre-formed radiator hose pair with molded bends and clamp-ready ends for stock replacement cooling-system refresh work.",
    price: 59.99,
    compareAt: 79.99,
    stock: "in-stock",
    imageUrl: "/fatman-assets/cooling-us-catalog-2026-04-27/radiator-hose-set-molded.svg",
    shippingClass: "ground",
    warrantyDays: 120,
    oemPartNumber: "OEM-COL-2006",
  },
  {
    sku: "FTM-COL-2007",
    slug: "compact-heater-core-aluminum-brass",
    category: "engine-cooling-exhaust",
    brand: "DriveCore",
    name: "Compact Heater Core, Aluminum and Brass Construction",
    shortDescription: "Replacement heater core with dense fin pack and formed inlet tubes for restoring cabin heat and defrost performance without dash-side improvisation.",
    price: 129.99,
    compareAt: 159.99,
    stock: "preorder",
    imageUrl: "/fatman-assets/cooling-us-catalog-2026-04-27/heater-core-compact.svg",
    shippingClass: "ground",
    warrantyDays: 180,
    oemPartNumber: "OEM-COL-2007",
  },
  {
    sku: "FTM-COL-2008",
    slug: "heavy-duty-fan-clutch",
    category: "engine-cooling-exhaust",
    brand: "Powerline",
    name: "Heavy-Duty Engine Cooling Fan Clutch",
    shortDescription: "Thermal fan clutch built for truck and SUV mechanical fan systems where worn engagement causes idle heat soak and towing-temp spikes.",
    price: 119.99,
    compareAt: 149.99,
    stock: "in-stock",
    imageUrl: "/fatman-assets/cooling-us-catalog-2026-04-27/fan-clutch-heavy-duty.svg",
    shippingClass: "ground",
    warrantyDays: 180,
    oemPartNumber: "OEM-COL-2008",
  },
];

export const products: Product[] = [
  ...((generatedProducts as unknown as Product[]).filter((item) => item.category !== "engine-cooling-exhaust")),
  ...curatedCoolingProducts,
];

export const categories: Category[] = (generatedCategories as unknown as Category[]).map((category) =>
  category.slug === "engine-cooling-exhaust"
    ? {
        ...category,
        description: "Complete crate engines, cylinder heads, water pumps, radiators, fan assemblies, mufflers, catalytic converters, and exhaust manifolds.",
        realImageCount: category.realImageCount + curatedCoolingProducts.length,
      }
    : category,
);

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function getCategory(slug: string) {
  return categories.find((item) => item.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return products.filter((item) => item.category === slug);
}

export function getProduct(slug: string) {
  return products.find((item) => item.slug === slug);
}
