import { isEmptyValue, isNumber, isArray } from "./utils";
import { opName, funcName } from "./constants";

/**
 * ==================================
 * 參考 Microsoft Excel 規格
 *
 * @see https://support.microsoft.com/zh-tw/office/78be92ad-563c-4d62-b081-ae6da5c2ca69
 * @see https://support.microsoft.com/zh-tw/office/5f91f4e9-7b42-46d2-9bd1-63f26a86c0eb
 * ==================================
 */

export const NuEvalutionLib = {
  //#region 算術運算子
  // 計算原則：先計算再 round up
  /**
   * 加法 (+)
   *
   * @param {Array} args - 參數
   * @returns {number} 兩數相加的結果
   * @description
   *  - 範例: =3+3
   *  - 接受參數數量: 2
   */
  [opName.add]: (args: any[]): number => {
    return args[0] + args[1];
  },
  /**
   * 減法 (-)
   *
   * @param {Array} args - 參數
   * @returns {number} 兩數相減的結果
   * @description
   *  - 範例: =3-3
   *  - 接受參數數量: 2
   */
  [opName.subtract]: (args: any[]): number => {
    return Number(args[0]) - Number(args[1]);
  },
  /**
   * 乘法 (*)
   *
   * @param {Array} args - 參數
   * @returns {number} 兩數相乘的結果
   * @description
   *  - 範例: =3*3
   *  - 接受參數數量: 2
   */
  [opName.time]: (args: any[]): number => {
    return Number(args[0]) * Number(args[1]);
  },
  /**
   * 除法 (/)
   *
   * @param {Array} args - 參數
   * @returns {number} 兩數相除的結果
   * @description
   *  - 範例: =3/3
   *  - 接受參數數量: 2
   */
  [opName.divide]: (args: any[]): number => {
    if (isEmptyValue(args[1]) || !isNumber(args[1]) || args[1] === 0)
      return NaN;
    return Number(args[0]) / Number(args[1]);
  },
  //#endregion

  //#region 比較運算子
  /**
   * 等於 (=)
   *
   * @param {Array} args - 參數
   * @returns {boolean} 兩數是否相等
   * @description
   *  - 範例: = A1 = B1
   *  - 接受參數數量: 2
   */
  [opName.eq]: (args: any[]): boolean => {
    return args[0] === args[1];
  },
  /**
   * 大於 (>)
   *
   * @param {Array} args - 參數
   * @returns {boolean} arg[0] 是否大於 arg[1]
   * @description
   *  - 範例: = A1>B1
   *  - 接受參數數量: 2
   */
  [opName.gt]: (args: any[]): boolean => {
    return args[0] > args[1];
  },
  /**
   * 小於 (<)
   *
   * @param {Array} args - 參數
   * @returns {boolean} arg[0] 是否小於 arg[1]
   * @description
   *  - 範例: = A1<B1
   *  - 接受參數數量: 2
   */
  [opName.lt]: (args: any[]): boolean => {
    return args[0] < args[1];
  },
  /**
   * 大於或等於 (>=)
   *
   * @param {Array} args - 參數
   * @returns {boolean} arg[0] 是否大於等於 arg[1]
   * @description
   *  - 範例: = A1>=B1
   *  - 接受參數數量: 2
   */
  [opName.gte]: (args: any[]): boolean => {
    return args[0] >= args[1];
  },
  /**
   * 小於或等於 (<=)
   *
   * @param {Array} args - 參數
   * @returns {boolean} arg[0] 是否小於等於 arg[1]
   * @description
   *  - 範例: = A<=B1
   *  - 接受參數數量: 2
   */
  [opName.lte]: (args: any[]): boolean => {
    return args[0] <= args[1];
  },
  /**
   * 不等於 (<>)
   *
   * @param {Array} args - 參數
   * @returns {boolean} 兩數是否不相等
   * @description
   *  - 範例: = A1<>B1
   *  - 接受參數數量: 2
   */
  [opName.neq]: (args: any[]): boolean => {
    return args[0] !== args[1];
  },
  //#endregion

  /* 公式運算 - 常用函式 */
  /**
   * =，等於arg[0]，為公式最底層的函式
   *
   * @param {Array} args - 參數
   * @returns {any} 返回計算結果
   * @description
   *  - 範例: =100
   *  - 接受參數數量: 1
   */
  [opName.equal]: (args: any[]): any => {
    return isArray(args[0]) ? args[0].join(","): args[0];
  },
  /**
   * SUM，使用此函數來加總儲存格中的值
   *
   * @param {Array} args - 參數
   * @returns {any} 返回計算結果
   * @description
   *  - 範例: =SUM(number1, [number2], ...)
   *  - 接受參數數量: n
   * @see https://support.microsoft.com/zh-tw/office/043e1c7d-7726-4e80-8f32-07b23e057f89
   */
  [funcName.SUM]: (args: any[]): number => {
    return args.reduce((sum: number, arg: any) => sum + (arg as number), 0);
  },
  /**
   * IF，使用此函數以在條件符合時傳回一個值，並在條件不符合時傳回另一個值。
   *
   * @param {Array} args - 參數
   * @returns {any} 返回計算結果
   * @description
   *  - 範例: =IF(arg[0],arg[1],arg[2])
   *    若 arg[0] 為 true，返回 arg[1]，否則返回 arg[2]
   *  - 接受參數數量: 3
   * @see https://support.microsoft.com/zh-tw/office/69aed7c9-4e8a-4755-a9bc-aa8bbff73be2
   */
  [funcName.IF]: (args: any[]): any => {
    return args[0] ? args[1] : args[2];
  },
  /**
   * CONCAT，合並多個範圍和/或字串中的文字
   *
   * @param {Array} args - 參數
   * @returns {any} 返回計算結果
   * @description
   *  - 範例: =CONCAT(text1, [text2],…)
   *  - 接受參數數量: n
   * @see https://support.microsoft.com/zh-tw/office/9b1a9a3f-94ff-41af-9736-694cbd6b4ca2
   */
  [funcName.CONCAT]: (args: any[]): string => {
    return args
      .map((arg) => (isArray(arg) ? arg.join(",") : arg))
      .join("");
  },
  /**
   * AVERAGE，傳回引數的平均值
   *
   * @param {Array} args - 參數
   * @returns {any} 返回計算結果
   * @description
   *  - 範例: =AVERAGE(number1, [number2], ...)
   *  - 接受參數數量: n
   * @see https://support.microsoft.com/zh-tw/office/047bac88-d466-426c-a32b-8f33eb960cf6
   */
  [funcName.AVERAGE]: (args: any[]): number => {
    return (
      args.reduce((sum: number, arg: any) => sum + (arg as number), 0) /
      args.length
    );
  },
};
