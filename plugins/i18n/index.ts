import parser from "@babel/parser";
import babelTraverse from "@babel/traverse";
import babelGenerate from "@babel/generator";
import types from "@babel/types";
import fs from "fs";
// import {appendRecordToExcel} from "./xlsx";
import { PluginOption } from "vite";

const traverse = (babelTraverse as unknown as { default: typeof babelTraverse })
  .default;
const generate = (babelGenerate as unknown as { default: typeof babelGenerate })
  .default;

const includesChinese = (v: string) => /[\u4e00-\u9fa5]+/g.test(v);

export const i18nPlugin: () => PluginOption = () => {
  return {
    name: "i18n-plugin",
    enforce: "pre",
    configResolved() {
      console.log("i18n-plugin loaded");
    },
    transform(code, id) {
      // 过滤掉非 JavaScript/TypeScript 文件
      if (!id.match(/\.(tsx)$/)) return;

      // const code = fs.readFileSync(id, 'utf-8');

      console.log("id", id);
      console.log(code);

      // 使用 Babel parser 解析代码成 AST
      const ast = parser.parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
      });

      traverse(ast, {
        JSXText(path) {
          const { node, parent } = path;
          const { value } = node;
          if (includesChinese(node.value)) {
            path.replaceWith(
              types.jsxExpressionContainer({
                ...types.stringLiteral(node.value),
                loc: node.loc,
              }),
            );
            return;
          }
          path.skip();
        },
        TemplateLiteral: function (path) {
          const { node } = path;
          const { expressions, quasis } = node;
          // todo 获取所有quasis中value 不为空和数字的, 如果不为末尾,记录前面有几个''
          let enCountExpressions = 0;
          quasis.forEach((node, index) => {
            const {
              value: { raw },
              tail,
            } = node;
            if (!includesChinese(raw)) {
            } else {
              let newCall = types.stringLiteral(raw);
              expressions.splice(index + enCountExpressions, 0, {
                ...newCall,
                loc: node.loc,
              });
              enCountExpressions++;
              node.value = {
                raw: "",
                cooked: "",
              };
              // 每增添一个表达式都需要变化原始节点,并新增下一个字符节点
              quasis.push(
                types.templateElement(
                  {
                    raw: "",
                    cooked: "",
                  },
                  false,
                ),
              );
            }
          });
          quasis[quasis.length - 1].tail = true;
        },
        StringLiteral(path) {
          const { node, parent } = path;
          const originalValue = node.value;

          if (!includesChinese(originalValue)) {
            return;
          }

          console.log("originalValue", originalValue);
          const fileName = id
            .replace(/^(.*)(src.*)$/, "$2")
            .replace(/\//g, "#");
          const position = `${node.loc?.start.line}#${node.loc?.start.column}`;

          // 构造新的字符串，包含文件名称和位置信息
          const newValue = `${originalValue} [${fileName}#${position}]`;
          const newNode = types.stringLiteral(newValue);

          path.replaceWithSourceString(`t('common.api.success')`);
          // 替换原来的字符串节点

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
            if (node.body.type === "BlockStatement") {
              node.body.body?.unshift(
                parser.parse("const { t } = useTranslation()").program.body[0],
              );
            }
          }
        },
        Program(path) {
          const { node } = path;
          if (
            node.body.find(
              (item) =>
                item.type === "ImportDeclaration" &&
                ["react-i18next", "i18next"].includes(item.source.value),
            )
          ) {
            return;
          }
          node?.body?.unshift(
            ...parser
              .parse(
                "import { useTranslation } from 'react-i18next';\nimport {t} from 'i18next';",
                {
                  sourceType: "module",
                },
              )
              .program.body.slice(0, 2),
          );
        },
      });

      // 生成新的代码
      const output = generate(ast, {}, code);

      return {
        code: output.code,
        map: output.map,
      };
    },
  };
};
