import {  isNumber, isEmptyValue } from "./utils";
import { NuEvaluationLib } from "./evaluation-lib";
import { Item, opType, argType, widgetType } from "./constants";

// 參數物件格式
type Argument = {
  op: string; // ----------- 運算子或運算元
  type: string; // --------- 參數類型
  value: any; // ----------- 參數攜帶值
  argCount?: number; // ---- 函式參數數量
};

// 單複選 選項物件格式
type SelectOption = {
  label: string;
  value: string;
};

/**
 * 移除 " 字符
 *
 * @param {string} str - 輸入字串
 * @returns {string}
 */
function removeQuotation(str: string): string {
  return String(str).replace(/"/g, "");
}

class FormulaEvaluation {
  // 表單元件
  formItems: { [key: string]: Item };

  constructor() {
    this.formItems = {};
  }
  /**
   * 初始化公式計算工具
   *
   * @param {object} formItems - 所有可用表單元件
   */
  init(formItems: { [key: string]: Item }) {
    this.formItems = formItems ?? {};
  }

  /**
   * 取得公式計算方法
   *
   * @param {Array} postfixStack - postfix 公式佇列
   * @param {string} assignTarget - 公式賦值的元件序號
   * @returns {Function}
   */
  getEvaluation(postfixStack: Argument[], assignTarget?: string) {
    /**
     * 公式計算方法
     *
     * @param {object} scopedData - 當前表單填寫值
     * @param {string} row - 子表列序號 (若該元件是子表內的欄位的話才有)
     */
    return (
      scopedData: { [key: string]: any },
      row?: string
    ): string | number => {
      try {
        // postfix 佇列
        let stack = [...postfixStack] as Argument[];
        // 運算元佇列
        let operandStack = [] as Argument[];
        // 引數佇列
        let argumentStack = [] as any[];
        // 暫存計算結果
        let evaResult = "" as any;

        // 掃描 postfix 表達式
        while (!isEmptyValue(stack)) {
          const currentArg = stack.shift() as Argument;
          // 每當遇到運算元時，將其推入 stack
          if (currentArg.op === opType.operand) {
            operandStack.push(currentArg);
          }
          // 每當遇到運算子
          else if (currentArg.argCount) {
            // 從 postfix 佇列中 pop 出所需數量個運算元，push 進運算子引數佇列
            argumentStack = [];
            for (let i = 0; i < currentArg.argCount; i++) {
              const operand = operandStack.pop();
              if (operand)
                argumentStack.unshift(
                  this.getValue(operand, scopedData, assignTarget, row)
                );
            }
            // 將這些運算元與運算子進行運算
            evaResult =
              NuEvaluationLib[currentArg.value as keyof typeof NuEvaluationLib](
                argumentStack
              );
            // 將結果再次推回 postfix 佇列
            operandStack.push({
              op: opType.operand,
              type: isNumber(evaResult) ? argType.number : "",
              value: evaResult,
            });
          }
        }

        // 輸出計算結果
        return operandStack.pop()?.value ?? "";
      } catch (error) {
        // 計算錯誤
        console.warn("[Formula]: calculation failed.", error)
        return "";
      }
    };
  }

  /**
   * 取得參數值
   *
   * @internal
   * @param {object} arg - 參數物件
   * @param {object} formData - 當前表單填寫值
   * @param {string} assignTarget - 公式賦值的元件序號
   * @returns {any} - 運算元的值 (operand)
   */
  private getValue(
    arg: Argument,
    formData: { [key: string]: any },
    assignTarget?: string,
    row?: string
  ) {
    switch (arg?.type) {
      // 常數字串
      case argType.constant:
        return removeQuotation(arg.value);
      // 數字
      case argType.number:
        return Number(arg.value)
      // 表單元件
      case argType.item:
        return this.getItemValue(arg, formData, assignTarget, row);
      default:
        return arg?.value;
    }
  }

  /**
   * 取得元件填寫值
   *
   * @internal
   * @param {object} arg - 參數物件
   * @param {object} formData - 當前表單填寫值
   * @param {string} assignTarget - 公式賦值的元件序號
   * @returns {any} - 運算元的值 (operand)
   */
  getItemValue(
    arg: Argument,
    formData: { [key: string]: any },
    assignTarget?: string,
    rowId?: string
  ) {
    const formItem = this.formItems[arg.value] as Item;
    const targetIsColumn = !assignTarget
      ? false
      : (this.formItems[assignTarget] as Item)?.column;

    if (!formItem) throw new Error("Form Item Not Found.");

    switch (true) {
      // = 合計欄位
      case formItem.sn.endsWith("-sum"): {
        const subformData = formData[formItem.parent] ?? [];
        const columnSn = formItem.sn.replace(/\-sum$/, "");
        return subformData.reduce(
          (sum: number, row: { [key: string]: any }) => {
            if (isNumber(row[columnSn])) return sum + row[columnSn];
            return sum;
          },
          0
        );
      }

      // 普通元件 = 普通元件
      case !targetIsColumn && !formItem.column:
      // 子表元件 = 普通元件
      case targetIsColumn && !formItem.column: {
        return this.getFormattedValue(
          formItem?.type,
          arg.value,
          formData[arg.value]
        );
      }

      // 普通元件 = 子表元件
      case !targetIsColumn && formItem.column: {
        const subformData = formData[formItem.parent] ?? [];
        return subformData.reduce(
          (column: any[], row: { [key: string]: any }) => {
            column.push(
              this.getFormattedValue(
                formItem?.type,
                arg.value,
                row[formItem.sn]
              )
            );
            return column;
          },
          [] as any[]
        );
      }
      // 子表元件 = 子表元件
      case targetIsColumn && formItem.column: {
        const subformData = formData[formItem.parent] ?? [];
        const row = subformData.find(
          (rowData: { [key: string]: any }) => rowData["rowId"] === rowId
        );
        return !row
          ? // A 子表元件 = B 子表元件，將 B 子表件視為陣列
            subformData.reduce((column: any[], row: { [key: string]: any }) => {
              column.push(
                this.getFormattedValue(
                  formItem?.type,
                  arg.value,
                  row[formItem.sn]
                )
              );
              return column;
            }, [] as any[])
          : // A 子表元件 = A 子表元件，將 A 子表件視為單值
            this.getFormattedValue(formItem?.type, arg.value, row[formItem.sn]);
      }
      // TODO: 考慮其他元件
      default:
        return arg.value;
    }
  }

  /**
   * 取得個別元件格式化後的填寫值
   *
   * @internal
   * @param {string} type - 元件類型
   * @param {string} itemSn - 元件序號
   * @param {any} data - 元件填寫值
   * @returns {any} 元件計算格式
   */
  getFormattedValue(type: string, itemSn: string, data: any) {
    switch (type) {
      // 單行文字元件
      case widgetType.input:
      // 多行文字元件
      case widgetType.textarea:
        return removeQuotation(data);
      // 數字元件
      case widgetType.number:
        return Number(data);
      // 單選
      case widgetType.radio:
        return this.findStringOptionLabel(itemSn, data);
      // 複選
      case widgetType.checkbox:
        return this.findArrayOptionLabel(itemSn, data);
      // 下拉單選
      case widgetType.select:
        return this.findStringOptionLabel(itemSn, data);
      // 下拉複選
      case widgetType.selectMultiple:
        return this.findArrayOptionLabel(itemSn, data);
      default:
        return "";
    }
  }

  /**
   * 取得 單選 radio / 下拉單選 select 標籤字串
   *
   * @param {string} itemSn - 表單項目
   * @param {string} value - 填寫值
   * @returns {string}
   */
  findStringOptionLabel(itemSn: string, value: string | undefined) {
    const options = this.formItems[itemSn]?.options ?? [];
    if (!options?.length || isEmptyValue(value)) return "";
    return (
      options.find(
        (opt: SelectOption): boolean => opt.value === value
      ) as SelectOption
    ).label;
  }

  /**
   * 取得 單選 radio / 下拉單選 select 標籤字串
   *
   * @param {string} itemSn - 表單項目
   * @param {Array} value - 填寫值
   * @param {string} type - 選項鍵值
   * @returns {string}
   */
  findArrayOptionLabel(itemSn: string, value: string[] | undefined) {
    const options = this.formItems[itemSn]?.options ?? [];
    if (!options?.length || !value?.length) return [];
    return value.map(
      (key) =>
        (
          options.find(
            (opt: SelectOption): boolean => opt.value === key
          ) as SelectOption
        ).label
    );
  }
}

export const nuformulaEvaluation = new FormulaEvaluation();
export * from "./evaluation-lib";
