import { parser } from "./syntax.grammar";
import {
  LRLanguage,
  LanguageSupport,
  HighlightStyle,
} from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";

// 定義語言
export const NuformulaLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        Keyword: t.keyword,
        String: t.string,
        Number: t.number,
        Operator: t.operator,
        VariableName: t.variableName,
        "( )": t.paren,
        Comma: t.separator,
      }),
    ],
  }),
});

// 語言標籤樣式
export const nuformulaHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#B157D0" },
  { tag: t.string, color: "#F7A452" },
  { tag: t.number, color: "#5C9CE5" },
  { tag: t.operator, color: "#404040" },
  { tag: t.variableName, color: "#6E7796" },
]);

// 輸出語言
export function nuformula() {
  return new LanguageSupport(NuformulaLanguage);
}
