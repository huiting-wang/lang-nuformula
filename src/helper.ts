import { Item, widgetType } from "./constants";

function getOptions(formItem: any): { value: string; label: string }[] {
  switch (formItem.type) {
    case widgetType.radio:
      return formItem.options.radioOptions;
    case widgetType.checkbox:
      return formItem.options.checkboxOptions;
    case widgetType.select:
      return formItem.options.selectOptions;
    case widgetType.selectMultiple:
      return formItem.options.selectMultipleOptions;
    default:
      return [];
  }
}

export function formatFormItems(
  formItems: { [key: string]: any },
  config?: {
    summaryLabel?: string;
  }
): {
  [key: string]: Item;
} {
  return Object.values(formItems).reduce((output, formItem) => {
    const isColumn = formItem.parent?.type === "subform";
    const subformLabel = isColumn
      ? `${formItems[formItem.parent.sn]?.options?.label?? ""}.` 
      : "";
    const item = {
      sn: formItem.sn,
      type: formItem.type,
      column: isColumn,
      parent: formItem.parent?.sn ?? "",
      label: `${subformLabel}${formItem.options.label ?? ""}`,
      options: getOptions(formItem),
    };

    // 新增子表 - 合計欄位 元件
    (formItem.options?.summary ?? []).forEach(
      (number: { sn: string; type: string; [key: string]: any }) => {
        Object.assign(output, {
          [`${number.sn}-sum`]: {
            sn: `${number.sn}-sum`,
            type: number.type,
            column: false,
            parent: formItem.sn,
            label: `${formItem.options.label}.${
              formItems[number.sn]?.options?.label
            }-${config?.summaryLabel ?? "合計欄位"}`,
          },
        });
      }
    );

    return Object.assign(output, { [formItem.sn]: item });
  }, {});
}
