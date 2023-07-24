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
    options: {
      label: "商品名稱",
    },
  },
  ["bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"]: {
    sn: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    type: "number",
    options: {
      label: "商品單價",
    },
  },
  ["cccccccc-cccc-cccc-cccc-cccccccccccc"]: {
    sn: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    type: "number",
    options: {
      label: "商品數量",
    },
  },
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