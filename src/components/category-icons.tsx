/**
 * Premium SVG auto-parts icons — technical/schematic style.
 * These replace the toy-ish emoji treatment with real auto-parts identity.
 */

export function EngineIcon({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Engine block */}
      <rect x="25" y="30" width="70" height="55" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
      <rect x="30" y="35" width="25" height="20" rx="2" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <rect x="65" y="35" width="25" height="20" rx="2" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      {/* Cylinders */}
      <line x1="42" y1="35" x2="42" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="78" y1="35" x2="78" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      {/* Head */}
      <rect x="25" y="22" width="70" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      {/* Intake manifold */}
      <path d="M40 22 L40 12 Q40 8 44 8 L76 8 Q80 8 80 12 L80 22" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      {/* Oil pan */}
      <path d="M25 85 L30 95 L90 95 L95 85" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      {/* Timing chain */}
      <circle cx="30" cy="65" r="8" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeDasharray="3 2" />
      <circle cx="30" cy="65" r="3" fill="currentColor" opacity="0.3" />
      {/* Exhaust ports */}
      <line x1="95" y1="40" x2="110" y2="38" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="95" y1="50" x2="110" y2="52" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      {/* Bolts */}
      <circle cx="28" cy="33" r="2" fill="currentColor" opacity="0.25" />
      <circle cx="92" cy="33" r="2" fill="currentColor" opacity="0.25" />
      <circle cx="28" cy="82" r="2" fill="currentColor" opacity="0.25" />
      <circle cx="92" cy="82" r="2" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

export function BrakeIcon({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer rotor */}
      <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="60" cy="60" r="44" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
      {/* Ventilation slots */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 60 + 22 * Math.cos(rad);
        const y1 = 60 + 22 * Math.sin(rad);
        const x2 = 60 + 42 * Math.cos(rad);
        const y2 = 60 + 42 * Math.sin(rad);
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" opacity="0.2" />;
      })}
      {/* Hub */}
      <circle cx="60" cy="60" r="18" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="60" cy="60" r="6" fill="currentColor" opacity="0.3" />
      {/* Lug bolt holes */}
      {[0, 72, 144, 216, 288].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x = 60 + 12 * Math.cos(rad);
        const y = 60 + 12 * Math.sin(rad);
        return <circle key={angle} cx={x} cy={y} r="2.5" stroke="currentColor" strokeWidth="1" opacity="0.4" />;
      })}
      {/* Caliper */}
      <path d="M14 45 Q8 60 14 75 L22 72 Q18 60 22 48 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
      {/* Brake pad lines */}
      <line x1="17" y1="52" x2="20" y2="52" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="17" y1="60" x2="20" y2="60" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="17" y1="68" x2="20" y2="68" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

export function SuspensionIcon({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Shock absorber body */}
      <rect x="50" y="12" width="20" height="40" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      {/* Shaft */}
      <rect x="57" y="4" width="6" height="14" rx="1" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      {/* Top mount */}
      <ellipse cx="60" cy="6" rx="12" ry="4" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      {/* Spring coils */}
      <path d="M42 52 L78 58" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <path d="M42 60 L78 66" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <path d="M42 68 L78 74" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <path d="M42 76 L78 82" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <path d="M42 84 L78 90" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      {/* Side lines for spring */}
      <line x1="42" y1="52" x2="42" y2="84" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="78" y1="58" x2="78" y2="90" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      {/* Bottom mount */}
      <rect x="48" y="92" width="24" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      {/* Mounting bolt */}
      <circle cx="60" cy="96" r="3" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      {/* Bottom eye */}
      <circle cx="60" cy="106" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="60" cy="106" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function ExhaustIcon({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Header pipe */}
      <path d="M10 35 Q20 35 25 45 L30 55" stroke="currentColor" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      <path d="M10 50 Q20 50 25 55 L30 60" stroke="currentColor" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      <path d="M10 65 Q20 65 25 65 L30 65" stroke="currentColor" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      <path d="M10 80 Q20 80 25 75 L30 70" stroke="currentColor" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      {/* Collector */}
      <ellipse cx="35" cy="62" rx="7" ry="14" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      {/* Mid pipe */}
      <line x1="42" y1="62" x2="55" y2="62" stroke="currentColor" strokeWidth="3" opacity="0.5" />
      {/* Catalytic converter */}
      <rect x="55" y="50" width="22" height="24" rx="6" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      <line x1="60" y1="54" x2="60" y2="70" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
      <line x1="65" y1="54" x2="65" y2="70" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
      <line x1="70" y1="54" x2="70" y2="70" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
      {/* Rear pipe */}
      <line x1="77" y1="62" x2="88" y2="62" stroke="currentColor" strokeWidth="3" opacity="0.5" />
      {/* Muffler */}
      <rect x="88" y="48" width="24" height="28" rx="8" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      {/* Muffler internals */}
      <line x1="93" y1="52" x2="93" y2="72" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <line x1="100" y1="52" x2="100" y2="72" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <line x1="107" y1="52" x2="107" y2="72" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      {/* Tip */}
      <ellipse cx="115" cy="62" rx="4" ry="7" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      {/* Smoke whisps */}
      <path d="M115 48 Q118 42 116 36" stroke="currentColor" strokeWidth="0.75" opacity="0.2" strokeLinecap="round" />
      <path d="M118 50 Q122 44 119 38" stroke="currentColor" strokeWidth="0.75" opacity="0.15" strokeLinecap="round" />
    </svg>
  );
}

