"use client";

import { useCallback, useState, type ReactNode } from "react";
import type {
  FitmentCatalog,
  PartialVehicle,
  Vehicle,
  VehicleSelection,
} from "../types";
import { useFitmentSelection } from "../use-fitment-selection";
import { isValidVin, normalizeVin } from "../vin";
import {
  FitmentDropdown,
  type FitmentDropdownClassNames,
} from "./fitment-dropdown";

export type FitmentConfirmSource = "manual" | "vin";

export interface FitmentSelectorLabels {
  year?: string;
  make?: string;
  model?: string;
  variant?: string;
  engine?: string;
  yearPlaceholder?: string;
  makePlaceholder?: string;
  modelPlaceholder?: string;
  variantPlaceholder?: string;
  enginePlaceholder?: string;

  searchIdle?: string;
  searchReady?: (vehicle: Vehicle, partCount: number | null) => string;

  vinDivider?: string;
  vinPlaceholder?: string;
  vinGo?: string;
  vinEmptyError?: string;
  vinInvalidError?: string;
  vinDecodeError?: string;

  confirmation?: (vehicle: Vehicle, partCount: number | null) => ReactNode;
  source?: ReactNode;
}

export interface FitmentSelectorClassNames {
  root?: string;
  header?: string;
  headerTitle?: string;
  headerSource?: string;
  fields?: string;
  searchButton?: string;
  searchButtonReady?: string;
  searchButtonIdle?: string;
  divider?: string;
  dividerLine?: string;
  dividerLabel?: string;
  vinSection?: string;
  vinRow?: string;
  vinInput?: string;
  vinSubmit?: string;
  vinError?: string;
  confirmation?: string;
  dropdown?: FitmentDropdownClassNames;
}

export interface FitmentSelectorRenderContext {
  selection: VehicleSelection;
  isComplete: boolean;
  vehicle: Vehicle | null;
  partCount: number | null;
  reset: () => void;
}

export interface FitmentSelectorProps {
  catalog: FitmentCatalog;

  initialVehicle?: PartialVehicle | null;
  /** Auto-fill variant/engine when only one option exists. Default `true`. */
  autoSelectSingleOption?: boolean;

  labels?: FitmentSelectorLabels;
  classNames?: FitmentSelectorClassNames;

  /** Hide the year/make/.../engine dropdowns header strip. */
  showHeader?: boolean;
  /** Hide the VIN section entirely. */
  showVinSection?: boolean;

  /** Optional consumer-provided count to display in the CTA + confirmation. */
  partCountResolver?: (vehicle: Vehicle) => number | null;

  /** Fires for any selection mutation (after cascading clears). */
  onSelectionChange?: (selection: VehicleSelection) => void;
  /** Fires when the user clicks the search CTA with a complete vehicle. */
  onConfirm: (vehicle: Vehicle, source: FitmentConfirmSource) => void;
  /**
   * Called when the user submits a VIN. Return a Vehicle (or Promise) to
   * decode + apply, or null to short-circuit. If omitted, the VIN section
   * is rendered but the GO button does nothing useful — pass
   * `showVinSection={false}` to hide it instead.
   */
  onVinSubmit?: (vin: string) => Vehicle | null | Promise<Vehicle | null>;

  renderHeader?: (ctx: FitmentSelectorRenderContext) => ReactNode;
  renderFooter?: (ctx: FitmentSelectorRenderContext) => ReactNode;
}

const DEFAULT_LABELS: Required<
  Pick<
    FitmentSelectorLabels,
    | "year"
    | "make"
    | "model"
    | "variant"
    | "engine"
    | "yearPlaceholder"
    | "makePlaceholder"
    | "modelPlaceholder"
    | "variantPlaceholder"
    | "enginePlaceholder"
    | "searchIdle"
    | "vinDivider"
    | "vinPlaceholder"
    | "vinGo"
    | "vinEmptyError"
    | "vinInvalidError"
    | "vinDecodeError"
  >
> = {
  year: "YEAR",
  make: "MAKE",
  model: "MODEL",
  variant: "TRIM",
  engine: "ENGINE",
  yearPlaceholder: "Select year",
  makePlaceholder: "Select make",
  modelPlaceholder: "Select model",
  variantPlaceholder: "Select trim",
  enginePlaceholder: "Select engine",
  searchIdle: "Select vehicle to search",
  vinDivider: "or paste VIN",
  vinPlaceholder: "1FTFW1E87MFA00000",
  vinGo: "GO",
  vinEmptyError: "Enter a 17-character VIN",
  vinInvalidError: "Invalid VIN — must be 17 alphanumeric characters (no I, O, Q)",
  vinDecodeError: "Could not decode that VIN",
};

const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(" ");

