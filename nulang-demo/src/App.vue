<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { nuformulaEvaluation, formatFormItems } from "codemirror-lang-nuformula";
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
  "1ee13e24-de80-6db8-ad3c-0242994894d2": {
    "sn": "1ee13e24-de80-6db8-ad3c-0242994894d2",
    "type": "form",
    "prevExisted": false,
    "options": {
      "labelPosition": "top"
    },
    "list": "1ee2c5ad-42c7-6fc2-93ea-0242a3ee6533"
  },
  "1ee2c428-8260-60a2-af11-0242a3ee6533": {
    "sn": "1ee2c428-8260-60a2-af11-0242a3ee6533",
    "type": "input",
    "prevExisted": false,
    "parent": {
      "sn": "1ee13e24-de80-6db8-ad3c-0242994894d2",
      "type": "form"
    },
    "category": "basic",
    "options": {
      "label": "單行文字",
      "maxLen": null,
      "pattern": "none",
      "disabled": false,
      "required": false,
      "placeholder": "請輸入",
      "defaultValue": "",
      "noDuplicated": false
    }
  },
  "1ee2c428-8260-621e-b747-0242a3ee6533": {
    "sn": "1ee2c428-8260-621e-b747-0242a3ee6533",
    "type": "textarea",
    "prevExisted": false,
    "parent": {
      "sn": "1ee13e24-de80-6db8-ad3c-0242994894d2",
      "type": "form"
    },
    "category": "basic",
    "options": {
      "label": "多行文字",
      "maxLen": null,
      "disabled": false,
      "required": false,
      "placeholder": "請輸入",
      "defaultValue": "",
      "noDuplicated": false
    }
  },
  "1ee2c428-8260-62d2-bb56-0242a3ee6533": {
    "sn": "1ee2c428-8260-62d2-bb56-0242a3ee6533",
    "type": "number",
    "prevExisted": false,
    "parent": {
      "sn": "1ee13e24-de80-6db8-ad3c-0242994894d2",
      "type": "form"
    },
    "category": "basic",
    "options": {
      "max": null,
      "min": null,
      "mode": "number",
      "label": "數字",
      "prefix": null,
      "suffix": null,
      "disabled": false,
      "required": false,
      "placeholder": "請輸入",
      "thousandths": false,
      "decimalPlace": null,
      "defaultValue": null
    }
  },
  "1ee2c428-8260-637c-b9e3-0242a3ee6533": {
    "sn": "1ee2c428-8260-637c-b9e3-0242a3ee6533",
    "type": "radio",
    "prevExisted": false,
    "parent": {
      "sn": "1ee13e24-de80-6db8-ad3c-0242994894d2",
      "type": "form"
    },
    "category": "basic",
    "options": {
      "label": "單選",
      "other": "",
      "disabled": false,
      "required": false,
      "direction": "vertical",
      "defaultValue": "",
      "radioOptions": [
        {
          "label": "選項一",
          "value": "value-1"
        },
        {
          "label": "選項二",
          "value": "value-2"
        },
        {
          "label": "其他",
          "value": "value-other"
        }
      ]
    }
  },
  "1ee2c428-8260-6412-81ec-0242a3ee6533": {
    "sn": "1ee2c428-8260-6412-81ec-0242a3ee6533",
    "type": "checkbox",
    "prevExisted": false,
    "parent": {
      "sn": "1ee13e24-de80-6db8-ad3c-0242994894d2",
      "type": "form"
    },
    "category": "basic",
    "options": {
      "label": "複選",
      "other": "",
      "disabled": false,
      "required": false,
      "direction": "vertical",
      "defaultValue": [],
      "checkboxOptions": [
        {
          "label": "選項一",
          "value": "value-1"
        },
        {
          "label": "選項二",
          "value": "value-2"
        },
        {
          "label": "其他",
          "value": "value-other"
        }
      ],
      "maxCheckedCount": null,
      "minCheckedCount": null
    }
  },
  "1ee2c428-8260-64b2-901a-0242a3ee6533": {
    "sn": "1ee2c428-8260-64b2-901a-0242a3ee6533",
    "type": "select",
    "prevExisted": false,
    "parent": {
      "sn": "1ee13e24-de80-6db8-ad3c-0242994894d2",
      "type": "form"
    },
    "category": "basic",
    "options": {
      "label": "下拉單選",
      "disabled": false,
      "required": false,
      "clearable": false,
      "placeholder": "請選擇",
      "defaultValue": "",
      "noDuplicated": false,
      "selectOptions": [
        {
          "label": "選項一",
          "value": "value-1"
        },
        {
          "label": "選項二",
          "value": "value-2"
        }
      ]
    }
  },
  "1ee2c428-8260-6548-8288-0242a3ee6533": {
    "sn": "1ee2c428-8260-6548-8288-0242a3ee6533",
    "type": "select_multiple",
    "prevExisted": false,
    "parent": {
      "sn": "1ee13e24-de80-6db8-ad3c-0242994894d2",
      "type": "form"
    },
    "category": "basic",
    "options": {
      "label": "下拉複選",
      "disabled": false,
      "required": false,
      "clearable": false,
      "placeholder": "請選擇",
      "defaultValue": [],
      "maxCheckedCount": null,
      "minCheckedCount": null,
      "selectMultipleOptions": [
        {
          "label": "選項一",
          "value": "value-1"
        },
        {
          "label": "選項二",
          "value": "value-2"
        }
      ]
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

const formattedFormItems = formatFormItems(formItems)

onMounted(() => {
  // 初始公式函式庫
  nuformulaEvaluation.init(formattedFormItems);
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
    <FormulaEditor :value="formula" :formItems="formattedFormItems" @change="handleChange" />
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