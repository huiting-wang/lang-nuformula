# 公式編輯 CodeMirror 6 language package template

```
日期：2023-07-21
規劃：Chien Lo
版本號：0.2
```

- 建置： `npm run prepare`
- 測試：`npm test`
- 展示站：[`https://yun-chien-lo.github.io/lang-nuformula/`](https://yun-chien-lo.github.io/lang-nuformula/)

## Structure 資料夾結構拆分
```
src/
├── autocomplete.ts -------------------- 關鍵字輸入 code mirror 外掛
├── constant.ts ------------------------ 常數宣告
├── evaluation-lib.ts ------------------ 定義可用運算子方法
├── evaluation.ts ---------------------- 實踐公式計算類型 
├── highlight.ts ----------------------- 文法高亮 code mirror 外掛
├── index.ts --------------------------- 套件入口檔
├── item-widget.ts --------------------- 替換表單元件 code mirror 外掛
├── linter.ts -------------------------- 文法檢查 code mirror 外掛
├── syntax.grammar --------------------- lexer 文法規範
└── syntax.grammar.d.ts ---------------- 封裝 lexer 文法規範
```
---

## Install 安裝方式
```bash
npm i codemirror-lang-nuformula
```
注：此套件僅為插件，需另外配置 code-mirror

## Example 使用範例

### Vue3 
```html
<script setup lang="ts">
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/language";
import {
  nuformula,
  nuformulaHighlightStyle,
  nuformulaLinter,
  nuformulaItemWidget,
  nuformulaAutocomplete,
  formatFormItems,
} from "codemirror-lang-nuformula";
import { ref, onMounted, reactive, computed } from "vue";

const props = defineProps({
  // 公式綁定數值
  value: { default: "=", type: String },
  // 是否禁用元件
  disabled: { default: false, type: Boolean },
  // 表單元件
  formItems: { default: () => ({}), type: Object }
});

const emit = defineEmits(["change"]);

// 編輯器 DOM
const editor = ref();
// 公式字串
const value = ref(props.value);
// 是否禁用
const disabled = ref(props.disabled);
// 錯誤訊息
const formulaError = ref("");

// 格式化表單元件
const formattedFormItems = formatFormItems(props.formItems);

/**
 * 取得當前公式
 *
 * @returns {string}
 */
function getFormula(): string {
  if (cm.view === undefined) return "=";
  return `=${cm.view.state.doc.toString().replace(/^=./, "")}`;
}

/**
 * 當更新編輯器
 * 
 * @param {object} error - 錯誤訊息
 */
const handleEditorUpdate = (error: { [key: string]: any }): void => {
  formulaError.value = error?.message ?? "";
  emit("change", getFormula());
};

const cm = reactive({
  view: undefined as EditorView | undefined,
});

// 初始 code mirror state
const state = EditorState.create({
  doc: value.value.replace(/^\=/, ""),
  extensions: [
    // 使用基本設配置
    keymap.of(defaultKeymap),
    // 是否禁用
    EditorState.readOnly.of(disabled.value),
    // 括號配對插件
    bracketMatching(),
    // 公式編輯語法
    nuformula(),
    // 配置語法標示
    nuformulaHighlightStyle(),
    // linter 插件
    nuformulaLinter(Object.keys(formattedFormItems), handleEditorUpdate),
    // 表單項目標記插件
    nuformulaItemWidget(formattedFormItems),
    // 自動選字插件
    nuformulaAutocomplete(formattedFormItems),
  ],
});

onMounted(() => {
  // 初始 code mirror view
  cm.view = new EditorView({
    state: state,
    parent: editor.value,
  });
});
</script>
```

### Vue 2
```html
<template>
  <div class="formula-editor">
    <div ref="editor"></div>
    <div>{{ formulaError }}</div>
  </div>
</template>

<script>
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/language";
import {
  funcName,
  nuformula,
  nuformulaHighlightStyle,
  nuformulaLinter,
  nuformulaItemWidget,
  nuformulaAutocomplete,
  formatFormItems,
} from "codemirror-lang-nuformula";
import { isEmptyValue } from "@/utils";

export default {
  name: "FormulaEditor",
  provide() {
    return {
      // 可用表單元件
      formItems: this.formattedFormItems,
      // 可用函式運算子
      functions: Object.keys(funcName),
    };
  },
  props: {
    // 公式綁定數值
    value: { default: "=", type: String },
    // 是否禁用元件
    disabled: { default: false, type: Boolean },
    // 表單元件
    formItems: { default: () => ({}), type: Object }
  },
  data() {
    return {
      // code mirror state
      state: null,
      // code mirror view
      view: null,
      // 錯誤訊息
      formulaError: "",
    };
  },
  computed: {
    // 格式化表單元件
    formattedFormItems() {
      return formatFormItems(this.formItems);
    },
  },
  created() {
    // 初始編輯器
    this.initEditor();
  },
  mounted() {
    // 掛載編輯器
    this.mountEditor();
  },
  methods: {
    /**
     * 初始編輯器
     */
    initEditor() {
      // 初始 code mirror state
      this.state = EditorState.create({
        doc: this.value.replace(/^\=/, ""),
        extensions: [
          // 使用基本設配置
          keymap.of(defaultKeymap),
          // 是否禁用
          EditorState.readOnly.of(this.disabled),
          // 括號配對插件
          bracketMatching(),
          // 公式編輯語法
          nuformula(),
          // 配置語法標示
          nuformulaHighlightStyle(),
          // linter 插件
          nuformulaLinter(
            Object.keys(this.formattedFormItems),
            this.handleEditorUpdate),
          // 表單項目標記插件
          nuformulaItemWidget(this.formattedFormItems),
          // 自動選字插件
          nuformulaAutocomplete(this.formattedFormItems),
        ],
      });
    },
    /**
     * 掛載編輯器
     */
    mountEditor() {
      // 初始 code mirror view
      this.view = new EditorView({
        state: this.state,
        parent: this.$refs.editor,
      });
    },
    /**
     * 當觸發錯誤資訊
     *
     * @param {object} error - 錯誤資訊
     */
    handleEditorUpdate(error) {
      this.formulaError = isEmptyValue(error) ? "" : error.message;
      this.$emit("change", this.getFormula())
    },
    /**
     * 取得當前公式
     *
     * @returns {string}
     */
    getFormula() {
      return `=${this.view.state.doc.toString().replace(/^=./, "")}`;
    },
  },
};
</script>

```

# formatFormItems 表單元件格式化方法
## Input (輸入)
目前表單設計套件的標準格式
## Output (輸出)
符合語言包的簡化版格式
```json
{
  // 表單元件序號
  "sn:`string`": {
    // 表單元件序號
    "sn": "`string`",
    // 表單元件類型
    "type": "`string`",
    // 表單元件是否為子表欄位
    "column": "`boolean`",
    // 表單元件父元件序號
    "parent": "`string`",
    // 表單元件標題
    "label": "`string`",
    // 表單元件可選選項 (適用 單選、複選、下拉單選、下拉複選)
     "options": [
      { 
        // 選項標籤
        "label": "`string`", 
        // 選項值
        "value": "`string`"
      }
    ]
  },
  // 範例一
  "1ee30164-c5e8-6134-a1c4-0242a3ee6533": {
    "sn": "1ee30164-c5e8-6134-a1c4-0242a3ee6533",
    "type": "input",
    "column": true,
    "parent": "1ee30164-c5e7-6fb8-8225-0242a3ee6533",
    "label": "子表.單行文字(子)",
    "options": []
  },
  // 範例二
  "1ee3015f-0c66-6454-bdfa-0242a3ee6533": {
    "sn": "1ee3015f-0c66-6454-bdfa-0242a3ee6533",
    "type": "select_multiple",
    "column": false,
    "parent": "1ee13e24-de80-6db8-ad3c-0242994894d2",
    "label": "下拉複選",
    "options": [
      { "label": "選項一(子)", "value": "value-1" },
      { "label": "選項二(子)", "value": "value-2" }
    ]
  },
}
```


# autocomplete 關鍵字輸入插件
用途：鍵入字符時，以下拉選單的方式展開可使用的關鍵字選單
## 使用方式
```javascript
EditorState.create({
  ...
  extensions: [
    ...
    // 自動選字插件
    nuformulaAutocomplete(formattedFormItems, customOptions),
  ],
});
```
- 參考 codemirror 文件 [連結](https://codemirror.net/docs/ref/#autocomplete.autocompletion)
## Input
### formattedFormItems
- type: `object`
- 可選表單元件(格式化後的表單元件)
```javascript
const formattedFormItems = formatFormItems(formItems)
```

### customOptions
- type: `Array` of [Completion(見 codemirror 文件)](https://codemirror.net/docs/ref/#autocomplete.Completion)
- 自訂提示選項
```javascript
[
  {
    label: `string`,
    type: `string`,
    apply: `string`
  }
]
```

## Output
type: [Extension](https://codemirror.net/docs/ref/#state.Extension)
參考 codemirror autocomplete: [autocompletion(config⁠?: Object = {}) → Extension](https://codemirror.net/docs/ref/#autocomplete.autocompletion)

# highlight 編輯器高亮插件
用途：定義編輯器字符的分類與顏色樣式
## 使用方式
```javascript
EditorState.create({
  ...
  extensions: [
    ...
    // 配置語法標示
    nuformulaHighlightStyle(),
  ],
});
```
- 參考 codemirror 文件 [連結](https://codemirror.net/docs/ref/#language.syntaxHighlighting)

## Output
type: [Extension](https://codemirror.net/docs/ref/#state.Extension)
參考 codemirror autocomplete: [autocompletion(config⁠?: Object = {}) → Extension](https://codemirror.net/docs/ref/#autocomplete.autocompletion)

# Item Widget 表單元件項目替換標籤插件
用途：將編輯器中符合元件項目 `{`uuid sn`}` 的字串替換成元件標籤 `<span>`
## 使用方式
```javascript
EditorState.create({
  ...
  extensions: [
    ...
    // 表單項目標記插件
    nuformulaItemWidget(formattedFormItems),
  ],
});
```
- 參考 codemirror 文件 [連結](https://codemirror.net/docs/ref/#view.WidgetType)
## Input
### formattedFormItems
- type: `object`
- 可選表單元件(格式化後的表單元件)
```javascript
const formattedFormItems = formatFormItems(formItems)
```
## Output
type: [viewPlugin](https://codemirror.net/docs/ref/#view.ViewPlugin)

# linter 語法檢查插件
用途：定義公式驗證規則，並顯示錯誤提示
## 使用方式
```javascript
EditorState.create({
  ...
  extensions: [
    ...
    // linter 插件
    nuformulaLinter(
      Object.keys(formattedFormItems),
      handleEditorUpdateCallback),
  ],
});
```
- 參考 codemirror 文件 [連結](https://codemirror.net/docs/ref/#view.WidgetType)











# evaluation 公式函式庫
## 使用方式
```javascript
import {
  nuformulaEvaluation,
  formatFormItems,
} from "codemirror-lang-nuformula";

// 公式字串
const formula = `="This is a formula."`;
// 表單項目元件
const formItems = { ... };
// 要被賦值的表單元件序號
const assignTarget = "sn-of-form-item-to-be-assigned";
// 當前表單填寫值
const formData = { ... };

// 初始公式函式庫
nuformulaEvaluation.init(formatFormItems(formItems));

// 向後端請求公式佇列
const postfixStack = getPostfixStackFromApi(formula);

// 取得公式計算方法
const evaMethod = nuformulaEvaluation.getEvaluation(
  postfix,
  assignTarget,
);

// 取得計算結果
const result = evaMethod(formData, assignTarget.rowId);
```

## Public Methods 公開方法
### init
- 初始化公式計算工具
- 參數: formatted form-items
```javascript
/**
 * 初始化公式計算工具
 *
 * @param {object} formItems - 所有可用表單元件
 */
init(formItems: { [key: string]: Item }):void {}
```

### getEvaluation
- 取得公式計算方法
```javascript
/**
 * 取得公式計算方法
 *
 * @param {Array} postfixStack - postfix 公式佇列
 * @param {string} assignTarget - 公式賦值的元件序號
 * @returns {Function} - 公式運算方法
 */
getEvaluation(postfixStack: Argument[], assignTarget?: string):Function {

  /**
   * 公式計算方法
   *
   * @param {object} scopedData - 當前表單填寫值
   * @param {string} row - 子表列序號 (若該元件是子表內的欄位的話才有)
   * @return {any} - 公式運算結果
   */
  return (
    scopedData: { [key: string]: any },
    row?: string
  ): string | number => {}

}
``````

