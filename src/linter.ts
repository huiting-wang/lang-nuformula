import { linter, Diagnostic } from "@codemirror/lint";
import { isEmptyValue } from "./utils";
import { EditorView } from "@codemirror/view";
import { funcName, widgetType } from "./constants";

// 函式參數紀錄物件格式
type FuncArg = {
  name: string;
  argCount: number;
  pos: number;
};

// 錯誤訊息物件格式
type ErrorMessage = {
  message: number;
  pos: number;
  length?: number;
  text?: string;
};

enum ERROR {
  unmatchedParen, // -------- 括號不對稱
  unmatchedQuote, // -------- 引號不對稱
  invalidItem, // ----------- 不合法的項目元件
  invalidOperator, // ------ 錯誤的標示符
  missingOperator, // ------ 缺少標示符
  invalidFuncName, // ------ 錯誤的函式
  invalidArgCount, // ------ 錯誤的參數數量
  syntaxError, // -------------- 語法錯誤
}

const SYNTAX_empty = `^$`; // ----------------- 空字串
const SYNTAX_comma = `(,)`; // ---------------- 逗號 ,
const SYNTAX_slash = `(\\\\)`; // ------------- 反斜線 \
const SYNTAX_upper_case = `([A-Z])`; // ------- 大寫字母 A-Z
const SYNTAX_digit = `(\\d)`; // -------------- 數字 0-9
const SYNTAX_dot = `(\\.)`; // ---------------- 小數點 .
const SYNTAX_equal = `(\\=)`; // -------------- 等號 =
const SYNTAX_gt = `(\\>)`; // ----------------- 大於 >
const SYNTAX_lt = `(\\<)`; // ----------------- 小於 <
const SYNTAX_plus = `(\\+)`; // --------------- 加號 +
const SYNTAX_minus = `(\\-)`; // -------------- 減號 -
const SYNTAX_time = `(\\*)`; // --------------- 乘號 *
const SYNTAX_divide = `(\\/)`; // ------------- 除號 /
const SYNTAX_quote = `(")`; // ---------------- 引號 "
const SYNTAX_paren_l = `(\\()`; // ------------ 左括號 (
const SYNTAX_paren_r = `(\\))`; // ------------ 右括號 )
const SYNTAX_bracket_l = `(\\{)`; // ---------- 左大括號 {
const SYNTAX_bracket_r = `(\\})`; // ---------- 右大括號 }
const SYNTAX_hex = `[0-9a-fA-F]`; // ---------- 十六進位字符

// 是否為註冊的函式
const SYNTAX_valid_func = `(${Object.keys(funcName).join("|")})`;
// 是否為註冊的表單元件
const SYNTAX_valid_item = `(${Object.values(widgetType).join("|")})`;

// 表單項目序號
const SYNTAX_item = `^(${SYNTAX_valid_item}\\-)?${SYNTAX_hex}{8}\\-${SYNTAX_hex}{4}\\-${SYNTAX_hex}{4}\\-${SYNTAX_hex}{4}\\-${SYNTAX_hex}{12}$`;
// 正負符號
const SYNTAX_sign = `(${SYNTAX_plus}|${SYNTAX_minus})`;
// 數學運算符號
const SYNTAX_arith = `(${SYNTAX_time}|${SYNTAX_divide})`;
// 布林比較符號
const SYNTAX_bool = `(${SYNTAX_equal}|${SYNTAX_gt}|${SYNTAX_lt})`;
// 願算子符號
const SYNTAX_operator = `(${SYNTAX_sign}|${SYNTAX_arith}|${SYNTAX_bool})`;

