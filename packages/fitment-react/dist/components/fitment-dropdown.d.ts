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
/**
 * Accessible-ish dropdown — keyboard support is intentionally minimal here so
 * the package stays light. Callers can swap it out via `renderField`.
 */
export declare function FitmentDropdown({ label, value, options, placeholder, disabled, onChange, classNames, }: FitmentDropdownProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=fitment-dropdown.d.ts.map