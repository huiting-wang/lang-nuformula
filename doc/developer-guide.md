# 維護指引

- [維護指引](#維護指引)
  - [如何擴充一個運算子](#如何擴充一個運算子)
    - [註冊運算子](#註冊運算子)
    - [擴充編輯器語法](#擴充編輯器語法)
    - [擴充 linter 檢測](#擴充-linter-檢測)
    - [擴充計算函式庫](#擴充計算函式庫)
    - [擴充測試案例](#擴充測試案例)
      - [evaluation](#evaluation)
      - [syntax grammar](#syntax-grammar)
      - [linter](#linter)
  - [如何擴充一個運算函式](#如何擴充一個運算函式)
    - [註冊運算子](#註冊運算子-1)
    - [擴充計算函式庫](#擴充計算函式庫-1)
    - [擴充 linter 檢測](#擴充-linter-檢測-1)
    - [擴充測試案例](#擴充測試案例-1)
      - [evaluation](#evaluation-1)
      - [syntax grammar](#syntax-grammar-1)
      - [linter](#linter-1)
  - [如何擴充一個 Widget](#如何擴充一個-widget)
    - [建立 SystemWidgetPlugin](#建立-systemwidgetplugin)
  - [如何擴充一種語法](#如何擴充一種語法)
    - [擴充編輯器語法](#擴充編輯器語法-1)
    - [擴充 系統參數 鍵值](#擴充-系統參數-鍵值)
    - [擴充 linter 檢測](#擴充-linter-檢測-2)
      - [在 `NuLinter` 類型中，擴充 constructor](#在-nulinter-類型中擴充-constructor)
      - [在 `NuLinter` 類型中，擴充 reset 方法](#在-nulinter-類型中擴充-reset-方法)
      - [在 `NuLinter` 類型中，擴充 verify 方法](#在-nulinter-類型中擴充-verify-方法)
- [補充提醒](#補充提醒)

## 如何擴充一個運算子
假設我們要新增一個運算子 mod `%`，作用為取餘數： ex `10 % 3 = 1`

### 註冊運算子
> file: `/src/constants.ts`

在 `opName` 中擴充 mod 鍵值

```diff
// 可用運算子
export enum opName {
    /* 數學運算子 */
    ...
+   mod = "mod", // ---------------------- 取餘數 (%)
}
```

### 擴充編輯器語法
> file: `/src/syntax.grammar`

因為 `%` 是運算子 (Operator)，所以在 Operator 的正規表達式中新增 `%` 字符
```diff
@tokens {
    ...
-   Operator { $[+\-*/<>=] | "<=" | ">=" | "<>" }
+   Operator { $[+\-*/<>=%] | "<=" | ">=" | "<>" }
    ...
}
```

### 擴充 linter 檢測
> file: `/src/linter.ts`

擴充 `%` 字符的正規表達式
```diff
// 註冊所有可接受的字符的正規表達式
...
+ const SYNTAX_mod = `(%)`; // ---------------- 取餘數 %
```

由於 mod 的計算形質與 `*` (相乘) 、 `/` (相加) 等符號相同，因此可歸類於數學運算符號，故擴充進 `SYNTAX_arith`

```diff
// 數學運算符號
- const SYNTAX_arith = `(${SYNTAX_time}|${SYNTAX_divide})`;
+ const SYNTAX_arith = `(${SYNTAX_time}|${SYNTAX_divide}|${SYNTAX_mod})`;
```

到此，因為直接將 mod 套用 數學運算符號 `SYNTAX_arith` 的驗證規則，所以不需要另外擴充驗證規則。

### 擴充計算函式庫
> file: `/src/evaluation-lib.ts`

以註冊好的字串 `opName.mod` 為鍵值，實作運算邏輯


```typescript
export const NuEvaluationLib = {
  ...
  /**
   * 取餘數 (%)
   *
   * @param {Array} args - 參數
   * @returns {number} 兩數相除的餘數
   * @description
   *  - 範例: =10%3
   *  - 接受參數數量: 2
   */
  [opName.mod]: (args: any[]): number => {
    return args[0] % args[1];
  },
  ...
}
```

### 擴充測試案例
#### evaluation
> file: `/test/evaluation.json`

```json
{
    "mod":[
        {
        "formula": "=10%3",
        "answer": 1,
        "assignTarget": "input-1ee3015f-0c65-6fea-b872-0242a3ee6533",
        "postfix": [
            { "type": "number", "op": "operand", "value": 10 },
            { "type": "number", "op": "operand", "value": 3 },
            { "type": "math", "op": "operator", "value": "mod", "argCount": 2 },
            {
            "type": "function",
            "op": "operator",
            "value": "equal",
            "argCount": 1
            }
        ]
        }
    ],
}
```

#### syntax grammar
> file: `/test/language.txt`

```
# Operator Mod

10%3

===> 

NuFormula(Number,Operator,Number)
```

#### linter
> file: `/test/linter.json`

```json
{
  "validOperator":[
    {
      "text": "10%3",
      "result": null
    }
  ]
}
```



## 如何擴充一個運算函式
假設我們要新增一個運算函式 `AND`：如果所有引數為 TRUE，則傳回 TRUE

### 註冊運算子
> file: `/src/constants.ts`

在 `funcName` 中擴充 `AND` 鍵值

```diff
// 可用函式
export enum funcName {
+  AND = "and", // --------------------------- 連集
}
```

### 擴充計算函式庫
> file: `/src/evaluation-lib.ts`

以註冊好的字串 `funcName.AND` 為鍵值，實作運算邏輯


```typescript
export const NuEvaluationLib = {
  ...
    /**
    * AND，使用 AND 函數 (邏輯函數之一) 來判斷測試中是否所有條件皆為 TRUE。
    *
    * @param {Array} args - 參數
    * @returns {boolean} 如果所有引數為 TRUE，則傳回 TRUE
    * @description
    *  - 範例: =SUM(boolean1, [boolean2], ...)
    *  - 接受參數數量: n
    */
    [funcName.AND]: (args: any[]):boolean => {
        return args.reduce((output, arg)=> output && arg, true)
    },
  ...
}
```

### 擴充 linter 檢測
> file: `/src/linter.ts`

擴充參數數量限制的驗證：因為 `AND` 方法沒有限制參數數量，所以可以做以下的調整
```diff
/**
 * 判斷函式參數數量是否合法
 *
 * @param {FuncArg} - 函式佇列
 * @returns {boolean}
 */
const isValidFuncArg = ({ name, argCount }: FuncArg): boolean => {
  switch (name.toLowerCase()) {
    case funcName.IF:
      return argCount === 3;
    case funcName.AVERAGE:
    case funcName.CONCAT:
    case funcName.SUM:    
+   case funcName.ADD:
    case "arithmetic":
      return true;
    default:
      return argCount <= 1;
  }
};
```


### 擴充測試案例

#### evaluation
> file: `/test/evaluation.json`

```json
{
    "and": [    
    {
      "formula": "=AND(10>4,10=3+7)",
      "answer": true,
      "assignTarget": "input-1ee3015f-0c65-6fea-b872-0242a3ee6533",
      "postfix": [
        {
          "type": "number",
          "op": "operand",
          "value": "10"
        },
        {
          "type": "number",
          "op": "operand",
          "value": "4"
        },
        {
          "type": "math",
          "op": "operator",
          "value": "gt",
          "argCount": 2
        },
        {
          "type": "number",
          "op": "operand",
          "value": "10"
        },
        {
          "type": "number",
          "op": "operand",
          "value": "3"
        },
        {
          "type": "number",
          "op": "operand",
          "value": "7"
        },
        {
          "type": "math",
          "op": "operator",
          "value": "add",
          "argCount": 2
        },
        {
          "type": "math",
          "op": "operator",
          "value": "eq",
          "argCount": 2
        },
        {
          "type": "function",
          "op": "operator",
          "value": "and",
          "argCount": 2
        },
        {
          "type": "function",
          "op": "operator",
          "value": "equal",
          "argCount": 1
        }
      ]
    }
  ]
}
```
#### syntax grammar
> file: `/test/language.txt`

```
# Function AND

AND(10,"four")

===> 

NuFormula(Keyword,ArgList("(",Number,Comma,String,")"))
```

#### linter
> file: `/test/linter.json`

```json
{
  "validFunction":[
    {
      "text": "AND(10>4,10=3+7)",
      "result": null
    }
  ]
}
```

## 如何擴充一個 Widget

什麼是 Widget？例如，一個表單元件，我們定義他的公式表示法是`{sn}`，但在使用體驗上，希望呈現 `<div>元件名稱</div>` 的元素，這個元素就稱為 "Widget"。
Widget 採用 CodeMirror 提供的 `Decoration` 方法處理。
參考資料：https://codemirror.net/examples/decoration/

假設我們現在定義一個新的變數：`系統參數`。使用者可以將該張表單的系統參數設為公式的參數，例如：流程狀態、申請人、申請時間等。
```
=IF(流程狀態="進行中","表單正在簽核流程中","表單已完成簽核")
```

我們可以定義用 `$flow_status$` 來定義 `流程狀態` 的變數，`$`標記系統參數的起始與結束。所以上述的公式轉化為公式字串就會是：

```
=IF($flow_status$="進行中","表單正在簽核流程中","表單已完成簽核")
```


### 建立 SystemWidgetPlugin
新增一個檔案
> file: `/src/system-widget.ts`

首先，我們繼承 CodeMirror 的 `Widget` 類型，建構我們需要的系統參數 widget
```ts
import { WidgetType } from "@codemirror/view";

/**
 * 取得系統參數標籤
 * 
 * @param {String} type - 系統參數類型
 * @return {String}
 */
function getSystemLabel (type: string){
   switch (type){
      case "flow_status": return "流程狀態";
      case "apply_user": return "申請者";
      case "apply_date": return "申請時間";
      default: return "系統參數";
    }
}

class SystemWidget extends WidgetType {
  text: string;

  constructor(type: String) {
    super();
    this.text = getSystemLabel(type);
  }
  toDOM() {
    let wrap = document.createElement("span");
    wrap.style.cssText = `
        border-radius: 4px;
        color: #3d5c3f;
        padding: 2px 4px;
        background-color: #d3edd5;
      `;
    wrap.innerText = this.text;
    return wrap;
  }
  override ignoreEvent() {
    return false;
  }
}

```

接著，我們撰寫將字串替換成 widget 的邏輯：

```ts
import { Range } from "@codemirror/state";
import { EditorView, DecorationSet } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

/**
 * 建立元件標籤
 *
 * @param { EditorView } view - EditorView
 * @returns { DecorationSet }
 */
function systemTag(view: EditorView) {
  let widgets = [] as Range<Decoration>[];
  for (let { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        // 節點類型需要是 "Item"
        if (node.name !== "Item") return;
        // 取得實際字串
        const SystemType = view.state.doc.sliceString(
          node.from + 1,
          node.to - 1
        );

        // 建立 widget 裝飾
        let deco = Decoration.replace({
          widget: new SystemWidget(SystemType),
          side: 1,
        });
        widgets.push(deco.range(node.from, node.to));
      },
    });
  }
  return Decoration.set(widgets);
}
```

最後，我們建立插件輸出的入口函式
```ts
export function nuformulaSystemWidget(){
  // 輸出插件函式
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      
      constructor(view: EditorView) {
        this.decorations = systemTag(view);
      }
      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged)
          this.decorations = systemTag(update.view);
      }
    },
    {
      // 套用裝飾
      decorations: (instance) => instance.decorations,
      provide: (plugin) =>
        // 元件原子性 (當刪除 widget 時，完整刪除字串)
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.decorations || Decoration.none;
        }),
    }
  );
}
```

到這裡，我們已經完成 widget 插件的建立。但是要實際使用這個 widget，我們需要擴充語法，讓編輯器可以接受系統參數的表示法。

## 如何擴充一種語法

承上，假設我們現在要新增一種語法：系統參數。表示法為：`$`+系統參數鍵值+`$`。

例如：
- 流程狀態：`$flow_status$`
- 申請人：`$apply_user$`
- 申請時間：`$apply_time$`

我們需要

### 擴充編輯器語法
> file: `/src/syntax.grammar`

```diff
@tokens {
    ...
-   Item { "{" ((@asciiLowercase | "_") + "-")? hex+ "-" hex+ "-" hex+ "-" hex+ "-" hex+  ("-" + "sum")? "}" }
+   formItem { "{" ((@asciiLowercase | "_") + "-")? hex+ "-" hex+ "-" hex+ "-" hex+ "-" hex+  ("-" + "sum")? "}" }
+   systemItem { "$" + @asciiLowercase + "$" }
+   Item {formItem | systemItem }
    ...
}
```

### 擴充 系統參數 鍵值
> file: `/src/constants.ts`

```ts
// 可用系統參數
export enum systemType {
  flowStatus = "flow_status", // ----- 流程狀態
  applyUser = "apply_user", // ------- 申請人
  applyDAte = "apply_date" // -------- 申請時間
}
```

### 擴充 linter 檢測
> file: `/src/linter.ts`

擴充系統參數字符的正規表達式
```diff
// 註冊所有可接受的字符的正規表達式
...
+ const SYNTAX_dollar = `\\$`; // ------------- 系統參數標記 $
```
```diff
...
+ import {systemType} from "./constants";

// 流程狀態
+ const SYNTAX_system = `(${Object.keys(systemType).join("|")})`;
```

#### 在 `NuLinter` 類型中，擴充 constructor
```diff
class NuLinter {
...
+ private sStack: number[]; // ---------- 系統參數配對佇列
+ private systemType: string; // -------- 系統參數類型
...
  constructor() {
    ...
    this.text =
      this.prevChar =
      this.char =
      this.nextChar =
      this.itemSn =
      this.funcName =
+     this.systemType =
        "" as string;
    // 括號配對佇列、引號配對佇列、表單項目配對佇列
    this.pStack = [] as number[];
    this.qStack = [] as number[];
    this.iStack = [] as number[];
+   this.sStack = [] as number[];
    // 函式參數佇列
    this.fStack = [] as FuncArg[];
  }
 }
```

#### 在 `NuLinter` 類型中，擴充 reset 方法
```diff
/**
  * 重置 linter
  *
  * @param {string} text - 公式字串
  */
reset(text = "") {
  ...
- // 括號配對佇列、引號配對佇列、表單項目配對佇列
+ // 括號配對佇列、引號配對佇列、表單項目配對佇列、系統參數佇列
  this.pStack = [] as number[];
  this.qStack = [] as number[];
  this.iStack = [] as number[];
+ this.sStack = [] as number[];
  // 函式參數佇列
  this.fStack = [] as FuncArg[];
}
```

#### 在 `NuLinter` 類型中，擴充 verify 方法
在 `switch case` 中新增以下邏輯：
```ts
// 存在等待配對的系統參數標記
case this.sStack.length > 0:
  this.waitForSystem(pos);
  continue;

// 遇到尚未配對的系統參數標記
case !this.sStack.length && isSyntax(SYNTAX_dollar, this.char):
  this.meetSystem(pos);
  continue;
```

擴充 存在等待配對的系統參數標記 `waitForSystem` 方法
```ts
/**
 * 存在等待配對的系統參數標記
 *
 * @internal
 * @param {number} pos - 字符位置
 */
private waitForSystem(pos: number) {
  // 遇到配對的錢字號 $
  if (isSyntax(SYNTAX_dollar, this.char)) {
    //  遇到無效的系統參數
    if (!Object.values(systemType).includes(this.systemType)) {
      throwError({ message: ERROR.invalidItem, pos: pos });
    }

    // 檢查下一個字符是否為一個參數的合法後綴
    if (!isSyntax(SYNTAX_trail_to_arg, this.nextChar))
      throwError({ message: ERROR.missingOperator, pos });

    // 消除配對的錢字號
    this.sStack.pop();
    this.systemType = "";
  } else{
    // 繼續紀錄系統參數鍵值
    this.systemType += this.char;
  }
}
```

擴充 遇到尚未配對的系統參數標記 `meetSystem` 方法
```ts
/**
 * 遇到尚未配對的系統參數標記
 *
 * @internal
 * @param {number} pos - 字符位置
 */
private meetSystem(pos: number) {
  // 檢查上一個字符是否為一個參數的合法前綴
  if (!isSyntax(SYNTAX_lead_to_arg, this.prevChar))
    throwError({ message: ERROR.missingOperator, pos: pos - 1 });
  // 紀錄標記位置
  this.sStack.push(pos);
}
```

最後，需要擴充公式函式庫，確保在解析系統參數時，可以帶入正確的數值。這部分需要擴充 `getValue` 函式。

# 補充提醒
以上的範例僅供參考，需實際操作之後，因應不同狀況進行調整。強烈建議參考 [CodeMirror 官方說明文件](https://codemirror.net/)。

<style type="text/css" scoped>
  h1 { 
    counter-reset: 
    h2counter;
    margin-top: 128px; 
  }
  h1:first-child{
    margin-top: 0px;
  }
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
