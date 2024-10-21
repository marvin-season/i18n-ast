import { test } from "vitest";
import parser from "@babel/parser";
import babelTraverse from "@babel/traverse";
import babelGenerate from "@babel/generator";
import types from "@babel/types";

const code = `
function getName() {
  return "hello";
}
`;

test("func2arrow", async () => {
  const ast = parser.parse(code, { plugins: [] });

  babelTraverse(ast, {
    FunctionDeclaration(path) {
      const { node } = path;
      console.log(node.type);
      path.replaceWith(
        types.variableDeclaration("const", [
          types.variableDeclarator(
            types.identifier(node.id?.name || 'aaa'), // variable 'a'
            types.arrowFunctionExpression(node.params, node.body, node.async), // arrow function
          ),
        ]),
      );
    },
  });

  const output = babelGenerate(ast);
  console.log(output.code);
});
