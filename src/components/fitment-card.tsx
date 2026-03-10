"use client";

import { useMemo, useState } from "react";
import { useGarage } from "@/components/garage-provider";
import { vehicleOptions } from "@/lib/fitment";
import { track } from "@/lib/analytics";

export function FitmentCard() {
  const { vehicle, setVehicle } = useGarage();
  const [year, setYear] = useState(vehicle?.year ?? "");
  const [make, setMake] = useState(vehicle?.make ?? "");
  const [model, setModel] = useState(vehicle?.model ?? "");
  const [engine, setEngine] = useState(vehicle?.engine ?? "");

  const modelOptions = useMemo(() => vehicleOptions.modelsByMake[make] ?? [], [make]);
  const engineOptions = useMemo(() => vehicleOptions.enginesByModel[model] ?? [], [model]);

  const saveVehicle = () => {
    if (!year || !make || !model || !engine) return;
    const nextVehicle = { year, make, model, engine };
    setVehicle(nextVehicle);
    track("fitment_confirmed", nextVehicle);
  };

  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
      <h2 className="text-lg font-bold">Find Parts by Vehicle</h2>
      <p className="mt-1 text-sm text-white/70">Fit first. Buy once.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 text-sm"
        >
          <option value="">Year</option>
          {vehicleOptions.years.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={make}
          onChange={(e) => {
            setMake(e.target.value);
            setModel("");
            setEngine("");
          }}
          className="rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 text-sm"
        >
          <option value="">Make</option>
          {vehicleOptions.makes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={model}
          onChange={(e) => {
            setModel(e.target.value);
            setEngine("");
          }}
          className="rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 text-sm"
        >
          <option value="">Model</option>
          {modelOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={engine}
          onChange={(e) => setEngine(e.target.value)}
          className="rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 text-sm"
        >
          <option value="">Engine</option>
          {engineOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <input
        placeholder="Or verify with VIN"
        className="mt-3 w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 text-sm placeholder:text-white/50"
      />
      <button
        onClick={saveVehicle}
        className="mt-4 w-full rounded-lg bg-fatman-accent px-4 py-2.5 text-sm font-semibold transition hover:bg-fatman-accent-hover"
      >
        {vehicle ? "Update Garage" : "Confirm Fitment"}
      </button>
      {vehicle && (
        <p className="mt-3 text-xs text-white/70">
          My Garage: {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.engine}
        </p>
      )}
    </div>
  );
}
