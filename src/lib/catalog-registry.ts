import registry from "@/lib/catalog-registry.json";
import {
  BrakeIcon,
  ElectricalIcon,
  EngineIcon,
  ExhaustIcon,
  SuspensionIcon,
  TransmissionIcon,
} from "@/components/category-icons";

export type CategorySlug =
  | "transmission-drivetrain"
  | "engine-cooling-exhaust"
  | "powertrain-management"
  | "steering-suspension"
  | "brakes-traction-control"
  | "starting-charging"
  | "maintenance"
  | "sensors-switches"
  | "body-frame"
  | "heating-air-conditioning"
  | "instrument-panel-gauges"
  | "lighting-horns"
  | "windows-glass"
  | "wiper-washer"
  | "relays-modules"
  | "cruise-control"
  | "accessories-optional-equipment"
  | "engines"
  | "brakes"
  | "oem-parts"
  | "drivetrain"
  | "cooling"
  | "electrical"
  | "suspension";

export type RegistryIconKey = "engine" | "brake" | "electrical" | "suspension" | "exhaust" | "transmission";

export type CatalogRegistryEntry = {
  slug: CategorySlug;
  title: string;
  description: string;
  shortDescription: string;
  icon: RegistryIconKey;
  tag: string | null;
  showInHeader: boolean;
  showInFooter: boolean;
  showOnHomepage: boolean;
  productCount?: number;
};

export const catalogRegistry = registry as CatalogRegistryEntry[];

export const categoryIconMap = {
  engine: EngineIcon,
  brake: BrakeIcon,
  electrical: ElectricalIcon,
  suspension: SuspensionIcon,
  exhaust: ExhaustIcon,
  transmission: TransmissionIcon,
} as const;

export function getRegistryEntry(slug: string) {
  return catalogRegistry.find((entry) => entry.slug === slug);
}
