import parser from '@babel/parser';
import babelTraverse from '@babel/traverse';
import babelGenerate from '@babel/generator';
import types from '@babel/types';
import prettier from 'prettier';
import { t } from 'i18next';
import '../../i18n';

const traverse = (babelTraverse as unknown as { default: typeof babelTraverse })
  .default;
const generate = (babelGenerate as unknown as { default: typeof babelGenerate })
  .default;

console.log(t('common.api.success'));

const format = async (code: string) => {
  return await prettier.format(code, {
    parser: 'babel',
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    useTabs: false,
    trailingComma: 'es5',
    bracketSpacing: true,
    bracketSameLine: false,
  });
};

const code = `
    
export const App = () => {
    const type = useType(); // external
    const Color =  {
      RED : '红色',
    }

    
    return (
      <>
        {
            type === Color.RED ? <div>{'红色'}</div> : <div>{'蓝色'}</div>
        }   
    </>
    );
};
`;

// 使用 Babel parser 解析代码成 AST
const input = await format(code);

console.log(input);
const ast = parser.parse(input, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript'],
});

// 遍历 AST
traverse(ast, {
  StringLiteral(path) {
    const { node, parent } = path;
    const { value } = node;
    if (parent.type === 'ImportDeclaration') {
      return;
    }
    path.replaceWith(types.stringLiteral(value + ' - i18n'));
    path.skip();
  },
  ReturnStatement(path) {
    const { parent, node } = path;
    // @ts-ignore
    parent?.body?.unshift(
      parser.parse('const { t } = useTranslation()').program.body[0]
    );
  },
  Program(path) {
    const { parent, node } = path;
    node?.body?.unshift(
      parser.parse("import { useTranslation } from 'react-i18next';", {
        sourceType: 'module',
      }).program.body[0]
    );
  },
});

// 生成代码
const { code: output } = generate(ast, { jsescOption: { minimal: true } });

// 使用 Prettier 格式化输出
console.log(await format(output));
