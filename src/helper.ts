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

export function formatFormItems(formItems: { [key: string]: any }): {
  [key: string]: Item;
} {
  return Object.values(formItems).reduce((output, formItem) => {
    const isColumn = formItem.parent?.type === "subform";
    const subformLabel = isColumn
      ? `${formItems[formItem.parent.sn]?.options?.label}.` ?? ""
      : "";
    const item = {
      sn: formItem.sn,
      type: formItem.type,
      column: isColumn,
      parent: formItem.parent?.sn ?? "",
      label: `${subformLabel}${formItem.options.label ?? ""}`,
      options: getOptions(formItem),
    };
    return Object.assign(output, { [formItem.sn]: item });
  }, {});
}
