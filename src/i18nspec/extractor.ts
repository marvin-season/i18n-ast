import parser from "@babel/parser";
import babelTraverse from "@babel/traverse";
import babelGenerate from "@babel/generator";
import types from "@babel/types";
import fs from "fs";
import path from "path";

const traverse = (babelTraverse as unknown as { default: typeof babelTraverse })
  .default;
const generate = (babelGenerate as unknown as { default: typeof babelGenerate })
  .default;

const code = fs.readFileSync(path.resolve("./demo.tsx"), "utf8");

const ast = parser.parse(code, {
  sourceType: "module",
  plugins: ["jsx"],
});

// 用于存储新 Hook 的声明
let useDataDeclaration = null;

// 收集在非函数作用域中的变量
const collectedVars = [];

// 遍历 AST 收集变量并替换使用
traverse(ast, {
  VariableDeclaration(path) {
    const { node } = path;
    node.declarations.forEach((declaration) => {
      if (declaration.id.type === "Identifier") {
        collectedVars.push({
          name: declaration.id.name,
          value: declaration.init,
        });
      }
    });
    path.remove(); // 移除原来的变量声明
  },
  Identifier(path) {
    if (collectedVars.some((varInfo) => varInfo.name === path.node.name)) {
      // 创建对 useData的调用
      const useDataCall = types.callExpression(
        types.identifier("useConfigData"),
        [],
      );
      const varAccess = types.memberExpression(
        useDataCall,
        types.identifier(path.node.name),
      );
      path.replaceWith(varAccess);
    }
  },
});

// 创建新的 useData Hook
if (collectedVars.length > 0) {
  const variableDeclarations = collectedVars.map((varInfo) =>
    types.variableDeclaration("const", [
      types.variableDeclarator(types.identifier(varInfo.name), varInfo.value),
    ]),
  );
  // 构建返回对象的属性
  const returnObjectProperties = collectedVars.map((varInfo) =>
    types.objectProperty(
      types.identifier(varInfo.name),
      types.identifier(varInfo.name),
    ),
  );

  useDataDeclaration = types.variableDeclaration("const", [
    types.variableDeclarator(
      types.identifier("useHook"),
      types.arrowFunctionExpression(
        [],
        types.blockStatement([
          ...variableDeclarations,
          types.returnStatement(types.objectExpression(returnObjectProperties)),
        ]),
      ),
    ),
  ]);
}

// 在 AST 的开头插入 useData Hook
if (useDataDeclaration) {
  ast.program.body.unshift(useDataDeclaration);
}

// 确保不再将函数放入 useData 中
// traverse(ast, {
//   ArrowFunctionExpression(path) {
//     const { node } = path;
//     // 找到用到 useConfig 的地方，移除相关函数
//     if (node.body && types.isJSXFragment(node.body)) {
//       // 这里只替换 JSX 里的使用
//       const body = path.get('body');
//       body.replaceWith(
//         types.jsxFragment(
//           types.jsxOpeningFragment(),
//           types.jsxClosingFragment(),
//           [types.jsxExpressionContainer(
//             types.memberExpression(
//               types.callExpression(types.identifier('useConfigData'), []),
//               types.identifier('config')
//             )
//           )]
//         )
//       );
//     }
//   }
// });

// 生成新的代码
const output = generate(ast).code;

fs.writeFileSync(path.resolve("./demo_.tsx"), output);