// 是否為一個參數的合法開頭
const SYNTAX_start_of_arg = `(${SYNTAX_quote}|${SYNTAX_paren_l}|${SYNTAX_bracket_l}|${SYNTAX_digit}|${SYNTAX_upper_case}|${SYNTAX_sign})`;
// 是否為一個參數的合法結尾
const SYNTAX_end_of_arg = `(${SYNTAX_quote}|${SYNTAX_paren_r}|${SYNTAX_bracket_r}|${SYNTAX_digit})`;
// 是否為一個參數的合法前綴
const SYNTAX_lead_to_arg = `(${SYNTAX_empty}|${SYNTAX_comma}|${SYNTAX_paren_l}|${SYNTAX_operator})`;
// 是否為一個參數的合法後綴
const SYNTAX_trail_to_arg = `(${SYNTAX_empty}|${SYNTAX_comma}|${SYNTAX_paren_r}|${SYNTAX_operator})`;
// 是否為一個函式的合法結尾
const SYNTAX_end_of_func = `(${SYNTAX_upper_case}|${SYNTAX_paren_l})`;

/**
 * 判斷字符類型
 *
 * @param {string} syntax - 字符規則
 * @param {string} char - 比對字符
 * @returns {boolean}
 */
const isSyntax = (syntax: string, char: string): boolean => {
  if (isEmptyValue(syntax)) return false;
  const regex = new RegExp(syntax);
  return regex.test(char);
};

/**
 * 檢查是否前後為合法的參數
 *
 * @param {string} prevChar - 前一字符
 * @param {string} nextChar - 後一字符
 * @returns {boolean}
 */
const isValidOperator = (prevChar: string, nextChar: string): boolean => {
  return (
    isSyntax(SYNTAX_end_of_arg, prevChar) &&
    isSyntax(SYNTAX_start_of_arg, nextChar)
  );
};

/**
 * 判斷函式參數數量是否合法
 *
 * @param {FuncArg} - 函式佇列
 * @returns {boolean}
 */
const isValidFuncArg = ({ name, argCount }: FuncArg): boolean => {
  switch (name.toLowerCase()) {
    case funcName.IF:
      return argCount === 3;
    case funcName.AVERAGE:
    case funcName.CONCAT:
    case funcName.SUM:
    case "arithmetic":
      return true;
    default:
      return argCount <= 1;
  }
};

/**
 * 拋出錯誤訊息
 * @param {ErrorMessage} errorMessage - 錯誤資訊
 */
const throwError = (errorMessage: ErrorMessage) => {
  const { message, ...info } = errorMessage;
  const error = new Error(String(message));
  throw Object.assign(error, info);
};

class NuLinter {
  text: string; // -------------------- 公式字串
  private length: number; // ---------- 公式字串長度
  private prevChar: string; // -------- 前一字符
  private char: string; // ------------ 當前字符
  private nextChar: string; // -------- 後一字符
  private pStack: number[]; // -------- 括號配對佇列
  private qStack: number[]; // -------- 引號配對佇列
  private iStack: number[]; // -------- 表單項目配對佇列
  private fStack: FuncArg[]; // ------- 函式參數佇列
  private itemSn: string; // ---------- 表單元件項目
  private funcName: string; // -------- 函式名稱

  constructor() {
    // 公式字串長度
    this.length = 0 as number;
    // 公式字串、前一字符、當前字符、後一字符、表單元件項目、函式名稱
    this.text =
      this.prevChar =
      this.char =
      this.nextChar =
      this.itemSn =
      this.funcName =
        "" as string;
    // 括號配對佇列、引號配對佇列、表單項目配對佇列
    this.pStack = [] as number[];
    this.qStack = [] as number[];
    this.iStack = [] as number[];
    // 函式參數佇列
    this.fStack = [] as FuncArg[];
  }
  /**
   * 重置 linter
   *
   * @param {string} text - 公式字串Ｆ
   */
  reset(text = "") {
    // 公式字串
    this.text = text;
    // 公式字串長度
    this.length = text.length;
    // 前一字符、當前字符、表單元件項目、函式名稱
    this.prevChar = this.char = this.itemSn = this.funcName = "" as string;
    // 後一字符
    this.nextChar = text.charAt(0) ?? ("" as string);
    // 括號配對佇列、引號配對佇列、表單項目配對佇列
    this.pStack = [] as number[];
    this.qStack = [] as number[];
    this.iStack = [] as number[];
    // 函式參數佇列
    this.fStack = [] as FuncArg[];
  }

