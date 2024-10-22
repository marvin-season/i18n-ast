import { test } from "vitest";
import parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";

const input = `
  const Demo = () => {
    return <>你好</>;
  };
`;


test("i18n", async () => {
  const ast = parser.parse(input, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  traverse(ast, {
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
    // Program(path) {
    //   const { node } = path;
    //   node?.body?.unshift(
    //     ...parser
    //       .parse(
    //         "import { useTranslation } from 'react-i18next';\nimport {t} from 'i18n-next'",
    //         {
    //           sourceType: "module",
    //         },
    //       )
    //       .program.body.slice(0, 2),
    //   );
    // },
  });

  // 生成代码
  const output = generate(ast, { jsescOption: { minimal: true } });

  console.log('output\n', output);
});
