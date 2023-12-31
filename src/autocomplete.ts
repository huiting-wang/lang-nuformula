import {
  autocompletion,
  Completion,
  CompletionContext,
} from "@codemirror/autocomplete";
import { funcName, widgetType, Item } from "./constants";

/**
 * 偵測自動選字方法
 *
 * @param {Array} options - 可選選項
 * @returns {Function}
 */
function setAutocomplete(options: Completion[]) {
  return (context: CompletionContext) => {
    let word = context.matchBefore(/(\w|[\u4E00-\u9FFF])*/) as {
      from: number;
      to: number;
      text: string;
    };
    if (word.from == word.to && !context.explicit) return null;
    return {
      from: word.from,
      options: options,
    };
  };
}

/**
 * 輸出 自動選字 掛件
 *
 * @param {Object} formItems - 可選表單元件
 * @param {Array} customOptions - 自訂提示選項
 * @returns {Extension}
 */
export function nuformulaAutocomplete(
  formItems: { [key: string]: Item },
  customOptions: Completion[] = []
) {
  // 可用函式
  const funcNameList = Object.keys(funcName).map(
    (func: string): Completion => ({
      label: func,
      type: "method",
      apply: `${func}()`,
    })
  );

  // 表單元件
  const itemList = Object.values(formItems)
    .filter((value: Item) =>
      (Object.values(widgetType) as string[]).includes(value.type)
    )
    .map((value: Item) => ({
      label: value.label,
      type: "variable",
      apply: `{${value.sn}}`,
    })) as Completion[];

  const autocompleteOptions = ([] as Completion[]).concat(
    funcNameList,
    itemList,
    customOptions
  );

  return autocompletion({
    override: [setAutocomplete(autocompleteOptions)],
  });
}
