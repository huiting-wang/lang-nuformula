# 公式編輯 CodeMirror 6 language package template

```
日期：2023-07-21
規劃：Chien Lo
版本號：0.2
```

- 建置： `npm run prepare`
- 測試：`npm test`

## 資料夾結構拆分
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