  /**
   * 驗證公式
   *
   * @param {string} text - 公式字串
   * @returns {object} - 錯誤訊息
   */
  verify(text: string) {
    this.reset(text);

    try {
      for (let pos = 0; pos < text.length; pos++) {
        // 更新字符狀態
        this.prevChar = this.char ?? "";
        this.char = this.nextChar ?? "";
        this.nextChar = text.charAt(pos + 1) ?? "";

        switch (true) {
          // 跳過 \ 後的字符
          case isSyntax(SYNTAX_slash, this.prevChar):
            continue;

          // 存在等待配對的引號
          case this.qStack.length > 0:
            this.waitForQuote(pos);
            continue;

          // 遇到尚未配對的引號
          case !this.qStack.length && isSyntax(SYNTAX_quote, this.char):
            this.meetQuote(pos);
            continue;

          // 遇到小數點
          case isSyntax(SYNTAX_dot, this.char):
            if (
              !isSyntax(SYNTAX_digit, this.prevChar) ||
              !isSyntax(SYNTAX_digit, this.nextChar)
            )
              throwError({ message: ERROR.syntaxError, pos: pos });
            continue;

          // 存在等待配對的表單項目
          case this.iStack.length > 0:
            this.waitForItemEnd(pos);
            continue;

          // 遇到尚未配對的表單項目開頭 {
          case !this.iStack.length && isSyntax(SYNTAX_bracket_l, this.char):
            this.meetStartOfItem(pos);
            continue;

          // 沒有可配對的表單項目結尾 }
          case this.iStack.length && isSyntax(SYNTAX_bracket_r, this.char):
            throwError({ message: ERROR.invalidItem, pos: pos });
            continue;

          // 遇到等待配對的括號 )
          case isSyntax(SYNTAX_paren_r, this.char):
            this.meetRightParen(pos);
            continue;

          // 遇到尚未配對的括號 (
          case isSyntax(SYNTAX_paren_l, this.char):
            this.meetLeftParen(pos);
            continue;

          // 遇到大寫字母
          case isSyntax(SYNTAX_upper_case, this.char):
            this.meetUppercase(pos);
            continue;

          // 跳過數字的字符
          case isSyntax(SYNTAX_digit, this.char):
            continue;

          // 遇到數學符號 * | /
          case isSyntax(SYNTAX_arith, this.char):
            this.meetArith(pos);
            continue;

          // 遇到正負號 + | -
          case isSyntax(SYNTAX_sign, this.char):
            this.meetSign(pos);
            continue;

          // 遇到等於符號 =
          case isSyntax(SYNTAX_equal, this.char):
            this.meetEqual(pos);
            continue;

          // 遇到大於符號 >
          case isSyntax(SYNTAX_gt, this.char):
            this.meetGt(pos);
            continue;

          // 遇到小於符號 <
          case isSyntax(SYNTAX_lt, this.char):
            this.meetLt(pos);
            continue;

          // 遇到逗號 ,
          case isSyntax(SYNTAX_comma, this.char):
            this.meetComma(pos);
            continue;

          default:
            throwError({ message: ERROR.syntaxError, pos: pos });
        }
      }

      // 檢查是否剩下尚未配對的表單項目
      this.checkUnmatchedItem();
      // 檢查是否剩下尚未配對的引號
      this.checkUnmatchedQuote();
      // 檢查是否剩下尚未配對的括號
      this.checkUnmatchedParen();
    } catch (error) {
      // 捕獲錯誤
      return this.errorMsg(error as ErrorMessage);
    }

    // 沒有錯誤，視為合法的公式
    return null;
  }