export function FitmentSelector(props: FitmentSelectorProps) {
  const {
    catalog,
    initialVehicle,
    autoSelectSingleOption = true,
    labels,
    classNames,
    showHeader = true,
    showVinSection = true,
    partCountResolver,
    onSelectionChange,
    onConfirm,
    onVinSubmit,
    renderHeader,
    renderFooter,
  } = props;

  const L = { ...DEFAULT_LABELS, ...(labels ?? {}) };
  const C = classNames ?? {};

  const {
    selection,
    isComplete,
    options,
    setYear,
    setMake,
    setModel,
    setVariant,
    setEngine,
    applyVehicle,
    reset,
    asVehicle,
  } = useFitmentSelection({
    catalog,
    initialVehicle,
    autoSelectSingleOption,
    onSelectionChange,
  });

  const [vin, setVin] = useState("");
  const [vinError, setVinError] = useState("");
  const [vinPending, setVinPending] = useState(false);
  const [confirmedVehicle, setConfirmedVehicle] = useState<Vehicle | null>(() =>
    initialVehicle && initialVehicle.year && initialVehicle.make && initialVehicle.model && initialVehicle.engine
      ? {
          year: initialVehicle.year,
          make: initialVehicle.make,
          model: initialVehicle.model,
          variant: initialVehicle.variant ?? "",
          engine: initialVehicle.engine,
        }
      : null,
  );

  const vehicle = asVehicle();
  const partCount = vehicle && partCountResolver ? partCountResolver(vehicle) : null;
  const confirmedPartCount =
    confirmedVehicle && partCountResolver ? partCountResolver(confirmedVehicle) : null;

  const handleSearch = useCallback(() => {
    const ready = asVehicle();
    if (!ready) return;
    setConfirmedVehicle(ready);
    onConfirm(ready, "manual");
  }, [asVehicle, onConfirm]);

  const handleVinSubmit = useCallback(async () => {
    setVinError("");
    const trimmed = vin.trim();
    if (!trimmed) {
      setVinError(L.vinEmptyError);
      return;
    }
    if (!isValidVin(trimmed)) {
      setVinError(L.vinInvalidError);
      return;
    }
    if (!onVinSubmit) return;

    try {
      setVinPending(true);
      const decoded = await onVinSubmit(normalizeVin(trimmed));
      if (!decoded) {
        setVinError(L.vinDecodeError);
        return;
      }
      applyVehicle(decoded);
      setConfirmedVehicle(decoded);
      onConfirm(decoded, "vin");
    } catch {
      setVinError(L.vinDecodeError);
    } finally {
      setVinPending(false);
    }
  }, [vin, L.vinEmptyError, L.vinInvalidError, L.vinDecodeError, onVinSubmit, applyVehicle, onConfirm]);

  // Once the user touches a dropdown, drop the confirmation banner — it's
  // for the *previously* confirmed vehicle, not the in-progress edit.
  const handleSelectionEdit = (setter: (v: string) => void) => (next: string) => {
    setConfirmedVehicle(null);
    setter(next);
  };

  const ctx: FitmentSelectorRenderContext = {
    selection,
    isComplete,
    vehicle,
    partCount,
    reset,
  };

  return (
    <div className={C.root}>
      {showHeader &&
        (renderHeader ? (
          renderHeader(ctx)
        ) : (
          <div className={C.header}>
            <span className={C.headerTitle}>{L.source ?? null}</span>
            {L.source ? <span className={C.headerSource}>{L.source}</span> : null}
          </div>
        ))}

      <div className={C.fields}>
        <FitmentDropdown
          label={L.year}
          value={selection.year}
          options={options.years}
          placeholder={L.yearPlaceholder}
          onChange={handleSelectionEdit(setYear)}
          classNames={C.dropdown}
        />
        <FitmentDropdown
          label={L.make}
          value={selection.make}
          options={options.makes}
          placeholder={L.makePlaceholder}
          disabled={!selection.year}
          onChange={handleSelectionEdit(setMake)}
          classNames={C.dropdown}
        />
        <FitmentDropdown
          label={L.model}
          value={selection.model}
          options={options.models}
          placeholder={L.modelPlaceholder}
          disabled={!selection.make}
          onChange={handleSelectionEdit(setModel)}
          classNames={C.dropdown}
        />
        <FitmentDropdown
          label={L.variant}
          value={selection.variant}
          options={options.variants}
          placeholder={L.variantPlaceholder}
          disabled={!selection.model}
          onChange={handleSelectionEdit(setVariant)}
          classNames={C.dropdown}
        />
        <FitmentDropdown
          label={L.engine}
          value={selection.engine}
          options={options.engines}
          placeholder={L.enginePlaceholder}
          disabled={!selection.variant}
          onChange={handleSelectionEdit(setEngine)}
          classNames={C.dropdown}
        />
      </div>

      <button
        type="button"
        onClick={handleSearch}
        disabled={!isComplete}
        className={cx(
          C.searchButton,
          isComplete ? C.searchButtonReady : C.searchButtonIdle,
        )}
      >
        {isComplete && vehicle && L.searchReady
          ? L.searchReady(vehicle, partCount)
          : L.searchIdle}
      </button>

      {showVinSection && (
        <>
          <div className={C.divider}>
            <span className={C.dividerLine} />
            <span className={C.dividerLabel}>{L.vinDivider}</span>
            <span className={C.dividerLine} />
          </div>

          <div className={C.vinSection}>
            <div className={C.vinRow}>
              <input
                type="text"
                value={vin}
                onChange={(e) => {
                  setVin(e.target.value.toUpperCase());
                  setVinError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleVinSubmit();
                  }
                }}
                maxLength={17}
                placeholder={L.vinPlaceholder}
                aria-label="VIN"
                className={C.vinInput}
                disabled={vinPending}
              />
              <button
                type="button"
                onClick={() => void handleVinSubmit()}
                disabled={vinPending}
                className={C.vinSubmit}
              >
                {L.vinGo}
              </button>
            </div>
            {vinError && <p className={C.vinError}>{vinError}</p>}
          </div>
        </>
      )}

      {confirmedVehicle && (
        <div className={C.confirmation}>
          {L.confirmation
            ? L.confirmation(confirmedVehicle, confirmedPartCount)
            : null}
        </div>
      )}

      {renderFooter ? renderFooter(ctx) : null}
    </div>
  );
}
