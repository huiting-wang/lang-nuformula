import { NuformulaLanguage, nuLint, nuformulaEvaluation } from "../dist/index.js";
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
          assert.equal(answer, result);
        });
      });
    });
  });
});

// 測試 evaluation
const { default: evaluationTestCase } = await import("./evaluation.json", {
  assert: { type: "json" },
});
describe("evaluation arithmetic", () => {
  Object.entries(evaluationTestCase).forEach(([name, cases]) => {
    describe(name, () => {
      cases.forEach((test) => {
        const { formula, answer, postfix } = test;
        it(formula, () => {
          const evaMethod = nuformulaEvaluation.getEvaluation(postfix);
          const result = evaMethod({});
          assert.equal(result, answer === "NaN" ? NaN : answer);
        });
      });
    });
  });
});
