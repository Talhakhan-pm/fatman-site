/**
 * VIN spec: 17 alphanumeric characters, no I, O, or Q.
 * https://www.iso.org/standard/52200.html
 */
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;
export function isValidVin(vin) {
    return VIN_REGEX.test(vin.trim());
}
export function normalizeVin(vin) {
    return vin.trim().toUpperCase();
}
//# sourceMappingURL=vin.js.map