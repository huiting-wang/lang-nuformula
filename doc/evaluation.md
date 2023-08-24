# 公式函式庫 Evaluation


- [公式函式庫 Evaluation](#公式函式庫-evaluation)
  - [說明](#說明)
  - [需求](#需求)
    - [運算子需求](#運算子需求)
    - [運算元需求](#運算元需求)
    - [輸入輸出需求](#輸入輸出需求)
  - [使用範例](#使用範例)
  - [套件公開方法](#套件公開方法)
    - [init](#init)
    - [getEvaluation](#getevaluation)
  - [演算法與資料結構設計](#演算法與資料結構設計)
    - [基本概念](#基本概念)
    - [實踐方法](#實踐方法)
    - [參考資料](#參考資料)
  - [初始請求 api 介面](#初始請求-api-介面)
    - [常數定義](#常數定義)
    - [Input (輸入介面)](#input-輸入介面)
      - [operand 類型分析](#operand-類型分析)
      - [operator 類型分析](#operator-類型分析)
    - [Output (輸出介面)](#output-輸出介面)
      - [argument object interface](#argument-object-interface)
      - [輸出格式：](#輸出格式)
      - [operand 類型分析](#operand-類型分析-1)
      - [operator 類型分析](#operator-類型分析-1)
  - [維護指引](#維護指引)
    - [如何擴充一個公式](#如何擴充一個公式)


## 說明
- 開發原因：提供表單設計者設計表單時，可使用此公式編輯功能設定元件預設值。
- 為了達成使用者在輸入時「即時計算公式結果」，這種反覆又即時的觸發不適合後端請求，所以需要在前端專案中建立「公式函式庫」。

---

## 需求

以下定義一則「公式(formula)」是由兩種元素組成：「運算子(Operator)」 和 「運算元(Operand)」
- 運算子 - 指數學運算的對象，以此進行數學運算，ex `+`、`-`、`>`、`<`。<br>在這個套件中，定義「函式(function)」也是一種運算元，ex `SUM`、`IF`、`AVERAGE`。所以，子套件接受的運算子有兩種：
  - `math` 數學計算
  - `function` 函式
- 運算元 - 指結合物件、組成運算式的方式，用來計算結果，ex `2`、`100`、`"這是一個字串"`<br>在這個套件中，所接受的運算子有三種：
  - `number` 數字
  - `constant` 常數字串
  - `item` 表單元件


### 運算子需求
此函式庫參照 Microsoft Excel 的函式庫設計，目標是在輸入輸出與操作結果上盡可能符合 Excel 的
以下為目前所支援的運算項目

| 數學運算子(運算符號) [參考](https://support.microsoft.com/zh-tw/office/78be92ad-563c-4d62-b081-ae6da5c2ca69) | 符號名稱 | 說明 |
| --- | --- | --- |
| `+` | 加 | 進行數值的相加。 |
| `-` | 減 | 進行數值的相減。單項運算符號也能用於變換欄位內容的正負。 |
| `*` | 乘 | 進行數值的相乘。 |
| `/` | 除 | 進行數值的相除。 |
| `=` | 等於 | 字串或數值的值相同則判斷為符合，不同則判斷為不符合。不同類型間的比較將判斷為不符合。 |
| `<>` | 不等於 | 將「=」的比較結果反轉。不同類型的比較將判斷為符合。 |
| `<` | 小於 | 左側數值小於右側數值時，將回傳真（True），大於等於右側數值時，則回傳假（False）。 |
| `<=` | 小於等於 | 左側數值小於等於右側數值時，將回傳真（True），大於右側數值時，則回傳假（False）。 |
| `>` | 大於 | 左側數值大於右側數值時，將回傳真（True），小於等於右側數值時，則回傳假（False）。 |
| `>=` | 大於等於 | 左側數值大於等於右側數值時，將回傳真（True），小右側數值時，則回傳假（False）。 |
| `()` | 前後小括號 | 提高括號內的運算優先權。 |


函式運算子的表達格式為：`大寫英文字母(參數,[參數...])`，ex `SUM(100,200,300)`
- 一則「函式(function)」的命名需全部都是大寫英文字母，並且一定要接續一組對應的小括號`()`
- 一則「函式(function)」必須定義可以接受幾個「參數(argument)」。這些「參數(argument)」必須被小括號`()`包夾，並且以`,`連接，不可有空白
- 不同「函式(function)」可以定義其「參數(argument)」可以接納哪一種的「運算元(operand)」，也可以接收一個「計算結果」為參數(argument)，ex `SUM(100,1+2,AVERAGE(4,5,6))`

| 函式運算子 [參考](https://support.microsoft.com/zh-tw/office/5f91f4e9-7b42-46d2-9bd1-63f26a86c0eb) | 公式名稱 | 說明 | Excel 文件 |
| --- | --- | --- | --- |
| `=` | 等於/賦值 | 為一個公式最基本的公式，應為所有公式的開頭。 | - |
| `SUM` | 加總 | 使用此函數來加總儲存格中的值。 | [參考](https://support.microsoft.com/zh-tw/office/043e1c7d-7726-4e80-8f32-07b23e057f89) |
| `IF` | 條件 | 使用此函數以在條件符合時傳回一個值，並在條件不符合時傳回另一個值。 | [參考](https://support.microsoft.com/zh-tw/office/69aed7c9-4e8a-4755-a9bc-aa8bbff73be2) |
| `CONCAT` | 串連值 | 合並多個範圍和/或字串中的文字。 | [參考](https://support.microsoft.com/zh-tw/office/9b1a9a3f-94ff-41af-9736-694cbd6b4ca2) |
| `AVERAGE` | 平均 | 傳回引數的平均值。 | [參考](https://support.microsoft.com/zh-tw/office/047bac88-d466-426c-a32b-8f33eb960cf6) |




### 運算元需求
以下為公式可以接納的「運算元(operand)」類型

| 運算元 | 型別 | 說明 | 範例 |
| --- | --- | --- | --- |
| `number` 數字 | `number` | 數字類型運算元，可以進行四則運算 | `200` |
| `constant` 常數字串 | `string` | 純字串的運算元，前後需以 `"` 標示 | `"這是一個字串"` |
| `item` 表單元件 | 返回該表單元件的填寫值 | 若要取用 A元件 的填寫值，前後需以大括號 `{}` 標示，中間為 uuid 格式的元件序號： `{元件A的序號}`。 | `{9b1a9a3f-94ff-41af-9736-694cbd6b4ca2}` |

### 輸入輸出需求

一則公式在`表單設計-預設值`中，設定與儲存的格式為：

**公式設定格式**
- type: `String`
- 範例：
  - `=100`
  - `=10+(2*6)`
  - `=IF(SUM(100>50,"大於五十","FALSE"))`
  - `=CONCAT("總金額為：$",{9b1a9a3f-94ff-41af-9736-694cbd6b4ca2},"元")`

當此表單進入流程跑動後，設有公式的元件需要即時運算所設定個公式，因此公式套件的最終輸出會是一個可執行的方法，並且接收當前表單填寫值為參數：
  
**公式輸出格式**
- type: `Function`
- input: formData，當前表單所有元件的填寫值，就是送出表單時，返回後端的數據
  - type: `Object`，[元件序號]:[元件填寫值],ex `{ [9b1a9a3f-94ff-41af-9736-694cbd6b4ca2]:100 }`
- output: result，將表單元件的填寫值納入計算後，實際運算公式後得到的值，ex `"總金額為：$100元"`

但是，為了減輕前端在初始化表單時的效能負擔，此表單公式套件採用`部分SSR`的設計，將公式初始化的邏輯交由後端處理，這部分會在 [套件介面與使用範例](#套件介面與使用範例) 中詳述。


---

## 使用範例
```javascript
import {
  nuformulaEvaluation,
  formatFormItems,
} from "codemirror-lang-nuformula";

// 公式字串
const formula `=CONCAT({aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa},"含稅的單價為：$",{bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb}*1.1),"元"`
// 表單項目元件
const formItems = {
    ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"]: {
        // 表單元件序號
        sn: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        // 表單元件類型
        type: "input",
        // 其他表單設定
        options: {...}
    },
    ["bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"]: {
         // 表單元件序號
        sn: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        // 表單元件類型
        type: "number",
        // 其他表單設定
        options: {...}
    },
    ["cccccccc-cccc-cccc-cccc-cccccccccccc"]: {
        // 表單元件序號
        sn: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        // 表單元件類型
        type: "input",
        // 其他表單設定
        options: {...}
    },
};
// 要被賦值的表單元件序號
const assignTarget = "cccccccc-cccc-cccc-cccc-cccccccccccc";
// 當前表單填寫值
const formData = {
    ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa"]: "蘋果",
    ["bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb"]: 10
    ["cccccccc-cccc-cccc-cccc-cccccccccccc"]: ""
}

// 初始公式函式庫
nuformulaEvaluation.init(formatFormItems(formItems));

// 向後端請求公式佇列
const postfixStack = getPostfixStackFromApi(formula);

// 取得公式計算方法
const evaMethod = nuformulaEvaluation.getEvaluation(
  postfix,
  assignTarget,
);

// 取得計算結果
const result = evaMethod(formData, assignTarget.rowId);

// 取得公式計算結果
console.log(result); // 蘋果含稅的單價為：$11元
```

## 套件公開方法
### init
- 初始化公式計算工具
- 參數: formatted form-items
```javascript
/**
 * 初始化公式計算工具
 *
 * @param {object} formItems - 所有可用表單元件
 */
init(formItems: { [key: string]: Item }):void {}
```

### getEvaluation
- 取得公式計算方法
```javascript
/**
 * 取得公式計算方法
 *
 * @param {Array} postfixStack - postfix 公式佇列
 * @param {string} assignTarget - 公式賦值的元件序號
 * @returns {Function} - 公式運算方法
 */
getEvaluation(postfixStack: Argument[], assignTarget?: string):Function {

  /**
   * 公式計算方法
   *
   * @param {object} scopedData - 當前表單填寫值
   * @param {string} row - 子表列序號 (若該元件是子表內的欄位的話才有)
   * @return {any} - 公式運算結果
   */
  return (
    scopedData: { [key: string]: any },
    row?: string
  ): string | number => {}

}
```






---

## 演算法與資料結構設計

### 基本概念
**Expression Parsing 經典題目**
在拆解一個 Expression 時，有兩個步驟：
1. 將 infix 轉成 postfix
2. 將 postfix 中的元素 pop 出來進行計算


**§ 什麼是 infix、prefix 和 postfix?**
infix、prefix 和 postfix 是一種`「樹」Tree`資料結構，在遍歷節點時可以採用的讀取順序
- Infix 造訪順序：左節點 -> 根節點 -> 右節點
- Prefix 造訪順序：根節點 -> 左節點 -> 右節點
- Postfix 造訪順序：左節點 -> 右節點 -> 根節點

```
    5
   / \
  2   6
 / \
1   4
   /
  3
```
- Infix：1 2 3 4 5 6
- Prefix：5 2 1 4 3 6
- Postfix：1 3 4 2 6 5

**§ 如何理解 expression 的 infix 和 postfix?** <br>
若有一個 Expression：
```
A + B + C
```
我們可以理解成：先把 A 加上 B，得到一個暫存的數 T，再把 T 加上 C，得到最終的結果。<br>
因此，我們可以把 expression 中的 `+`(運算子)視為一個計算的中繼站，可以寫成
```
T = A + B
R = T + C
```
稍微把這個概念轉化一下，我們叫可以把以上的關係以`「樹」Tree`表示：
```
    +
   / \
  +   C
 / \
A   B
```
我們可以進一步寫成：
- infix: A+B+C
- postfix: AB+C+

<br>

再舉一個比較複雜的例子：
```
A + B * C
```
因為「先乘除後加減」的數學邏輯，所以我們要寫成：

```
T = B * C
R = A + T
```
同樣的，把以上的關係用`「樹」Tree`表示：
```
    +
   / \
  A   *
     / \
    B   C
```
這個 expression 可以寫成：
- infix: A+B*C
- postfix: ABC*+

**§ 如何將 infix 轉成 postfix** <br>

爲什麼不採用 infix 呢？ <br>
最直接的原因是，infix 表達方式無法明確辨識出哪些運算子要做用在哪些運算元上，也就是：`哪一段到哪一段內容需要先計算` <br>
而 prefix 和 postfix 的表達式則可以表示出運算子和運算元在樹狀結構裡面的父子關係

**完整的演算邏輯：**
1. 從左到右掃描 infix 表達式。
2. 如果掃描到的字符是運算元，將其放入 postfix 表達式。
3. 否則，執行以下操作：
   1. 如果掃描到的運算子的優先權(precedence)和結合性(associativity)大於 stack 中的運算子（或 stack 為空，或stack包含 `(` ），則將其推入 stack 中。注意，`^` 運算子是右結合的(但 `^` 不在第一階段的規格中，未來若要擴充的話，需注意這點)，而其他運算子如 `+`、`-`、`*` 和 `/` 則是左結合的。
      1. 特別注意當 stack 頂部的運算子和掃描到的運算子都是 `^` 時的情況。在這種情況下，由於右結合性，掃描到的運算子的優先級較高，因此將其推入運算子 stack 中。
      2. 在其他情況下，當 stack 頂部的運算子與掃描到的運算子相同時，由於左結合性，從 stack 中 pop 出運算子。如果 stack 頂部是左括號，則停止 pop 並將掃描到的運算子推入 stack 中。 
   2. 否則， pop 出所有優先級大於或等於掃描到的運算子的 stack 頂部運算子。
      1. 執行完以上操作後，將掃描到的運算子推入 stack 中。（如果在 pop 過程中遇到括號，則停止並將掃描到的運算子推入 stack 中。）
4. 如果掃描到的字符是左括號，將其推入 stack 中。
5. 如果掃描到的字符是右括號，則從 stack 中 pop 出並輸出運算子，直到遇到左括號，然後丟棄括號。
6. 重複步驟 2 至 5，直到完成 infix 的掃描。
7. 掃描結束後，從 stack 中 pop 出並 push 剩餘的運算子到 postfix 中，直到 stack 為空。
8. 最後，輸出 postfix 表達式。

以下以例子說明其演算邏輯：<br>
假設我們有一個 expression：
```
A + B * C - D
```

```
 |   |     |   |
 | A |     |   |
 └───┘     └───┘
postfix  operator
```
```
 |   |     |   |
 | A |     | + |
 └───┘     └───┘
postfix  operator
```
```
 |   |     |   |
 | B |     |   |
 | A |     | + |
 └───┘     └───┘
postfix  operator
```
```
 |   |     |   |
 | B |     | * |
 | A |     | + |
 └───┘     └───┘
postfix  operator
```
```
 |   |     |   |
 | C |     |   |
 | B |     | * |
 | A |     | + |
 └───┘     └───┘
postfix  operator
```
```
 |   |     |   |
 | + |     |   |
 | * |     |   |
 | C |     |   |
 | B |     |   |
 | A |     | - |
 └───┘     └───┘
postfix  operator
```
```
 |   |     |   |
 | D |     |   |
 | + |     |   |
 | * |     |   |
 | C |     |   |
 | B |     |   |
 | A |     | - |
 └───┘     └───┘
postfix  operator
```
```
 |   |     |   |
 | - |     |   |
 | D |     |   |
 | + |     |   |
 | * |     |   |
 | C |     |   |
 | B |     |   |
 | A |     |   |
 └───┘     └───┘
postfix  operator
```
因此我們得到一個 postfix 的表達式
```
A B C * + D -
```

*但，這部分的邏輯交由後端處理，前端只需攜帶 infix(formula string)，後端即返回解析後的 postfix(array of argument object)*


**§ 使用 postfix 來計算結果** <br>

**完整的演算邏輯：**

1. 從左到右掃描 postfix 表達式。
2. 每當遇到運算元時，將其推入 stack 。
3. 每當遇到二元運算子（`+`、`-`、`*`、`/`）時：
   1. 從 stack 中彈出兩個運算元
   2. 將這些運算元與運算子進行運算。
   3. 將結果再次推回 stack 中。
4. 重複步驟 2 至 5，直到完成 postfix 的掃描。
5. 最後，輸出計算結果。


以下以例子說明其演算邏輯：<br>
假設我們有一個 expression：
```
A B C * + D -
```

```
  |   |    |   |
  |   |    | A |
  └───┘    └───┘
 operator  operand
```
```
  |   |    |   |
  |   |    | B |
  |   |    | A |
  └───┘    └───┘
 operator  operand
```
``` 
  |   |    |   |
  |   |    | C |
  |   |    | B |
  |   |    | A |
  └───┘    └───┘
operator  operand
```
``` 
 |   |    |   |
 |   |    | C |
 |   |    | B |
 | * |    | A |
 └───┘    └───┘
operator  operand
```
```
 |   |    |     |
 |   |    | B*C |
 | + |    |  A  |
 └───┘    └─────┘
operator  operand
```
```
 |   |    |       |
 |   |    | A+B*C |
 └───┘    └───────┘
operator   operand
```
```
 |   |    |       |
 |   |    |   D   |
 |   |    | A+B*C |
 └───┘    └───────┘
operator   operand
```
```
 |   |    |       |
 |   |    |   D   |
 | - |    | A+B*C |
 └───┘    └───────┘
operator   operand
```
```
 |   |    |         |
 |   |    | A+B*C-D |
 └───┘    └─────────┘
operator    operand
```

### 實踐方法

- 由於部分 SSR 的關係，拆解的兩個步驟分別由後端和前端處理：
  1. 初始化(後端)：將 infix(formula string) 轉成 postfix (argument object)
  2. 計算(前端)：將 postfix (argument object) 中的元素 pop 出來進行計算
- postfix stack 中的單位為「參數物件(argument object)」，其中會定義該參數的運算特性
- 「函式function」視為「多元運算子」，因此在它的「參數物件(argument object)」中，還需要定義它接受的參數數量

### 參考資料
- [Convert Infix expression to Postfix expression - GeeksforGeeks](https://www.geeksforgeeks.org/convert-infix-expression-to-postfix-expression/)
- [15-200 Lecture Notes For 6-7-01](https://www.andrew.cmu.edu/course/15-200/s06/applications/ln/junk.html)
- [Expression parsing - Algorithms for Competitive Programming](https://cp-algorithms.com/string/expression_parsing.html)
- [Expression Parsing in Data Structure - TechVidvan](https://techvidvan.com/tutorials/expression-parsing-in-data-structure/)


---


## 初始請求 api 介面

### 常數定義
```javascript
const ARG_TYPE = {
    /* operand */
    number: "number", // --------- 數字
    constant: "constant", // ----- 常數字串
    item: "item", // ------------- 表單元件
    /* operator */
    function: "function", // ----- 公式
    math: "math", // ------------- 數學計算
}
```

### Input (輸入介面)
型別：`String`

該元件設定的公式字串

ex `="這是一個字串"+({1eddd92e-5ef6-6f4c-877d-0242994894d2}+SUM(2,3,4))`

#### operand 類型分析
**type: number**
- 數字
- 格式: `number` 
  - ex `100`
- type: `ARG_TYPE.number`
- op: `"operand"`
- value: number 的值  (`number`)

**type: constant**
- 字串
- 格式: 用「雙引號」標記前後，`"string"`
  - ex `"這是一個字串"`
- type: `ARG_TYPE.constant`
- op: `"operand"`
- value: constant 的值  (`string`)

**type: item**
- 表單元件
- 格式: 用「大括號」標記前後，中間是 uuid 格式的元件序號，`{item-sn}`
  - ex `{1eddd92e-5ef6-6f4c-877d-0242994894d2}`
- type: `ARG_TYPE.item`
- op: `"operand"`
- value: 表單元件的序號 (`string`)


#### operator 類型分析
**type: math**
- type: `ARG_TYPE.math`
- op: `"operator"`
- 格式: 符合以下字串
  - `+`, `-`, `*`, `/`, `=` , `<>`, `<`, `<=`, `>`, `>=`
- 說明: 前後可以是 `ARG_TYPE.number`、`ARG_TYPE.constant` 或是 `ARG_TYPE.function`

**type: function**
- type: `ARG_TYPE.function`
- op: `"operator"`
- 格式: `大寫字母( ... )`，其中若有 arguments，用 `,` 分開
  - ex: `SUM(` `)`, `AVERAGE(` `)`, `IF(` `)`, `=(` `)`
  - 


### Output (輸出介面)
型別：`Array` of `Object`

#### argument object interface
- type: argument 的類型 (`ARG_TYPE` 參考 下方類型分析)
- value: argument 的值 (參考 下方類型分析)
- op: `"operand"` 或 `"operator"`
- argCount: 若為 operator 的話，紀錄總共有幾個 operand

#### 輸出格式：
- postFix ([參考資料](https://www.geeksforgeeks.org/convert-infix-expression-to-postfix-expression/))



#### operand 類型分析
**type: number**
- 數字
- type: `ARG_TYPE.number`
- op: `"operand"`
- value: number 的值  (`number`)

**type: constant**
- 字串
- type: `ARG_TYPE.constant`
- op: `"operand"`
- value: constant 的值  (`string`)

**type: item**
- 表單元件
- type: `ARG_TYPE.item`
- op: `"operand"`
- value: 表單元件的序號 (`string`)


#### operator 類型分析
**type: math**
- `+`
  - type: `ARG_TYPE.math`
  - op: `"operator"`
  - 可接受的 argument 數量：2
  - value: `add`
  - weight: -
- `-`
  - type: `ARG_TYPE.math`
  - op: `"operator"`
  - 可接受的 argument 數量：2
  - value: `subtract`
  - weight: -
- `*`
  - type: `ARG_TYPE.math`
  - op: `"operator"`
  - 可接受的 argument 數量：2
  - value: `time`
  - weight: -
- `/`
  - type: `ARG_TYPE.math`
  - op: `"operator"`
  - 可接受的 argument 數量：2
  - value: `divide`
  - weight: -
- `=` 
  - type: `ARG_TYPE.math`
  - op: `"operator"`
  - 可接受的 argument 數量：2
  - value: `eq`
  - weight: -
- `<>` 
  - type: `ARG_TYPE.math`
  - op: `"operator"`
  - 可接受的 argument 數量：2
  - value: `neq`
  - weight: -
- `<` 
  - type: `ARG_TYPE.math`
  - op: `"operator"`
  - 可接受的 argument 數量：2
  - value: `lt`
  - weight: -
- `<=` 
  - type: `ARG_TYPE.math`
  - op: `"operator"`
  - 可接受的 argument 數量：2
  - value: `lte`
  - weight: -
- `>` 
  - type: `ARG_TYPE.math`
  - op: `"operator"`
  - 可接受的 argument 數量：2
  - value: `gt`
  - weight: -
- `>=` 
  - type: `ARG_TYPE.math`
  - op: `"operator"`
  - 可接受的 argument 數量：2
  - value: `gt`
  - weight: -


**type: function**
- `=` 
  - 等於 argument[0] 的值
  - type: `ARG_TYPE.function`
  - op: `"operator"`
  - 可接受的 argument 數量：1
  - value: `equal`
  - weight: -
- `SUM` 
  - 等於所有 argument 的加總
  - type: `ARG_TYPE.function`
  - op: `"operator"`
  - 可接受的 argument 數量：n
  - value: `sum`
  - weight: -
- `AVERGAE` 
  - 等於所有 argument 加總的平均
  - type: `ARG_TYPE.function`
  - op: `"operator"`
  - 可接受的 argument 數量：n
  - value: `average`
  - weight: -
- `IF` 
  - 若 argument[0] 成立，等於 argument[1]，否則等於 argument[2]
  - type: `ARG_TYPE.function`
  - op: `"operator"`
  - 可接受的 argument 數量：3
  - value: `if`
  - weight: -
- 其他 function 格式 (`大寫英文字母 + ( ... )`)
  - type: `ARG_TYPE.function`
  - op: `"operator"`
  - 可接受的 argument 數量：n
  - value: `大寫英文字母轉小寫`
  - weight: -

範例：
```javascript
// 輸入
const input = `=1+2*3`;

let output = infixToPostfix(input);
// ---------------------
output = [
    {
        type: ARG_TYPE.number,
        op: "operand",
        value: 1
    },
    {
        type: ARG_TYPE.number,
        op: "operand",
        value: 2
    },
    {
        type: ARG_TYPE.number,
        op: "operand",
        value: 3
    },
    {
        type: ARG_TYPE.math,
        op: "operator",
        value: "time",
        argCount: 2
    },
    {
        type: ARG_TYPE.math,
        op: "operator",
        value: "add",
        argCount: 2
    },
    {
        type: ARG_TYPE.function,
        op: "operator",
        value: "equal",
        argCount: 1
    },
]
```

```javascript
// 輸入
const input = `=1*(2+3)-4`;

let output = infixToPostfix(input);
// ---------------------
output = [
    {
        type: ARG_TYPE.number,
        op: "operand",
        value: 1
    },
    {
        type: ARG_TYPE.number,
        op: "operand",
        value: 2
    },
    {
        type: ARG_TYPE.number,
        op: "operand",
        value: 3
    },
    {
        type: ARG_TYPE.math,
        op: "operator",
        value: "add",
        argCount: 2
    },
    {
        type: ARG_TYPE.math,
        op: "operator",
        value: "time",
        argCount: 2
    },
    {
        type: ARG_TYPE.number,
        op: "operand",
        value: 4
    },
    {
        type: ARG_TYPE.math,
        op: "operator",
        value: "subtract",
        argCount: 2
    },
    {
        type: ARG_TYPE.function,
        op: "operator",
        value: "equal",
        argCount: 1
    },
]
```

```javascript
// 輸入
const input = `=SUM(10,"字串",{1eddd92e-5ef6-6f4c-877d-0242994894d2})`;

let output = infixToPostfix(input);
// ---------------------
output = [
    {
        type: ARG_TYPE.number,
        op: "operand",
        value: 10
    },
    {
        type: ARG_TYPE.constant,
        op: "operand",
        value: "字串"
    },
    {
        type: ARG_TYPE.item,
        op: "operand",
        value: "1eddd92e-5ef6-6f4c-877d-0242994894d2"
    },
    {
        type: ARG_TYPE.function,
        op: "operator",
        value: "sum",
        argCount: 3
    },
    {
        type: ARG_TYPE.function,
        op: "operator",
        value: "equal",
        argCount: 1
    },
]
```

```javascript
// 輸入
const input = `=IF({1eddd92e-5ef6-6f4c-877d-0242994894d2}>100,"超過100",AVERAGE({1eddd92e-5ef6-6f4c-877d-0242994894d2},200,500))`;

let output = infixToPostfix(input);
// ---------------------
output = [
    {
        type: ARG_TYPE.item,
        op: "operand",
        value: "1eddd92e-5ef6-6f4c-877d-0242994894d2"
    },
    {
        type: ARG_TYPE.number,
        op: "operand",
        value: 100
    },
    {
        type: ARG_TYPE.math,
        op: "operator",
        value: "gt",
        argCount: 2
    },
    {
        type: ARG_TYPE.constant,
        op: "operand",
        value: "超過100"
    },
     {
        type: ARG_TYPE.item,
        op: "operand",
        value: "1eddd92e-5ef6-6f4c-877d-0242994894d2"
    },
    {
        type: ARG_TYPE.number,
        op: "operand",
        value: 200
    },
     {
        type: ARG_TYPE.number,
        op: "operand",
        value: 500
    },
    {
        type: ARG_TYPE.function,
        op: "operator",
        value: "average",
        argCount: 3
    },
    {
        type: ARG_TYPE.function,
        op: "operator",
        value: "if",
        argCount: 3
    },
    {
        type: ARG_TYPE.function,
        op: "operator",
        value: "equal",
        argCount: 1
    },
]
```

---


## 維護指引


### 如何擴充一個公式

假設我們要新增一個函式 `AND`：如果所有引數為 TRUE，則傳回 TRUE

1. 到 `/src/constants.js` 中，在 `func` 中新增一個 `AND` 的唯一鍵值
   ```javascript
   // 可用函式
    export enum funcName {
        ...
        AND = "and", // ----------- 判斷測試中是否所有條件皆為 TRUE
    }
   ```
2. 到 `evaluation-lib.js` 中，以剛剛宣告的鍵值 `funcName.AND` 為鍵值，實作 `AND` 函數的邏輯
   ```javascript
   export default = {
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
    [funcName.AND]: (args) => {
        return args.reduce((output, arg)=> output && arg, true)
    },
   };
   ```




---


<style type="text/css" scoped>
  h1 { counter-reset: h2counter; }
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
