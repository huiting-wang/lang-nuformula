// 系統預設最大值
const MAX_INTEGER = "99999999999";

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

/**
 * 判斷是否超過輸入限制 (整數 11 位數、小數點4位)
 *
 * @param {string} string - 數字字串
 * @returns {boolean}
 */
function isMaximumNumber(string: string): boolean {
  return /^9{11}(\.9{1,4})?$/.test(string);
}
/**
 * 取得相對應小數點的數入最大值
 *
 * @param {number} fractionLength - 小數點位數
 * @returns {string}
 */
function getMaximumNumber(fractionLength = 0) {
  return [MAX_INTEGER, MAX_INTEGER.slice(0, fractionLength)].join(".");
}

/**
 * 擷取可接受的最大值
 *
 * @param {number | string} number - 當前數字
 * @param {number} precision - 小數點精確位數
 * @returns {number}
 */
export function truncateMaxNumber(
  number: number,
  precision: number = 4
): number {
  let formatValue = String(number);

  // 分離數字的正負號
  let sign = /^\-\d+/.test(formatValue) ? -1 : 1;
  if (sign < 0) formatValue = formatValue.replace(/^\-/, "");

  // 若數字元件進入科學記號，強制更新為最大值
  if (/^\d(\.\d+)?\e\+\d+$/.test(formatValue)) {
    formatValue = getMaximumNumber(precision);
  }

  let parts = formatValue.toString().split(".");

  // 若小數部分超過 4 位，並且尚未超過數入限制，強制四捨五入至小數點第四位
  let fractionLength = parts[1]?.length ?? 0;
  if (fractionLength > 4 && !isMaximumNumber(formatValue)) {
    formatValue = String(
      Math.round(Math.round(Number(formatValue) * Math.pow(10, 4 + 1)) / 10) /
        Math.pow(10, 4)
    );
  }

  // 若小數部分超過 4 位，但是已經超過數入限制，強制更新為最大值
  if (fractionLength > 4 && isMaximumNumber(formatValue)) {
    formatValue = getMaximumNumber(precision);
  }

  // 若整數部分超過 11 位，強制更新為最大值
  let integerLength = parts[0]?.length ?? 0;
  if (integerLength > 11) {
    formatValue = getMaximumNumber(precision);
  }

  return Number(formatValue) * sign;
}
