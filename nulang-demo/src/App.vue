<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { nuformulaEvaluation } from "codemirror-lang-nuformula";
import FormulaEditor from "./components/FormulaEditor.vue";

// 公式字串
const formula = ref(`=IF({aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa}="蘋果",CONCAT({aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa},"含稅的總價是$",{bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb}*{cccccccc-cccc-cccc-cccc-cccccccccccc}*1.1),"未註冊的商品")`);
// 表單元件
const formItems = reactive({
  ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"]: {
    sn: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    type: "input",
    options: { label: "商品名稱", },
  },
  ["bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"]: {
    sn: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    type: "number",
    options: { label: "商品單價", },
  },
  ["cccccccc-cccc-cccc-cccc-cccccccccccc"]: {
    sn: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    type: "number",
    options: { label: "商品數量", },
  },
  ["1ee13e24-de80-6db8-ad3c-0242994894d2"]: {
    sn: "1ee13e24-de80-6db8-ad3c-0242994894d2",
    type: "form",
    options: { label: "", },
  },
  ["input-cfc487a1-0324-4267-89cf-190b9b0b3087"]: {
    sn: "input-cfc487a1-0324-4267-89cf-190b9b0b3087",
    type: "input",
    category: "basic",
    options: { label: "單行文字", }
  },
  ["textarea-f2883251-2e7f-4312-a8ea-629aaf9025e4"]: {
    sn: "textarea-f2883251-2e7f-4312-a8ea-629aaf9025e4",
    type: "textarea",
    options: { label: "多行文字", }
  },
  ["number-2c78962c-4a31-4b16-9244-5a30864b4fe7"]: {
    sn: "number-2c78962c-4a31-4b16-9244-5a30864b4fe7",
    type: "number",
    options: { label: "數字", }
  },
  ["radio-0c05c59c-854b-4393-ad2a-7900ae865dfa"]: {
    sn: "radio-0c05c59c-854b-4393-ad2a-7900ae865dfa",
    type: "radio",
    options: {
      label: "單選",
      radioOptions: [
        { label: "選項一", value: "value-1" },
        { label: "選項二", value: "value-2" },
        { value: "value-other", label: "其他" }
      ],
      other: "",
    }
  },
  ["checkbox-b1a51709-b470-4d74-94c1-b986fbc0f224"]: {
    sn: "checkbox-b1a51709-b470-4d74-94c1-b986fbc0f224",
    type: "checkbox",
    options: {
      label: "複選",
      checkboxOptions: [
        { label: "選項一", value: "value-1" },
        { label: "選項二", value: "value-2" },
        { value: "value-other", label: "其他" }
      ],
      other: "",
    }
  },
  ["select-1d8de357-e044-4102-924e-49eaf57a545a"]: {
    sn: "select-1d8de357-e044-4102-924e-49eaf57a545a",
    type: "select",
    options: {
      label: "下拉單選",
      selectOptions: [
        { label: "選項一", value: "value-1" },
        { label: "選項二", value: "value-2" }
      ],
    }
  },
  ["select_multiple-6958f624-c3b3-4784-8678-fabbf3a8c2b4"]: {
    sn: "select_multiple-6958f624-c3b3-4784-8678-fabbf3a8c2b4",
    type: "select_multiple",
    options: {
      label: "下拉複選",
      selectMultipleOptions: [
        { label: "選項一", value: "value-1" },
        { label: "選項二", value: "value-2" }
      ],
    }
  }

});

/**
 * 當編輯器更新
 * @param {string} text - 公式字串
 */
function handleChange(text: string) {
  formula.value = text;
}

onMounted(() => {
  // 初始公式函式庫
  nuformulaEvaluation.init(formItems);
})
</script>

<template>
  <div class="demo">
    <h1>公式編輯器展示 CodeMirror NuFormulaLang</h1>
    <div class="author">
      <h3>Work in progress</h3>
      <p>YUN-CHIEN-LO</p>
      <a class="github" href="https://github.com/YUN-CHIEN-LO/lang-nuformula" target="_blank">
        <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="github" />
      </a>
    </div>
    <FormulaEditor :value="formula" :formItems="formItems" @change="handleChange" />
    <p> {{ formula }} </p>
  </div>
</template>

<style lang="scss">
.demo {
  & .author {
    display: flex;
    align-items: center;

    &>h3 {
      margin-right: auto;
    }

    &>p {
      margin: 0px 8px;
    }

    & .github {
      width: 32px;

      &>img {
        width: 100%;
      }
    }
  }

  &>p {
    width: 100%;
    max-width: 800px;
  }
}
</style>