export function ElectricalIcon({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Alternator body */}
      <circle cx="60" cy="55" r="32" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="60" cy="55" r="26" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
      {/* Stator windings */}
      <circle cx="60" cy="55" r="20" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeDasharray="4 3" />
      {/* Rotor */}
      <circle cx="60" cy="55" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="60" cy="55" r="4" fill="currentColor" opacity="0.3" />
      {/* Pole pieces */}
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 60 + 5 * Math.cos(rad);
        const y1 = 55 + 5 * Math.sin(rad);
        const x2 = 60 + 11 * Math.cos(rad);
        const y2 = 55 + 11 * Math.sin(rad);
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2" opacity="0.3" />;
      })}
      {/* Pulley */}
      <circle cx="60" cy="55" r="38" stroke="currentColor" strokeWidth="1" opacity="0.2" strokeDasharray="6 4" />
      {/* Belt groove */}
      <circle cx="60" cy="55" r="42" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      {/* Mounting bracket */}
      <path d="M28 75 L20 90 L36 90 Z" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <circle cx="28" cy="82" r="3" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      {/* Electrical connector */}
      <rect x="85" y="38" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="89" y1="38" x2="89" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="93" y1="38" x2="93" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      {/* Lightning bolt accent */}
      <path d="M58 95 L55 105 L62 102 L59 112" stroke="currentColor" strokeWidth="2" opacity="0.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TransmissionIcon({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Housing */}
      <path d="M20 30 L80 25 Q90 25 95 35 L100 55 Q100 65 95 70 L85 90 Q80 95 70 95 L30 98 Q20 98 18 88 L15 45 Q15 32 20 30Z" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      {/* Input shaft */}
      <line x1="5" y1="55" x2="20" y2="55" stroke="currentColor" strokeWidth="3" opacity="0.5" />
      <circle cx="5" cy="55" r="4" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      {/* Gear 1 */}
      <circle cx="40" cy="45" r="14" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeDasharray="4 2.5" />
      <circle cx="40" cy="45" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="40" cy="45" r="3" fill="currentColor" opacity="0.2" />
      {/* Gear 2 */}
      <circle cx="70" cy="50" r="10" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeDasharray="3 2" />
      <circle cx="70" cy="50" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="70" cy="50" r="2.5" fill="currentColor" opacity="0.2" />
      {/* Gear 3 */}
      <circle cx="50" cy="72" r="12" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeDasharray="3.5 2.2" />
      <circle cx="50" cy="72" r="7" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="50" cy="72" r="2.5" fill="currentColor" opacity="0.2" />
      {/* Output shaft */}
      <line x1="95" y1="52" x2="115" y2="52" stroke="currentColor" strokeWidth="3" opacity="0.5" />
      {/* Shift linkage */}
      <line x1="55" y1="25" x2="55" y2="10" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <circle cx="55" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      {/* Mounting bolts */}
      <circle cx="25" cy="33" r="2" fill="currentColor" opacity="0.2" />
      <circle cx="85" cy="30" r="2" fill="currentColor" opacity="0.2" />
      <circle cx="25" cy="92" r="2" fill="currentColor" opacity="0.2" />
      <circle cx="80" cy="90" r="2" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

/** Map category slugs to their icon components */
export const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  engine: EngineIcon,
  brakes: BrakeIcon,
  suspension: SuspensionIcon,
  exhaust: ExhaustIcon,
  electrical: ElectricalIcon,
  transmission: TransmissionIcon,
};