  /**
   * 取得錯誤訊息
   *
   * @internal
   * @param {ErrorMessage} error - 錯誤資訊
   * @returns {object}
   */
  private errorMsg(error: ErrorMessage) {
    const { message, pos, length = 1, text } = error;
    const errorType = Number(message);
    const fromPos = (position: number): number =>
      position <= 0 ? 0 : position;
    const toPos = (position: number): number =>
      position >= this.length ? this.length : position;

    switch (errorType) {
      // 括號不對稱
      case ERROR.unmatchedParen:
        return {
          from: fromPos(pos),
          to: toPos(pos + 1),
          severity: "error",
          message: `語法錯誤，括號不對稱: ${ERROR[errorType]}`,
        };
      // 引號不對稱
      case ERROR.unmatchedQuote:
        return {
          from: fromPos(pos),
          to: toPos(pos + 1),
          severity: "error",
          message: `語法錯誤，引號不對稱: ${ERROR[errorType]}`,
        };
      // 不合法的項目元件
      case ERROR.invalidItem:
        return {
          from: fromPos(pos),
          to: toPos(pos + length),
          severity: "error",
          message: `語法錯誤，不合法的項目元件: ${ERROR[errorType]}`,
        };
      // 缺少標示符
      case ERROR.missingOperator:
        return {
          from: fromPos(pos + 1),
          to: toPos(pos + 1),
          severity: "error",
          message: `語法錯誤，缺少標示符: ${ERROR[errorType]}`,
        };
      // 錯誤的標示符
      case ERROR.invalidOperator:
        return {
          from: fromPos(pos),
          to: toPos(pos + length),
          severity: "error",
          message: `語法錯誤，錯誤的標示符: ${ERROR[errorType]}`,
        };
      // 錯誤的函式
      case ERROR.invalidFuncName:
        return {
          from: fromPos(pos),
          to: toPos(pos + length),
          severity: "error",
          message: `語法錯誤，錯誤的函式: ${ERROR[errorType]}`,
        };
      // 錯誤的參數數量
      case ERROR.invalidArgCount:
        return {
          from: fromPos(pos),
          to: toPos(pos + length),
          severity: "error",
          message: `語法錯誤，${text ?? "公式"} 錯誤的參數數量: ${
            ERROR[errorType]
          }`,
        };
      // 語法錯誤
      case ERROR.syntaxError:
        return {
          from: fromPos(pos),
          to: toPos(pos + length),
          severity: "error",
          message: `語法錯誤，無法識別的字符: ${ERROR[errorType]}`,
        };
      default:
        return {
          from: 0,
          to: this.length,
          severity: "error",
          message: `語法錯誤`,
        };
    }
  }

  //#region 字符的驗證規則

  /**
   * 存在等待配對的引號
   *
   * @internal
   * @param {number} pos - 字符位置
   */
  private waitForQuote(pos: number) {
    // 遇到配對的引號 "
    if (isSyntax(SYNTAX_quote, this.char)) {
      // 消除配對的引號
      this.qStack.pop();
      // 檢查下一個字符是否為一個參數的合法後綴
      if (!isSyntax(SYNTAX_trail_to_arg, this.nextChar))
        throwError({ message: ERROR.missingOperator, pos });
    }
  }
  /**
   * 遇到尚未配對的引號
   *
   * @internal
   * @param {number} pos - 字符位置
   */
  private meetQuote(pos: number) {
    // 檢查上一個字符是否為一個參數的合法前綴
    if (!isSyntax(SYNTAX_lead_to_arg, this.prevChar))
      throwError({ message: ERROR.missingOperator, pos: pos - 1 });
    // 紀錄引號位置
    this.qStack.push(pos);
  }

  /**
   * 遇到可配對的表單項目結尾 }
   *
   * @internal
   * @param {number} pos - 字符位置
   */
  private meetEndOfItem(pos: number) {
    // 項目序號格式不符
    if (!isSyntax(SYNTAX_item, this.itemSn)) {
      throwError({
        message: ERROR.invalidItem,
        pos: pos - this.itemSn.length - 1,
        length: this.itemSn.length + 1,
      });
    }
    // 檢查下一個字符是否為一個參數的合法後綴
    if (!isSyntax(SYNTAX_trail_to_arg, this.nextChar))
      throwError({ message: ERROR.missingOperator, pos });

    // 消除配對的表單項目字符
    this.iStack.pop();
    // 清空紀錄表單序號
    this.itemSn = "";
  }

  /**
   * 遇到表單項目開頭 {
   *
   * @internal
   * @param {number} pos - 字符位置
   */
  private meetStartOfItem(pos: number) {
    // 檢查上一個字符是否為一個參數的合法前綴
    if (this.itemSn.length > 0 || !isSyntax(SYNTAX_lead_to_arg, this.prevChar))
      throwError({ message: ERROR.missingOperator, pos: pos - 1 });
    this.iStack.push(pos);
  }

