import {
  NuformulaLanguage,
  nuLint,
  nuformulaEvaluation,
} from "../dist/index.js";
import { fileTests } from "@lezer/generator/dist/test";
import { fileURLToPath } from "url";
import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";

// 測試 lezer grammar
let languageTestCase = "language.txt";
let languageTest = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  languageTestCase
);

describe("language", () => {
  for (let { name, run } of fileTests(
    fs.readFileSync(languageTest, "utf8"),
    languageTestCase
  ))
    it(name, () => run(NuformulaLanguage.parser));
});

// 測試 linter
const { default: linterTestCase } = await import("./linter.json", {
  assert: { type: "json" },
});
describe("linter", () => {
  Object.entries(linterTestCase).forEach(([name, cases]) => {
    describe(name, () => {
      cases.forEach((test) => {
        const { text, result } = test;
        it(text, () => {
          const answer = nuLint.verify(text);
          assert.equal(JSON.stringify(answer), JSON.stringify(result));
        });
      });
    });
  });
});

// 測試 evaluation
const { default: evaluationTestCase } = await import("./evaluation.json", {
  assert: { type: "json" },
});

const mockItemSn = (c) =>
  "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".replace(/x/g, c);

const formItems = {
  [`input-${mockItemSn("a")}`]: {
    sn: `input-${mockItemSn("a")}`,
    type: "input",
    options: { label: "商品名稱" },
  },
  [mockItemSn("b")]: {
    sn: mockItemSn("b"),
    type: "number",
    options: { label: "商品單價" },
  },
  [mockItemSn("c")]: {
    sn: mockItemSn("c"),
    type: "number",
    options: { label: "商品數量" },
  },
};
nuformulaEvaluation.init(formItems);
describe("evaluation", () => {
  Object.entries(evaluationTestCase).forEach(([name, cases]) => {
    describe(name, () => {
      cases.forEach((test) => {
        const { formula, answer, postfix } = test;
        it(formula, () => {
          const evaMethod = nuformulaEvaluation.getEvaluation(postfix);
          const result = evaMethod({
            [`input-${mockItemSn("a")}`]: "蘋果",
            [mockItemSn("b")]: 25,
            [mockItemSn("c")]: 30,
          });
          assert.equal(result, answer === "NaN" ? NaN : answer);
        });
      });
    });
  });
});
