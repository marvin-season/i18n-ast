import parser from "@babel/parser";
import babelTraverse from "@babel/traverse";
import babelGenerate from "@babel/generator";
import types from "@babel/types";
import prettier from "prettier";

const traverse = (babelTraverse as unknown as { default: typeof babelTraverse })
  .default;
const generate = (babelGenerate as unknown as { default: typeof babelGenerate })
  .default;

const format = async (code: string) => {
  return await prettier.format(code, {
    parser: "babel",
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    useTabs: false,
    trailingComma: "es5",
    bracketSpacing: true,
    bracketSameLine: false,
  });
};

const code = `

function useApp2() {
  return ""
}

function useName2() {
  return "hi"
}

const useApp = () => {
  return ""
}

  const useName = () => "hi";
function Demo2() {
return <>{'你好'}</>;

}

  const Demo = () => {
    return <>{'你好'}</>;
  };
`;

// 使用 Babel parser 解析代码成 AST
const input = await format(code);

console.log(input);
const ast = parser.parse(input, {
  sourceType: "module",
  plugins: ["jsx", "typescript"],
});

// 遍历 AST
traverse(ast, {
  StringLiteral(path) {
    const { node, parent } = path;
    const { value } = node;
    if (parent.type === "ImportDeclaration") {
      return;
    }
    path.replaceWithSourceString('t("ask-and-learn.pqEFfz6tdJfIfuOIGqBFi")');

    // path.replaceWith(types.callExpression(types.identifier('t'), [types.stringLiteral(value)]));
    // path.replaceWith(types.stringLiteral(value + ' - i18n'));
    path.skip();
  },
  // 处理 ArrowFunctionExpression 的逻辑
  ArrowFunctionExpression(path) {
    const { parent, node } = path;

    // 判断父节点是否是一个变量声明
    if (
      parent.type === "VariableDeclarator" &&
      parent.id.type === "Identifier"
    ) {
      const functionName = parent.id.name;

      // 如果是 React 组件或 Hook，插入 useTranslation
      if (isComponentOrHook(functionName)) {
        insertUseTranslation(path, node);
      }
    }
  },

  // 处理 FunctionDeclaration 的逻辑
  FunctionDeclaration(path) {
    const { node } = path;

    // 获取函数名
    const functionName = node.id.name;

    // 如果是 React 组件或 Hook，插入 useTranslation
    if (isComponentOrHook(functionName)) {
      insertUseTranslation(path, node);
    }
  },
  // ArrowFunctionExpression(path) {
  //   const { parent, node } = path;
  //
  //   // 判断父节点是否是一个变量声明
  //   if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
  //     const functionName = parent.id.name;
  //
  //     // 判断是否是 React 组件或 Hook
  //     const isComponent = /^[A-Z]/.test(functionName);  // React 组件通常以大写字母开头
  //     const isHook = /^use[A-Z]/.test(functionName);    // Hook 以 "use" 开头
  //
  //     if (isComponent || isHook) {
  //       // 创建 const { t } = useTranslation(); 语句
  //       const tImport = types.variableDeclaration('const', [
  //         types.variableDeclarator(
  //           types.objectPattern([
  //             types.objectProperty(types.identifier('t'), types.identifier('t'), false, true)
  //           ]),
  //           types.callExpression(types.identifier('useTranslation'), [])
  //         )
  //       ]);
  //
  //       // 插入到函数体中
  //       if (node.body.type === 'BlockStatement') {
  //         // 如果函数体是大括号包裹的块级语句
  //         node.body.body.unshift(tImport);
  //       } else {
  //         // 如果是单个表达式，则转换为 BlockStatement 并插入
  //         const returnStatement = types.returnStatement(node.body);
  //         node.body = types.blockStatement([tImport, returnStatement]);
  //       }
  //     }
  //   }
  // },

  Program(path) {
    const { node } = path;
    node?.body?.unshift(
      ...parser
        .parse(
          "import { useTranslation } from 'react-i18next';\nimport {t} from 'i18n-next'",
          {
            sourceType: "module",
          },
        )
        .program.body.slice(0, 2),
    );
  },
});

// 生成代码
const { code: output } = generate(ast, { jsescOption: { minimal: true } });

// 使用 Prettier 格式化输出
console.log(await format(output));

// 插入 useTranslation 逻辑的通用函数
function insertUseTranslation(path, node) {
  // 创建 const { t } = useTranslation(); 语句
  const tImport = types.variableDeclaration("const", [
    types.variableDeclarator(
      types.objectPattern([
        types.objectProperty(
          types.identifier("t"),
          types.identifier("t"),
          false,
          true,
        ),
      ]),
      types.callExpression(types.identifier("useTranslation"), []),
    ),
  ]);

  // 插入到函数体中
  if (node.body.type === "BlockStatement") {
    // 如果函数体是大括号包裹的块级语句
    node.body.body.unshift(tImport);
  } else {
    // 如果是单个表达式，则转换为 BlockStatement 并插入
    const returnStatement = types.returnStatement(node.body);
    node.body = types.blockStatement([tImport, returnStatement]);
  }
}

// 判断是否是 React 组件或 Hook
function isComponentOrHook(functionName: string) {
  const isComponent = /^[A-Z]/.test(functionName); // React 组件通常以大写字母开头
  const isHook = /^use[A-Z]/.test(functionName); // Hook 以 "use" 开头
  return isComponent || isHook;
}
