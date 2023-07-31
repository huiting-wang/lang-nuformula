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
} from "codemirror-lang-nuformula";
import { ref, onMounted, reactive } from "vue";

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
    nuformulaLinter(handleEditorUpdate),
    // 表單項目標記插件
    nuformulaItemWidget(props.formItems),
    // 自動選字插件
    nuformulaAutocomplete(props.formItems),
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
} from "codemirror-lang-nuformula";
import { isEmptyValue } from "@/utils";

export default {
  name: "FormulaEditor",
  provide() {
    return {
      // 可用表單元件
      formItems: this.formItems,
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
          nuformulaLinter(this.handleEditorUpdate),
          // 表單項目標記插件
          nuformulaItemWidget(this.formItems),
          // 自動選字插件
          nuformulaAutocomplete(this.formItems),
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
      this.$nextTick(() => {
        this.view.focus();
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