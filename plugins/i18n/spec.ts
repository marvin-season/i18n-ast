import parser from "@babel/parser";
import babelTraverse from "@babel/traverse";
import babelGenerate from "@babel/generator";
import types from "@babel/types";
import prettier from "prettier";
import { t } from "i18next";
import "../../i18n";

const traverse = (babelTraverse as unknown as { default: typeof babelTraverse })
  .default;
const generate = (babelGenerate as unknown as { default: typeof babelGenerate })
  .default;

console.log(t("common.api.success"));

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
    
    
export const getApp = () => {
};

export const useApp = () => {
  return 
}

export function getAge(){
  return 18;
}

export function useAge(){
  return 18;
}
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
  FunctionDeclaration(path) {
    const { parent, node } = path;
    const identifier = parent.id;
    if (identifier?.name.startsWith("use")) {
      node.body.body.unshift(
        parser.parse("const { t } = useTranslation()").program.body[0],
      );
    }
  },

  ArrowFunctionExpression(path) {
    const { parent, node } = path;
    const identifier = parent.id;
    if (identifier?.name.startsWith("use")) {
      node.body.body.unshift(
        parser.parse("const { t } = useTranslation()").program.body[0],
      );
    }
  },
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
