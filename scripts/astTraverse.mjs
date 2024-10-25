import parser from "@babel/parser";
import babelTraverse from "@babel/traverse";
import types from "@babel/types";

const traverse = babelTraverse.default;

const includesChinese = (v) => /[\u4e00-\u9fa5]+/g.test(v);

const i18nImportModules = ["react-i18next", "i18next"];
const i18nCalleeName = "useTranslation";

function insertUseTranslation(path, node) {
  // 插入到函数体中
  if (node.body.type === "BlockStatement") {
    const find = node.body.body.find((item) => {
      return item.declarations?.some((declaration) => {
        return (
          declaration.type === "VariableDeclarator" &&
          declaration.init.type === "CallExpression" &&
          declaration.init.callee.name === i18nCalleeName
        );
      });
    });
    if (find) {
      return;
    }
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
    // 如果函数体是大括号包裹的块级语句
    node.body.body.unshift(tImport);
  } else {
    // 如果是单个表达式，则转换为 BlockStatement 并插入
    const returnStatement = types.returnStatement(node.body);
    node.body = types.blockStatement([tImport, returnStatement]);
  }
}

// 判断是否是 React 组件或 Hook
function isComponentOrHook(functionName) {
  const isComponent = /^[A-Z]/.test(functionName); // React 组件通常以大写字母开头
  const isHook = /^use[A-Z]/.test(functionName); // Hook 以 "use" 开头
  return isComponent || isHook;
}

export default function astTraverse(ast, id, translationRecords) {
  let index = 0;
  // 将匹配到的类型转换为 StringLiteral,在 StringLiteral中统一对中文进行处理
  traverse(ast, {
    JSXText(path) {
      const { node } = path;

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
      // convert `hello ${name} world` to `${'hello'} ${name} ${'world'}`
      // ast: [a,b,a] => [a,b,a,b,a,b,a], a: 空隙或者字符串, b: 表达式
      let enCountExpressions = 0;
      quasis.forEach((node, index) => {
        const {
          value: { raw },
        } = node;
        if (!includesChinese(raw)) {
          // nothing
        } else {
          const newCall = types.stringLiteral(raw);
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

      // 排除 中文枚举 key
      if (parent.type === "TSEnumMember" && node === parent.id) {
        return;
      }

      // tag of the chinese string
      const fileName = id
        .replace(/^(.*)(src)(.*)(.tsx|.ts)$/, "$3")
        .replace(/\//g, "$");
      const key = `${fileName}${index++}`;
      const value = originalValue?.trim();

      translationRecords.push({
        key,
        text: value,
        en: value + "_en",
      });
      if (types.isJSXAttribute(parent)) {
        // path.skip()
        // 转换成string
        path.replaceWith(
          types.jsxExpressionContainer(types.stringLiteral(node.value)),
        );
        return;
      } else {
        path.replaceWithSourceString(`t("common.${key}")`);
      }
      path.skip();
    },
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
    Program(path) {
      const { node } = path;
      const importDeclarations = node.body?.filter(
        (item) => item.type === "ImportDeclaration",
      );
      const find = importDeclarations?.find((item) =>
        i18nImportModules.includes(item.source.value),
      );
      if (!find) {
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
      }
    },
  });
}
