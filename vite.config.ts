import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import babel from '@babel/core';
import parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        {
            name: 'i18n-plugin',
            configResolved() {
                console.log('i18n-plugin loaded');
            },
            transform(code, id) {
                // 过滤掉非 JavaScript/TypeScript 文件
                if (!id.match(/\.(tsx)$/)) return;
                console.log('id', id)
                // 使用 Babel parser 解析代码成 AST
                const ast = parser.parse(code, {
                    sourceType: 'module',
                    plugins: ['jsx'],
                });

                traverse.default(ast, {
                    StringLiteral(path) {
                        path.skip();
                    },
                });

                // 生成新的代码
                const output = generate.default(ast, {}, code);

                return {
                    code: output.code,
                    map: output.map,
                };
            }
        },
        react()
    ],
})
