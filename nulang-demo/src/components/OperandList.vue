<template>
    <div class="formula-editor__list">
        <div class="formula-editor__list__header">
            <h3>可用變數</h3>
        </div>
        <div class="formula-editor__list__scroll">
            <div v-for="item in operandList" :key="item.sn" class="formula-editor__operand"
                @click.stop="$emit('add', item.sn)">
                <p>{{ item.options.label }}</p>
                <div :class="['operand-tag', { [`is-${getTag(item.type).type}-type`]: true }]">
                    {{ getTag(item.type).label }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue"
import { widgetType } from "codemirror-lang-nuformula"

const props = defineProps({
    // 表單元件
    formItems: {
        default: () => ({}),
        type: Object
    }
})

// 可用表單元件
const validType = Object.values(widgetType);
const operandList = reactive(Object.values(props.formItems).filter((item) =>
    validType.includes(item.type)
))


/**
 * 取得表單元件分類標籤
 * @param {string} type - 類型
 * @returns {object}
 */
function getTag(type: string): { type: string, label: string } {
    let tag = { type: "", label: "" };
    switch (type) {
        case widgetType.input:
        case widgetType.textarea:
        case widgetType.radio:
        case widgetType.select:
            tag.type = "text";
            tag.label = "文字";
            break;
        case widgetType.number:
            tag.type = "number";
            tag.label = "數字";
            break;
        case widgetType.checkbox:
        case widgetType.selectMultiple:
            tag.type = "array";
            tag.label = "陣列";
            break;
        default:
            tag.type = "unknown";
            tag.label = "未知";
            break;
    }
    return tag
}

</script>

<style lang="scss" scoped>
.formula-editor {
    &__list {
        flex: 1;
        border: solid 1px #efefef;
        border-radius: 4px;

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

    &__operand {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-wrap: nowrap;
        min-width: 240px;
        margin: 4px 12px;
        padding: 4px 12px;
        border-radius: 4px;
        height: 32px;
        cursor: pointer;

        &:hover {
            background-color: #efefef;
        }

        &>p {
            margin: 0px 8px;
        }
    }

    .operand-tag {
        color: #fff;
        padding: 2px 14px;
        border-radius: 5px;
        height: 24px;
        margin-left: auto;

        &.is-unknown-type {
            background-color: #aaabab;
        }

        &.is-text-type {
            background-color: #5c9ce5;
        }

        &.is-number-type {
            background-color: #ecc133;
        }

        &.is-array-type {
            background-color: #5ac877;
        }
    }
}
</style>