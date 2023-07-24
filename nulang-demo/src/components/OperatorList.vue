<template>
    <div class="formula-editor__panel">
        <div class="formula-editor__list">
            <div class="formula-editor__list__header">
                <h3>可用函式</h3>
            </div>
            <div class="formula-editor__list__scroll">
                <div v-for="item in operatorList" :key="item" class="formula-editor__operator"
                    @click.stop="$emit('add', item.toUpperCase())" @mouseenter="setFunctionInfo(item)">
                    <p>{{ item.toUpperCase() }}</p>
                </div>
            </div>
        </div>
        <div class="formula-editor__info">
            <h3>{{ currentFunction.toUpperCase() }}</h3>
            <p> {{ functionUsage[currentFunction as keyof typeof functionUsage] }} </p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue"
import { funcName } from "codemirror-lang-nuformula"

// 可用函式說明
const functionUsage = reactive({
    [funcName.CONCAT]: `CONCAT函數可以將多個文字合併成一個文字\n用法:CONCAT(文字1,文字2,...)`,
    [funcName.IF]: `IF函數判斷一個條件能否滿足；如果滿足返回一個值,如果不滿足則返回另外一個值\n用法:IF(邏輯運算式,為true時返回的值,為false時返回的值)`,
    [funcName.SUM]: `SUM函數可以獲取一組數值的總和\n用法:SUM(數字1,數字2,...)`,
    [funcName.AVERAGE]: `AVERAGE函數可以獲取一組數值的算術平均值\n用法:AVERAGE(數字1,數字2,...)`
})
// 可用函式選項
const operatorList = reactive(Object.values(funcName));
// 當前檢視函式
const currentFunction = ref(operatorList[0] as string)

/**
 * 檢視函式說明
 *
 * @param {string} funcName - 函式名稱
 */
function setFunctionInfo(funcName: string) {
    // 更新當前檢視函式
    if (currentFunction.value !== funcName) currentFunction.value = funcName as string;
}
</script>

<style lang="scss" scoped>
.formula-editor {
    &__panel {
        flex: 3;
        border: solid 1px #efefef;
        border-radius: 4px;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
    }

    &__list {
        flex: 2;
        flex-shrink: 0;
        align-self: stretch;

        &__header {
            border-bottom: solid 2px #efefef;
            padding: 8px 12px;
            box-sizing: border-box;
        }

        &__scroll {
            height: 200px;
            overflow-y: auto;
        }
    }

    &__info {
        flex: 3;
        flex-shrink: 0;
        align-self: stretch;
        box-sizing: border-box;
        border-left: solid 1px #efefef;
        padding: 0px 24px;

        &>h3 {
            padding: 8px 0px;
        }

        &>p {
            margin: 0;
            padding: 12px 0px;
            white-space: pre-wrap;
        }
    }

    &__operator {
        margin: 4px 12px;
        padding: 4px 12px;
        border-radius: 4px;
        height: 32px;
        cursor: pointer;
        display: flex;
        justify-content: flex-start;
        align-items: center;

        &:hover {
            background-color: #efefef;
        }

        &>p {
            margin: 0px 8px;
        }
    }
}
</style>