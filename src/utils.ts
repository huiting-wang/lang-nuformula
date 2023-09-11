/**
 * 對象是否為數字
 *
 * @param {any} value - 對象
 * @returns  {boolean}
 */
export function isNumber(value: any): boolean {
  return typeof value === "number" && !Number.isNaN(value);
}

/**
 * 對象是否為陣列
 *
 * @param {any} value - 對象
 * @returns  {boolean}
 */
export function isArray(value: any): boolean {
  return Array.isArray(value);
}

/**
 * 對象是否為空
 * @param {any} value - 對象
 * @returns {boolean}
 */
export function isEmptyValue(value: any): boolean {
  if (isNumber(value)) return false;
  return value === undefined || !value.length;
}
