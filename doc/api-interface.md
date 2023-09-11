# 表單設計 api 介面擴充

```json
{
    "sn": "1ee32a4a-6db8-6248-a0b2-0242a3ee6533",
    "type": "input",
    "prevExisted": false,
    "parent": {
        "sn": "1ee32928-549c-6430-88a0-0242a3ee6533",
        "type": "form"
    },
    "category": "basic",
    "options": {
        "label": "單行文字",
        "pattern": "none",
        "disabled": false,
        "required": false,
        "placeholder": "請輸入",
        "noDuplicated": false,
        // [維持] 預設值 (不異動)
        "defaultValue": "",
        // [新增] 預設值模式，可選值：auto(手動輸入) | formula(公式編輯)
        "defaultType": "formula",
        // [新增] 公式字串
        "formula": "={1ee3767b-06bd-6660-82a4-0242a3ee6533-sum}"
    },
    // [新增] 該元件公式所依賴的元件鍵值
    "relyOn": ["1ee3767b-06bd-6660-82a4-0242a3ee6533-sum"],
    // [新增] 該元件被哪些元件的公式依賴
    "relyTrigger":[
        "1ee32a4a-6db8-6248-a0b2-0242a3ee6533","input-2a02d4ae-0f00-4298-a671-014bf8e91d8a"
    ],
    // [新增] 該元件設定的錯誤狀態 (由前端 maintain)
    "settingErrors": [
        // 公式設置錯誤 (目前只有這個鍵值)
        "invalidFormula"
    ]
}
```

## formula 表示法定義
參考 [說明文件](./evaluation.md#初始請求-api-介面)

## TODO 待辦事項
- 表單設計 儲存公式錯誤狀態