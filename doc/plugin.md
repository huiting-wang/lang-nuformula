# 輸出插件與使用方法

## formatFormItems 表單元件格式化方法
### Input (輸入)
目前表單設計套件的標準格式
### Output (輸出)
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


## autocomplete 關鍵字輸入插件
用途：鍵入字符時，以下拉選單的方式展開可使用的關鍵字選單
### 使用方式
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
### Input
#### formattedFormItems
- type: `object`
- 可選表單元件(格式化後的表單元件)
```javascript
const formattedFormItems = formatFormItems(formItems)
```

#### customOptions
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

### Output
type: [Extension](https://codemirror.net/docs/ref/#state.Extension)
參考 codemirror autocomplete: [autocompletion(config⁠?: Object = {}) → Extension](https://codemirror.net/docs/ref/#autocomplete.autocompletion)

## highlight 編輯器高亮插件
用途：定義編輯器字符的分類與顏色樣式
### 使用方式
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

### Output
type: [Extension](https://codemirror.net/docs/ref/#state.Extension)
參考 codemirror autocomplete: [autocompletion(config⁠?: Object = {}) → Extension](https://codemirror.net/docs/ref/#autocomplete.autocompletion)

## Item Widget 表單元件項目替換標籤插件
用途：將編輯器中符合元件項目 `{`uuid sn`}` 的字串替換成元件標籤 `<span>`
### 使用方式
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
### Input
#### formattedFormItems
- type: `object`
- 可選表單元件(格式化後的表單元件)
```javascript
const formattedFormItems = formatFormItems(formItems)
```
## Output
type: [viewPlugin](https://codemirror.net/docs/ref/#view.ViewPlugin)



## linter 語法檢查插件
用途：定義公式驗證規則，並顯示錯誤提示
### 使用方式
```javascript
EditorState.create({
  ...
  extensions: [
    ...
    // linter 插件
    nuformulaLinter(formattedFormItems, callback),
  ],
});
```
- 參考 codemirror 文件 [連結](https://codemirror.net/docs/ref/#lint)

### Input
#### formattedFormItems
- type: `object`
- 可選表單元件(格式化後的表單元件)
```javascript
const formattedFormItems = formatFormItems(formItems)
```
#### callback
- type: `function`
- 當更新編輯器內容時，觸發回呼函式
- arguments:
  - error
    - type: [Diagnostic](https://codemirror.net/docs/ref/#lint.Diagnostic)
    - 錯誤資訊

```javascript
callback(error: Diagnostic) => void
```

### Output
type: [Extension](https://codemirror.net/docs/ref/#state.Extension)




<style type="text/css" scoped>
  h1 { counter-reset: h2counter;  }
  h2 { counter-reset: h3counter; }
  h3 { counter-reset: h4counter; }
  h4 { counter-reset: h5counter; }
  h5 { counter-reset: h6counter; }
  h2:before {
    counter-increment: h2counter;
    content: counter(h2counter, trad-chinese-informal) ".\0000a0\0000a0";
  }
  h3:before {
    counter-increment: h3counter;
    content: counter(h2counter) "."
              counter(h3counter) ".\0000a0\0000a0";
  }
  h4:before {
    counter-increment: h4counter;
    content: counter(h2counter) "."
              counter(h3counter) "."
              counter(h4counter) ".\0000a0\0000a0";
  }
  h5:before {
    counter-increment: h5counter;
    content: counter(h2counter) "."
              counter(h3counter) "."
              counter(h4counter) "."
              counter(h5counter) ".\0000a0\0000a0";
  }
  h6:before {
    counter-increment: h6counter;
    content: counter(h2counter) "."
              counter(h3counter) "."
              counter(h4counter) "."
              counter(h5counter) "."
              counter(h6counter) ".\0000a0\0000a0";
  }
</style>
