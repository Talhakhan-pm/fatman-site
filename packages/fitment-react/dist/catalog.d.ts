import type { FitmentCatalog, FitmentCatalogConfig, FitmentCatalogTreeData } from "./types";
/**
 * Builds a read-only catalog from a flat tree-shaped input. The tree is
 * normalized once up-front so downstream lookups are constant-time.
 *
 * The config lets you override the composite-key separator and the synthetic
 * "no-variant" placeholder so this works with non-Charm vendors too.
 */
export declare function createFitmentCatalog(data: FitmentCatalogTreeData, config?: FitmentCatalogConfig): FitmentCatalog;
//# sourceMappingURL=catalog.d.ts.map