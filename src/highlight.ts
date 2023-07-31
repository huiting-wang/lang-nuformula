import {
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags, Highlighter } from "@lezer/highlight";

// 語言標籤樣式
export function nuformulaHighlightStyle() {
  return syntaxHighlighting(
    HighlightStyle.define([
      { tag: tags.keyword, color: "#B157D0" },
      { tag: tags.string, color: "#F7A452" },
      { tag: tags.number, color: "#5C9CE5" },
      { tag: tags.operator, color: "#404040" },
      { tag: tags.variableName, color: "#6E7796" },
      { tag: tags.paren, color: "#404040" },
      { tag: tags.separator, color: "#404040" },
    ]) as Highlighter
  );
}
