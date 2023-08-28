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
      - [syntax grammar](#syntax-grammar-1)
      - [linter](#linter-1)

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

以註冊好的字串 `funcName.ADD` 為鍵值，實作運算邏輯


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

擴充參數數量限制的驗證：因為 `ADD` 方法沒有限制參數數量，所以可以做以下的調整
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
