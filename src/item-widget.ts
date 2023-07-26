import { Range } from "@codemirror/state";
import {
  WidgetType,
  Decoration,
  ViewPlugin,
  EditorView,
  ViewUpdate,
  DecorationSet,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { Item } from "./constants";

function getUnknownWidget(): Item {
  return {
    sn: "unknown-item",
    type: "unknown",
    options: { label: "未知的元件" },
  };
}

/**
 * 輸出 表單元件 decoration 插件
 *
 * @param {object} formItems - 所有表單元件
 * @returns {ViewPlugin}
 */
export function nuformulaItemWidget(formItems: { [key: string]: Item }) {
  // 表單項目單元
  class ItemWidget extends WidgetType {
    text: string;
    isError: boolean;

    constructor(item: Item, isError: boolean) {
      super();
      this.text = item.options?.label;
      this.isError = isError;
    }
    toDOM() {
      let wrap = document.createElement("span");
      wrap.style.cssText = `
          border-radius: 4px;
          color: ${this.isError ? "#fff1f1" : "#6e7796"};
          padding: 2px 4px;
          background-color: ${this.isError ? "#ff8585" : "#e9ebf2"};
        `;
      wrap.innerText = this.text;
      return wrap;
    }
    override ignoreEvent() {
      return false;
    }
  }

  /**
   * 建立元件標籤
   *
   * @param { EditorView } view - EditorView
   * @returns { DecorationSet }
   */
  function itemTag(view: EditorView) {
    let widgets = [] as Range<Decoration>[];
    for (let { from, to } of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from,
        to,
        enter: (node) => {
          if (node.name == "Item") {
            const itemSn = view.state.doc.sliceString(
              node.from + 1,
              node.to - 1
            );
            const item = formItems[itemSn];
            const isUnknownItem = item === undefined;
            let deco = Decoration.replace({
              widget: new ItemWidget(item ?? getUnknownWidget(), isUnknownItem),
              side: 1,
            });
            widgets.push(deco.range(node.from, node.to));
          }
        },
      });
    }
    return Decoration.set(widgets);
  }

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = itemTag(view);
      }
      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged)
          this.decorations = itemTag(update.view);
      }
    },
    {
      decorations: (instance) => instance.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.decorations || Decoration.none;
        }),
    }
  );
}
