import { createFitmentCatalog, type FitmentCatalogTreeData } from "@fatman/fitment-react";
import charmFitmentTree from "../../data/charm-fitment/charm-fitment-tree.json";

const charmTree = charmFitmentTree as unknown as FitmentCatalogTreeData & {
  metadata?: { generatedAt?: string; source?: string };
};

export const charmFitmentCatalog = createFitmentCatalog(
  {
    years: charmTree.years,
    modelsByYearMake: charmTree.modelsByYearMake,
    variantsByYearMakeModel: charmTree.variantsByYearMakeModel,
    enginesByYearMakeModelVariant: charmTree.enginesByYearMakeModelVariant,
  },
  {
    keySeparator: "|||",
    defaultVariant: "Base",
    metadata: {
      source: charmTree.metadata?.source ?? "Charm",
      generatedAt: charmTree.metadata?.generatedAt,
    },
  },
);
