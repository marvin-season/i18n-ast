import { test } from "vitest";
import parser from "@babel/parser";
import babelTraverse from "@babel/traverse";
import babelGenerate from "@babel/generator";
import types from "@babel/types";
import traverse from "@babel/traverse";
import generate from "@babel/generator";

const code = `
function getName() {
  return "hello";
}
`;

test("ast_empty__code", () => {
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
  traverse(ast, {

  })

  const output = generate(ast, { jsescOption: { minimal: true } });

  console.log('output code\n', output.code);
})