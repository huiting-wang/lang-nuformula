import { parser } from "./syntax.grammar";
import {
  LRLanguage,
  LanguageSupport,
  indentNodeProp,
} from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";

// 定義語言
export const NuformulaLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Application: () => 0,
      }),
      styleTags({
        Keyword: t.keyword,
        String: t.string,
        Number: t.number,
        Operator: t.operator,
        Item: t.variableName,
        "( )": t.paren,
        Comma: t.separator,
      }),
    ],
  }),
});

// 輸出語言
export function nuformula() {
  return new LanguageSupport(NuformulaLanguage);
}
export * from "./item-widget";
export * from "./linter";
export * from "./highlight";
export * from "./autocomplete";
export * from "./evaluation";
export * from "./constants";
export * from "./helper";
