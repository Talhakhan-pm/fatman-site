"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useGarage } from "@/components/garage-provider";
import { vehicleOptions } from "@/lib/fitment";
import { track } from "@/lib/analytics";

/* ─── Custom dropdown styled to match V2 industrial aesthetic ─── */

interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function Dropdown({ label, value, options, placeholder, disabled, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-3" ref={ref}>
      <span className="w-16 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase shrink-0">
        {label}
      </span>
      <div className="relative flex-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((p) => !p)}
          className={`w-full text-left bg-white/[0.04] border px-4 py-3 text-sm font-medium transition-colors flex items-center justify-between ${
            disabled
              ? "border-white/[0.04] text-white/20 cursor-not-allowed"
              : open
                ? "border-[#ff6a00]/50 text-white"
                : "border-white/[0.08] hover:border-[#ff6a00]/30 text-white cursor-pointer"
          }`}
        >
          <span className={value ? "text-white" : "text-white/30"}>{value || placeholder}</span>
          <span className={`text-xs transition-transform duration-200 ${open ? "rotate-180" : ""} ${disabled ? "text-white/10" : "text-white/20"}`}>
            ▼
          </span>
        </button>

        {open && options.length > 0 && (
          <div className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto bg-[#1a1d24] border border-white/[0.12] shadow-2xl shadow-black/50">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  opt === value
                    ? "bg-[#ff6a00]/20 text-[#ff6a00] font-bold"
                    : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── VIN helpers ─── */

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

function isValidVin(vin: string): boolean {
  return VIN_REGEX.test(vin.trim());
}

/* ─── Main Fitment Module ─── */

export function FitmentModuleV2() {
  const { vehicle, setVehicle } = useGarage();

  const [year, setYear] = useState(vehicle?.year ?? "");
  const [make, setMake] = useState(vehicle?.make ?? "");
  const [model, setModel] = useState(vehicle?.model ?? "");
  const [engine, setEngine] = useState(vehicle?.engine ?? "");

  const [vin, setVin] = useState("");
  const [vinError, setVinError] = useState("");
  const [confirmed, setConfirmed] = useState(!!vehicle);
  const [confirmedLabel, setConfirmedLabel] = useState(
    vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.engine}` : "",
  );

  const makeOptions = vehicleOptions.makes;
  const modelOptions = useMemo(() => vehicleOptions.modelsByMake[make] ?? [], [make]);
  const engineOptions = useMemo(() => vehicleOptions.enginesByModel[model] ?? [], [model]);

  const allSelected = year && make && model && engine;

  /* Part count — just a fun visual heuristic */
  const partCount = useMemo(() => {
    if (!allSelected) return 0;
    const base = 400 + year.charCodeAt(3) * 12 + make.length * 31 + model.length * 17;
    return Math.min(base, 1200);
  }, [allSelected, year, make, model]);

  const handleYearChange = useCallback((v: string) => {
    setYear(v);
    setMake("");
    setModel("");
    setEngine("");
    setConfirmed(false);
  }, []);

  const handleMakeChange = useCallback((v: string) => {
    setMake(v);
    setModel("");
    setEngine("");
    setConfirmed(false);
  }, []);

  const handleModelChange = useCallback((v: string) => {
    setModel(v);
    setEngine("");
    setConfirmed(false);
  }, []);

  const handleEngineChange = useCallback((v: string) => {
    setEngine(v);
    setConfirmed(false);
  }, []);

  const handleSearch = () => {
    if (!allSelected) return;
    const nextVehicle = { year, make, model, engine };
    setVehicle(nextVehicle);
    setConfirmed(true);
    setConfirmedLabel(`${year} ${make} ${model} ${engine}`);
    track("fitment_confirmed", nextVehicle);
  };

  const handleVinGo = () => {
    setVinError("");
    const trimmed = vin.trim();
    if (!trimmed) {
      setVinError("Enter a 17-character VIN");
      return;
    }
    if (!isValidVin(trimmed)) {
      setVinError("Invalid VIN — must be 17 alphanumeric characters (no I, O, Q)");
      return;
    }
    // Simulate VIN decode → pick a vehicle from our data
    const decoded = { year: "2022", make: "Ford", model: "F-150", engine: "3.5L" };
    setYear(decoded.year);
    setMake(decoded.make);
    setModel(decoded.model);
    setEngine(decoded.engine);
    setVehicle(decoded);
    setConfirmed(true);
    setConfirmedLabel(`${decoded.year} ${decoded.make} ${decoded.model} ${decoded.engine}`);
    track("vin_decoded", decoded);
  };

  return (
    <div className="p-6 sm:p-8 space-y-5">
      {/* Module header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#ff6a00]">
          ▶ FITMENT LOOKUP
        </h2>
        <span className="text-[10px] font-mono text-white/30 uppercase">
          VIN Decode Ready
        </span>
      </div>

      {/* Vehicle selectors — progressive */}
      <div className="space-y-3">
        <Dropdown
          label="YEAR"
          value={year}
          options={vehicleOptions.years}
          placeholder="Select year"
          onChange={handleYearChange}
        />
        <Dropdown
          label="MAKE"
          value={make}
          options={makeOptions}
          placeholder="Select make"
          disabled={!year}
          onChange={handleMakeChange}
        />
        <Dropdown
          label="MODEL"
          value={model}
          options={modelOptions}
          placeholder="Select model"
          disabled={!make}
          onChange={handleModelChange}
        />
        <Dropdown
          label="ENGINE"
          value={engine}
          options={engineOptions}
          placeholder="Select engine"
          disabled={!model}
          onChange={handleEngineChange}
        />
      </div>

      {/* Search button */}
      <button
        type="button"
        onClick={handleSearch}
        disabled={!allSelected}
        className={`w-full font-black uppercase tracking-wider text-sm py-4 transition-all duration-200 ${
          allSelected
            ? "bg-[#ff6a00] hover:bg-[#e55d00] text-white hover:shadow-[0_4px_20px_rgba(255,106,0,0.3)] cursor-pointer"
            : "bg-white/[0.06] text-white/25 cursor-not-allowed"
        }`}
      >
        {allSelected
          ? `🔍 SEARCH ${partCount} VERIFIED PARTS`
          : "🔍 SELECT VEHICLE TO SEARCH"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <span className="flex-1 h-px bg-white/[0.08]" />
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">or paste VIN</span>
        <span className="flex-1 h-px bg-white/[0.08]" />
      </div>

      {/* VIN input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={vin}
            onChange={(e) => {
              setVin(e.target.value.toUpperCase());
              setVinError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleVinGo()}
            maxLength={17}
            placeholder="1FTFW1E87MFA00000"
            className="flex-1 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff6a00]/40 px-4 py-3 text-white text-sm font-mono outline-none transition-colors placeholder:text-white/25"
          />
          <button
            type="button"
            onClick={handleVinGo}
            className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-bold px-5 py-3 text-sm transition-colors uppercase tracking-wider cursor-pointer"
          >
            GO
          </button>
        </div>
        {vinError && (
          <p className="text-xs font-mono text-red-400/90">{vinError}</p>
        )}
      </div>

      {/* Result indicator — shown after confirmation */}
      {confirmed && confirmedLabel && (
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400/80 bg-emerald-400/[0.06] border border-emerald-400/10 px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {partCount} parts verified for {confirmedLabel}
        </div>
      )}
    </div>
  );
}
