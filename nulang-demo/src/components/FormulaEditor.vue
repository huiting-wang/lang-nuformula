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
import OperandList from "./OperandList.vue";
import OperatorList from "./OperatorList.vue";

const props = defineProps({
  // 公式綁定數值
  value: {
    default: "=",
    type: String,
  },
  // 是否禁用元件
  disabled: {
    default: false,
    type: Boolean,
  },
  // 表單元件
  formItems: {
    default: () => ({}),
    type: Object,
  },
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
    nuformulaLinter(props.formItems, handleEditorUpdate),
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

/**
 * 點擊新增運算元
 *
 * @param {string} operand - 運算元
 */
function handleAddOperand(operand: string): void {
  insertText(`{${operand}}`);
}
/**
 * 點擊新增運算子
 *
 * @param {string} operator - 運算子
 */
function handleAddOperator(operator: string): void {
  insertText(`${operator}()`, -1);
}
/**
 * 在鼠標位置插入文字
 *
 * @param {string} text - 要插入的運算元符號
 * @param {number} offset - 插入鼠標 offset
 */
function insertText(text: string, offset = 0): void {
  if (cm.view === undefined) return;
  // 賦予編輯器焦點
  cm.view.focus();
  // 取得鼠標位置
  const range = cm.view.state.selection.ranges[0];
  // 要插入的運算元符號

  // 新的鼠標位置
  const newPos = range.from + text.length + offset;

  cm.view.dispatch({
    changes: {
      from: range.from,
      to: range.to,
      insert: text,
    },
    selection: { anchor: newPos },
  });
}
</script>

<template>
  <div class="formula-editor">
    <div class="formula-editor__equation">公式 =</div>
    <div ref="editor" class="formula-editor__input-field"></div>
    <div class="formula-editor__error">{{ formulaError }}</div>
    <div class="formula-editor__info">
      <OperandList :formItems="formItems" style="margin-right: 16px" @add="handleAddOperand" />
      <OperatorList @add="handleAddOperator" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.formula-editor {
  border: solid 1px #efefef;
  min-width: 320px;
  max-width: 800px;
  width: 80vw;

  &__equation {
    background-color: #f8f3ff;
    padding: 4px 24px;
    height: 32px;
    box-sizing: border-box;
  }

  &__skeleton {
    margin: 8px 24px;
    height: 120px;
  }

  &__input-field {
    margin: 8px 24px;

    :deep(.cm-scroller) {
      min-height: 120px;
    }
  }

  &__error {
    padding: 8px 24px;
    min-height: 36px;
    box-sizing: border-box;
    color: #e04b42;
  }

  &__info {
    border-top: solid 1px #efefef;
    box-sizing: border-box;
    padding: 16px 24px;
    display: flex;
  }

  :deep(.cm-field) {
    border-radius: 4px;
    color: #6e7796;
    padding: 2px 4px;
    background-color: rgba(#6e77961a, 0.1);
  }

  :deep(.cm-editor.cm-focused) {
    outline: none;
  }
}
</style>
