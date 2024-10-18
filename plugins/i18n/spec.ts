import parser from '@babel/parser';
import babelTraverse from '@babel/traverse';
import babelGenerate from '@babel/generator';
import types from '@babel/types';
import prettier from 'prettier';

const traverse = (babelTraverse as unknown as { default: typeof babelTraverse; }).default;
const generate = (babelGenerate as unknown as { default: typeof babelGenerate; }).default;

const format = async (code: string) => {
    return await prettier.format(code, {
        parser: 'babel', semi: true,
        singleQuote: true,
        tabWidth: 2,
        useTabs: false,
        trailingComma: 'es5',
        bracketSpacing: true,
        bracketSameLine: false,
    });
}

const code = `
    
export const App = () => {
    return <>
        <div
            className={'app'}
            data-name={'aaa'}
        >
        
            {'驾驶舱'}
        </div>
    </>
}
`

// 使用 Babel parser 解析代码成 AST
const input = await format(code);

console.log(input)
const ast = parser.parse(input, {
    sourceType: 'module',
    plugins: ['jsx', "typescript"],
})

// 遍历 AST
traverse(ast, {
    StringLiteral(path) {
        const {node, parent} = path;
        const {value} = node;
        path.replaceWith(types.stringLiteral(value + ' - i18n'))
        path.skip()

    },
})

// 生成代码
const {code: output} = generate(ast, {jsescOption: {minimal: true}});

// 使用 Prettier 格式化输出
console.log(await format(output))

