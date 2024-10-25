import { PluginOption } from "vite";
import parser from "@babel/parser";
import astTraverse from "../scripts/astTraverse.mjs";
// @ts-ignore
import generate from "@babel/generator";
import * as fs from "node:fs";

console.log(astTraverse);
const isValid = (id: string) => {
  return (
    id.match(/\.(tsx|ts)$/) && id.match(/.*src\/(components|pages|hooks).*/)
  );
};

export const i18nPlugin: () => PluginOption = () => {
  let isBuild = false;
  const translationRecords: Array<{ key: string; text: string; en: string }> =
    [];
  return {
    name: "i18n",
    enforce: "pre",
    transform(code, id) {
      if (!isBuild || !isValid(id)) {
        return { code };
      }

      console.log("valid id", id);
      // 使用 Babel parser 解析代码成 AST
      const ast = parser.parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
      });

      astTraverse(ast, id, translationRecords);

      // 生成新的代码
      const output = generate.default(ast, {
        jsescOption: {
          minimal: true,
        },
      });
      // fs.writeFileSync(id, output.code, "utf-8");
    },
  };
};