  /**
   * 存在等待配對的表單項目
   *
   * @internal
   * @param {number} pos - 字符位置
   */
  private waitForItemEnd(pos: number) {
    // 遇到可配對的表單項目結尾 }
    if (isSyntax(SYNTAX_bracket_r, this.char)) {
      this.meetEndOfItem(pos);
      return;
    }
    // 繼續紀錄表單序號
    this.itemSn += this.char;
  }

  /**
   * 遇到等待配對的括號 )
   *
   * @internal
   * @param {number} pos - 字符位置
   */
  private meetRightParen(pos: number) {
    // 檢查下一個字符是否為一個參數的合法後綴
    if (!isSyntax(SYNTAX_trail_to_arg, this.nextChar))
      throwError({ message: ERROR.missingOperator, pos });
    if (!this.pStack.length) throwError({ message: ERROR.unmatchedParen, pos });
    else this.pStack.pop();
    const funcArg = this.fStack.pop() as FuncArg;
    if (
      !isValidFuncArg(
        Object.assign(funcArg, { argCount: funcArg.argCount + 1 })
      )
    )
      throwError({
        message: ERROR.invalidArgCount,
        pos: funcArg.pos - funcArg.name.length,
        length: pos - funcArg.pos + 3,
        text: funcArg.name,
      });
  }

  /**
   * 遇到尚未配對的括號 (
   *
   * @internal
   * @param {number} pos - 字符位置
   */
  private meetLeftParen(pos: number) {
    // 檢查上一個字符是否為函式字符，或是一個參數的合法前綴
    if (
      !isSyntax(SYNTAX_upper_case, this.prevChar) &&
      !isSyntax(SYNTAX_lead_to_arg, this.prevChar)
    )
      throwError({ message: ERROR.missingOperator, pos: pos - 1 });

    // 檢查是否為宣告函式
    if (isSyntax(SYNTAX_upper_case, this.prevChar) && this.funcName.length) {
      // 是否為註冊的函式
      if (!isSyntax(SYNTAX_valid_func, this.funcName))
        throwError({
          message: ERROR.invalidFuncName,
          pos: pos - this.funcName.length,
          length: this.funcName.length,
        });
    }
    this.fStack.push({
      name: isEmptyValue(this.funcName) ? "arithmetic" : this.funcName,
      argCount: 0,
      pos: pos,
    });
    this.funcName = "";
    this.pStack.push(pos);
  }

  /**
   * 遇到大寫字母
   *
   * @internal
   * @param {number} pos - 字符位置
   */
  private meetUppercase(pos: number) {
    // 下一字符是否為一個函式的合法結尾
    if (!isSyntax(SYNTAX_end_of_func, this.nextChar))
      throwError({ message: ERROR.invalidFuncName, pos: pos + 1 });
    this.funcName += this.char;
  }

  /**
   * 遇到數學符號 * | /
   *
   * @internal
   * @param {number} pos - 字符位置
   */
  private meetArith(pos: number) {
    if (!isValidOperator(this.prevChar, this.nextChar))
      throwError({ message: ERROR.invalidOperator, pos: pos });
  }

  /**
   * 遇到正負號 + | -
   *
   * @internal
   * @param {number} pos - 字符位置
   */
  private meetSign(pos: number) {
    // 後面跟著數字，表示數字的正負號，為合法表達
    if (isSyntax(SYNTAX_digit, this.nextChar)) return;
    // 檢查是否前後為合法的參數
    if (!isValidOperator(this.prevChar, this.nextChar))
      throwError({ message: ERROR.invalidOperator, pos: pos });
  }

  /**
   * 遇到等於符號 =
   *
   * @internal
   * @param {number} pos - 字符位置
   */
  private meetEqual(pos: number) {
    // 符合 >= 或 <=
    if (
      isSyntax(SYNTAX_gt, this.prevChar) ||
      isSyntax(SYNTAX_lt, this.prevChar)
    ) {
      // 檢查後一字符是否為一個參數的合法開頭
      if (!isSyntax(SYNTAX_start_of_arg, this.nextChar))
        throwError({ message: ERROR.invalidOperator, pos: pos - 1, length: 2 });
      return;
    }
    // 檢查是否前後為合法的參數
    if (!isValidOperator(this.prevChar, this.nextChar))
      throwError({ message: ERROR.invalidOperator, pos: pos });
  }

