import { useEffect, useRef, useState } from "react";

export interface FitmentDropdownClassNames {
  root?: string;
  label?: string;
  triggerWrapper?: string;
  trigger?: string;
  triggerEnabled?: string;
  triggerDisabled?: string;
  triggerOpen?: string;
  triggerValue?: string;
  triggerPlaceholder?: string;
  caret?: string;
  caretOpen?: string;
  caretDisabled?: string;
  menu?: string;
  option?: string;
  optionActive?: string;
}

export interface FitmentDropdownProps {
  label: string;
  value: string;
  options: readonly string[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  classNames?: FitmentDropdownClassNames;
}

const DEFAULT_CLASSES: Required<FitmentDropdownClassNames> = {
  root: "fr-dropdown",
  label: "fr-dropdown__label",
  triggerWrapper: "fr-dropdown__trigger-wrapper",
  trigger: "fr-dropdown__trigger",
  triggerEnabled: "fr-dropdown__trigger--enabled",
  triggerDisabled: "fr-dropdown__trigger--disabled",
  triggerOpen: "fr-dropdown__trigger--open",
  triggerValue: "fr-dropdown__value",
  triggerPlaceholder: "fr-dropdown__placeholder",
  caret: "fr-dropdown__caret",
  caretOpen: "fr-dropdown__caret--open",
  caretDisabled: "fr-dropdown__caret--disabled",
  menu: "fr-dropdown__menu",
  option: "fr-dropdown__option",
  optionActive: "fr-dropdown__option--active",
};

const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(" ");

/**
 * Accessible-ish dropdown — keyboard support is intentionally minimal here so
 * the package stays light. Callers can swap it out via `renderField`.
 */
export function FitmentDropdown({
  label,
  value,
  options,
  placeholder,
  disabled,
  onChange,
  classNames,
}: FitmentDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const cls = { ...DEFAULT_CLASSES, ...(classNames ?? {}) };

  const handleSelect = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div className={cls.root} ref={ref}>
      <span className={cls.label}>{label}</span>
      <div className={cls.triggerWrapper}>
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-disabled={disabled || undefined}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          className={cx(
            cls.trigger,
            disabled ? cls.triggerDisabled : cls.triggerEnabled,
            open && !disabled ? cls.triggerOpen : undefined,
          )}
        >
          <span className={value ? cls.triggerValue : cls.triggerPlaceholder}>
            {value || placeholder}
          </span>
          <span
            className={cx(
              cls.caret,
              open ? cls.caretOpen : undefined,
              disabled ? cls.caretDisabled : undefined,
            )}
            aria-hidden="true"
          >
            ▼
          </span>
        </button>

        {open && options.length > 0 && (
          <div className={cls.menu} role="listbox">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={opt === value}
                onClick={() => handleSelect(opt)}
                className={cx(cls.option, opt === value ? cls.optionActive : undefined)}
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
