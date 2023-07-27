// 表單元件物件格式
export type Item = {
  sn: string;
  type: string;
  column: boolean;
  label: string;
  options?: { value: string; label: string }[];
};

/**
 * 運算子或運算元
 * @internal
 */
export enum opType {
  operator = "operator", // ----- 運算子 - 指數學運算的對象，以此進行數學運算
  operand = "operand", // ------- 運算元 - 指結合物件、組成運算式的方式，用來計算結果
}

/**
 * 參數類型
 * @internal
 */
export enum argType {
  constant = "constant", // ----- 常數字串
  number = "number", // --------- 數字
  item = "item", // ------------- 表單元件
  math = "math", // ------------- 數學計算
  function = "function", // ----- 函式
}

// 可用表單項目類型字串
export enum widgetType {
  input = "input", // ----------------------- 單行輸入
  textarea = "textarea", // ----------------- 多行輸入
  number = "number", // --------------------- 數字
  radio = "radio", // ----------------------- 單選
  checkbox = "checkbox", // ----------------- 複選
  select = "select", // --------------------- 下拉單選
  selectMultiple = "select_multiple", // ---- 下拉複選
}

export enum opName {
  /* 數學運算子 */
  add = "add", // ---------------------- 加法 (+)
  subtract = "subtract", // -----------  減法 (-)
  time = "time", // -------------------- 乘法 (*)
  divide = "divide", // ---------------- 除法 (/)
  eq = "eq", // ------------------------ 等於 (=)
  gt = "gt", // ------------------------ 大於 (>)
  lt = "lt", // ------------------------ 小於 (<)
  gte = "gte", // ---------------------- 大於或等於 (>=)
  lte = "lte", // ---------------------- 小於或等於 (<=)
  neq = "neq", // ---------------------- 不等於 (<>)
  /* 函式運算子 */
  equal = "equal", // ------------------ EQUAL
}

// 可用函式
export enum funcName {
  SUM = "sum", // --------------------------- 加總
  AVERAGE = "average", // ------------------- 平均
  IF = "if", // ----------------------------- 條件
  CONCAT = "concat", // --------------------- 連接字串
}

