import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
const DEFAULT_CLASSES = {
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
const cx = (...parts) => parts.filter(Boolean).join(" ");
/**
 * Accessible-ish dropdown — keyboard support is intentionally minimal here so
 * the package stays light. Callers can swap it out via `renderField`.
 */
export function FitmentDropdown({ label, value, options, placeholder, disabled, onChange, classNames, }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        if (!open)
            return undefined;
        const handle = (e) => {
            if (ref.current && !ref.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, [open]);
    const cls = { ...DEFAULT_CLASSES, ...(classNames ?? {}) };
    const handleSelect = (next) => {
        onChange(next);
        setOpen(false);
    };
    return (_jsxs("div", { className: cls.root, ref: ref, children: [_jsx("span", { className: cls.label, children: label }), _jsxs("div", { className: cls.triggerWrapper, children: [_jsxs("button", { type: "button", disabled: disabled, "aria-haspopup": "listbox", "aria-expanded": open, "aria-disabled": disabled || undefined, onClick: () => !disabled && setOpen((prev) => !prev), className: cx(cls.trigger, disabled ? cls.triggerDisabled : cls.triggerEnabled, open && !disabled ? cls.triggerOpen : undefined), children: [_jsx("span", { className: value ? cls.triggerValue : cls.triggerPlaceholder, children: value || placeholder }), _jsx("span", { className: cx(cls.caret, open ? cls.caretOpen : undefined, disabled ? cls.caretDisabled : undefined), "aria-hidden": "true", children: "\u25BC" })] }), open && options.length > 0 && (_jsx("div", { className: cls.menu, role: "listbox", children: options.map((opt) => (_jsx("button", { type: "button", role: "option", "aria-selected": opt === value, onClick: () => handleSelect(opt), className: cx(cls.option, opt === value ? cls.optionActive : undefined), children: opt }, opt))) }))] })] }));
}
//# sourceMappingURL=fitment-dropdown.js.map