  /**
   * 遇到大於符號 >
   *
   * @internal
   * @param {number} pos - 字符位置
   */
  private meetGt(pos: number) {
    // 符合 <>
    if (isSyntax(SYNTAX_lt, this.prevChar)) {
      // 檢查後一字符是否為一個參數的合法開頭
      if (!isSyntax(SYNTAX_start_of_arg, this.nextChar))
        throwError({ message: ERROR.invalidOperator, pos: pos - 1, length: 2 });
      return;
    }
    // 符合 >=
    if (isSyntax(SYNTAX_equal, this.nextChar)) {
      // 檢查前一字符是否為合法的參數結束
      if (!isSyntax(SYNTAX_end_of_arg, this.prevChar))
        throwError({ message: ERROR.invalidOperator, pos: pos - 1, length: 2 });
      return;
    }
    // 檢查是否前後為合法的參數
    if (!isValidOperator(this.prevChar, this.nextChar))
      throwError({ message: ERROR.invalidOperator, pos: pos });
  }

  /**
   * 遇到小於符號 <
   *
   * @internal
   * @param {number} pos - 字符位置
   */
  private meetLt(pos: number) {
    // 符合 <= 或 <>
    if (
      isSyntax(SYNTAX_equal, this.nextChar) ||
      isSyntax(SYNTAX_gt, this.nextChar)
    ) {
      // 檢查前一字符是否為合法的參數結束
      if (!isSyntax(SYNTAX_end_of_arg, this.prevChar))
        throwError({ message: ERROR.invalidOperator, pos: pos - 1, length: 2 });
      return;
    }
    // 檢查是否前後為合法的參數
    if (!isValidOperator(this.prevChar, this.nextChar))
      throwError({ message: ERROR.invalidOperator, pos: pos });
  }

  /**
   * 遇到逗號 ,
   *
   * @internal
   * @param {number} pos - 字符位置
   */
  private meetComma(pos: number) {
    // 檢查是否前後為合法的參數
    if (!isValidOperator(this.prevChar, this.nextChar))
      throwError({ message: ERROR.invalidOperator, pos: pos });

    const funcArg = this.fStack.pop() as FuncArg | undefined;

    if (funcArg === undefined || Object.keys(funcArg).length === 0)
      throwError({
        message: ERROR.invalidArgCount,
        pos: 0,
        length: this.length,
      });
    else {
      this.fStack.push(
        Object.assign(funcArg, { argCount: funcArg.argCount + 1 })
      );
    }
  }

  /**
   * 檢查是否剩下尚未配對的表單項目
   *
   * @internal
   */
  private checkUnmatchedItem() {
    const unmatchedItem = this.iStack.pop() ?? -1;
    if (unmatchedItem > -1)
      throwError({ message: ERROR.invalidItem, pos: unmatchedItem });
  }

  /**
   * 檢查是否剩下尚未配對的引號
   *
   * @internal
   */
  private checkUnmatchedQuote() {
    const unmatchedQuote = this.qStack.pop() ?? -1;
    if (unmatchedQuote > -1)
      throwError({ message: ERROR.unmatchedQuote, pos: unmatchedQuote });
  }

  /**
   * 檢查是否剩下尚未配對的括號
   *
   * @internal
   */
  private checkUnmatchedParen() {
    const unmatchedParen = this.pStack.pop() ?? -1;
    if (unmatchedParen > -1)
      throwError({ message: ERROR.unmatchedParen, pos: unmatchedParen });
  }
  //#endregion
}

export const nuLint = new NuLinter();

export const nuformulaLinter = (callback: (error: Diagnostic) => void) => {
  return linter((view: EditorView) => {
    const { state } = view;
    const error = nuLint.verify(state.doc.toString()) as Diagnostic;
    callback(error);
    if (error?.severity) return [error];
    return [];
  });
};
