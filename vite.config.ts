import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import types from '@babel/types';
import fs from 'fs'

const includesChinese = v => /[\u4e00-\u9fa5]+/g.test(v);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        {
            name: 'i18n-plugin',
            configResolved() {
                console.log('i18n-plugin loaded');
            },
            load(id) {
                // 过滤掉非 JavaScript/TypeScript 文件
                if (!id.match(/\.(tsx)$/)) return;

                const code = fs.readFileSync(id, 'utf-8');

                console.log('id', id)
                // 使用 Babel parser 解析代码成 AST
                const ast = parser.parse(code, {
                    sourceType: 'module',
                    plugins: ['jsx', "typescript"],
                });

                traverse.default(ast, {
                    JSXText(path) {
                        const {node, parent} = path;
                        const {value} = node;
                        if (includesChinese(node.value)) {
                            path.replaceWith(types.jsxExpressionContainer({ ...types.stringLiteral(node.value), loc: node.loc}))
                            return
                        }
                        path.skip()
                    },
                    StringLiteral(path) {
                        const {node, parent} = path;
                        const originalValue = node.value;

                        if (!includesChinese(originalValue)) {
                            return
                        }

                        console.log('originalValue', originalValue);
                        const fileName = id.replace(/^(.*)(src.*)$/, '$2').replace(/\//g, '#')
                        const position = `${node.loc?.start.line}#${node.loc?.start.column}`;

                        // 构造新的字符串，包含文件名称和位置信息
                        const newValue = `${originalValue}#${fileName}#${position}`;
                        const newNode = types.stringLiteral(newValue);

                        // 替换原来的字符串节点
                        path.replaceWith(newNode);
                        // 替换原来的字符串节点

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
