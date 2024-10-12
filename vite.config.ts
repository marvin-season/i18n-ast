import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import parser from '@babel/parser';
import traverse, {cache} from '@babel/traverse';
import generate from '@babel/generator';
import types from '@babel/types';
import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx';

const outputFilePath = path.resolve('./i18n.xlsx');

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
                            path.replaceWith(types.jsxExpressionContainer({
                                ...types.stringLiteral(node.value),
                                loc: node.loc
                            }))
                            return
                        }
                        path.skip()
                    },
                    TemplateLiteral: function (path) {
                        const {node} = path;
                        const {expressions, quasis} = node;
                        // todo 获取所有quasis中value 不为空和数字的, 如果不为末尾,记录前面有几个''
                        let enCountExpressions = 0;
                        quasis.forEach((node, index) => {
                            const {
                                value: {raw}, tail,
                            } = node;
                            if (!includesChinese(raw)) {
                            } else {
                                let newCall = types.stringLiteral(raw);
                                expressions.splice(index + enCountExpressions, 0, {...newCall, loc: node.loc});
                                enCountExpressions++;
                                node.value = {
                                    raw: '', cooked: '',
                                };
                                // 每增添一个表达式都需要变化原始节点,并新增下一个字符节点
                                quasis.push(types.templateElement({
                                    raw: '', cooked: '',
                                }, false,),);
                            }
                        });
                        quasis[quasis.length - 1].tail = true;
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
                        const newValue = `${originalValue} [${fileName}#${position}]`;
                        const newNode = types.stringLiteral(newValue);
                        // 将信息写入到excel中
                        // Example usage
                        const newRecord = {fileName, originalValue, newValue};
                        appendRecordToExcel(newRecord);
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

const appendRecordToExcel = (record) => {
    let workbook;
    if (fs.existsSync(outputFilePath)) {
        // Load the existing workbook
        workbook = XLSX.readFile(outputFilePath);
    } else {
        // Create a new workbook
        workbook = XLSX.utils.book_new();
    }

    // Get the first sheet or create a new one
    let sheetName = 'sheet1';
    let worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
        worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    // Convert the worksheet to JSON to append the new record
    const sheetData = XLSX.utils.sheet_to_json(worksheet);
    sheetData.push(record);

    // Convert the JSON back to a worksheet
    const newWorksheet = XLSX.utils.json_to_sheet(sheetData);
    workbook.Sheets[sheetName] = newWorksheet;

    // Write the updated workbook to file
    XLSX.writeFile(workbook, outputFilePath);
};