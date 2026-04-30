"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useState } from "react";
import { useFitmentSelection } from "../use-fitment-selection";
import { isValidVin, normalizeVin } from "../vin";
import { FitmentDropdown, } from "./fitment-dropdown";
const DEFAULT_LABELS = {
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
const cx = (...parts) => parts.filter(Boolean).join(" ");
export function FitmentSelector(props) {
    const { catalog, initialVehicle, autoSelectSingleOption = true, labels, classNames, showHeader = true, showVinSection = true, partCountResolver, onSelectionChange, onConfirm, onVinSubmit, renderHeader, renderFooter, } = props;
    const L = { ...DEFAULT_LABELS, ...(labels ?? {}) };
    const C = classNames ?? {};
    const { selection, isComplete, options, setYear, setMake, setModel, setVariant, setEngine, applyVehicle, reset, asVehicle, } = useFitmentSelection({
        catalog,
        initialVehicle,
        autoSelectSingleOption,
        onSelectionChange,
    });
    const [vin, setVin] = useState("");
    const [vinError, setVinError] = useState("");
    const [vinPending, setVinPending] = useState(false);
    const [confirmedVehicle, setConfirmedVehicle] = useState(() => initialVehicle && initialVehicle.year && initialVehicle.make && initialVehicle.model && initialVehicle.engine
        ? {
            year: initialVehicle.year,
            make: initialVehicle.make,
            model: initialVehicle.model,
            variant: initialVehicle.variant ?? "",
            engine: initialVehicle.engine,
        }
        : null);
    const vehicle = asVehicle();
    const partCount = vehicle && partCountResolver ? partCountResolver(vehicle) : null;
    const confirmedPartCount = confirmedVehicle && partCountResolver ? partCountResolver(confirmedVehicle) : null;
    const handleSearch = useCallback(() => {
        const ready = asVehicle();
        if (!ready)
            return;
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
        if (!onVinSubmit)
            return;
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
        }
        catch {
            setVinError(L.vinDecodeError);
        }
        finally {
            setVinPending(false);
        }
    }, [vin, L.vinEmptyError, L.vinInvalidError, L.vinDecodeError, onVinSubmit, applyVehicle, onConfirm]);
    // Once the user touches a dropdown, drop the confirmation banner — it's
    // for the *previously* confirmed vehicle, not the in-progress edit.
    const handleSelectionEdit = (setter) => (next) => {
        setConfirmedVehicle(null);
        setter(next);
    };
    const ctx = {
        selection,
        isComplete,
        vehicle,
        partCount,
        reset,
    };
    return (_jsxs("div", { className: C.root, children: [showHeader &&
                (renderHeader ? (renderHeader(ctx)) : (_jsxs("div", { className: C.header, children: [_jsx("span", { className: C.headerTitle, children: L.source ?? null }), L.source ? _jsx("span", { className: C.headerSource, children: L.source }) : null] }))), _jsxs("div", { className: C.fields, children: [_jsx(FitmentDropdown, { label: L.year, value: selection.year, options: options.years, placeholder: L.yearPlaceholder, onChange: handleSelectionEdit(setYear), classNames: C.dropdown }), _jsx(FitmentDropdown, { label: L.make, value: selection.make, options: options.makes, placeholder: L.makePlaceholder, disabled: !selection.year, onChange: handleSelectionEdit(setMake), classNames: C.dropdown }), _jsx(FitmentDropdown, { label: L.model, value: selection.model, options: options.models, placeholder: L.modelPlaceholder, disabled: !selection.make, onChange: handleSelectionEdit(setModel), classNames: C.dropdown }), _jsx(FitmentDropdown, { label: L.variant, value: selection.variant, options: options.variants, placeholder: L.variantPlaceholder, disabled: !selection.model, onChange: handleSelectionEdit(setVariant), classNames: C.dropdown }), _jsx(FitmentDropdown, { label: L.engine, value: selection.engine, options: options.engines, placeholder: L.enginePlaceholder, disabled: !selection.variant, onChange: handleSelectionEdit(setEngine), classNames: C.dropdown })] }), _jsx("button", { type: "button", onClick: handleSearch, disabled: !isComplete, className: cx(C.searchButton, isComplete ? C.searchButtonReady : C.searchButtonIdle), children: isComplete && vehicle && L.searchReady
                    ? L.searchReady(vehicle, partCount)
                    : L.searchIdle }), showVinSection && (_jsxs(_Fragment, { children: [_jsxs("div", { className: C.divider, children: [_jsx("span", { className: C.dividerLine }), _jsx("span", { className: C.dividerLabel, children: L.vinDivider }), _jsx("span", { className: C.dividerLine })] }), _jsxs("div", { className: C.vinSection, children: [_jsxs("div", { className: C.vinRow, children: [_jsx("input", { type: "text", value: vin, onChange: (e) => {
                                            setVin(e.target.value.toUpperCase());
                                            setVinError("");
                                        }, onKeyDown: (e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                void handleVinSubmit();
                                            }
                                        }, maxLength: 17, placeholder: L.vinPlaceholder, "aria-label": "VIN", className: C.vinInput, disabled: vinPending }), _jsx("button", { type: "button", onClick: () => void handleVinSubmit(), disabled: vinPending, className: C.vinSubmit, children: L.vinGo })] }), vinError && _jsx("p", { className: C.vinError, children: vinError })] })] })), confirmedVehicle && (_jsx("div", { className: C.confirmation, children: L.confirmation
                    ? L.confirmation(confirmedVehicle, confirmedPartCount)
                    : null })), renderFooter ? renderFooter(ctx) : null] }));
}
//# sourceMappingURL=fitment-selector.js.map