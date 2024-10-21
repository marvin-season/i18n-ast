import parser from "@babel/parser";
import babelGenerate from "@babel/generator";
import { test } from "vitest";

test("index", () => {
  const ast = parser.parse("const a = 1;");

  console.log(babelGenerate(ast).code);
});
