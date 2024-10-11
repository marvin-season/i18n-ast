import babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import types from '@babel/types';
import {nanoid} from 'nanoid';

const t = types;
const includeSpace = v => /[\f\r\t\n\s]/.test(v);
const includesChinese = v => /[\u4e00-\u9fa5]+/g.test(v);
const extractChinese = str => str.match(/[\u4e00-\u9fa5]+/g);

export const i18nTransformPlugin = {
    run: ({ast, config}) => {
        const chineseCollections = [];
        const stringSets = new Set();

        traverse.default(ast, {
            TSEnumMember(path) {
                const {node} = path;
            },
            StringLiteral(path) {
                const {parent, node} = path;
                if (!['LogicalExpression', 'ConditionalExpression', 'JSXExpressionContainer'].includes(parent.type)) {
                    path.skip();
                    return
                }

                if (includesChinese(node.value)) {
                    if (t.isJSXAttribute(parent)) {
                        // 转换成string
                        path.replaceWith(t.jsxExpressionContainer(t.stringLiteral(node.value)))
                        return
                    } else {
                        const timestamp = Date.now();
                        let collection = chineseCollections.find(item => item.spec === node.value);
                        // 相同字符串只记录一次
                        if (!collection) {
                            collection = {
                                id: nanoid(),
                                spec: node.value,
                                zh: node.value + 'zh lang',
                                en: node.value + 'en lang'
                            };
                            chineseCollections.push(collection)
                        }

                        path.replaceWithSourceString(`t('${config.group}.${collection.id}')`)
                    }
                }
                path.skip()
            },
            ImportDeclaration(path) {
                path.node.specifiers.forEach((specifier) => {
                    if (t.isImportSpecifier(specifier) || t.isImportDefaultSpecifier(specifier) || t.isImportNamespaceSpecifier(specifier)) {
                    }
                });
            },
            JSXText(path) {
                const {node, parent} = path;
                const {value} = node;
                if (includesChinese(node.value)) {
                    path.replaceWith(t.jsxExpressionContainer(t.stringLiteral(node.value)))
                    return
                }
                path.skip()
            },
            Identifier(path) {
                const {parent, node} = path;
                if (t.isJSXExpressionContainer(parent)) {
                    if (!stringSets.has(node.name)) {
                        return
                    }
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
                        let newCall = t.stringLiteral(raw);
                        expressions.splice(index + enCountExpressions, 0, newCall);
                        enCountExpressions++;
                        node.value = {
                            raw: '', cooked: '',
                        };
                        // 每增添一个表达式都需要变化原始节点,并新增下一个字符节点
                        quasis.push(t.templateElement({
                            raw: '', cooked: '',
                        }, false,),);
                    }
                });
                quasis[quasis.length - 1].tail = true;
            },
            ReturnStatement(path) {
                const {parent, node} = path
            },
            Program(path) {
                const {parent, node} = path

                const i18ned = node.body.find((item) => item.type === 'ImportDeclaration' && item.source?.value === 'react-i18next' || item.source?.value === 'i18next');
                if (i18ned) {
                    config.skip = true;
                    path.skip();
                    return;
                }
                node?.body?.unshift(babelParser.parse("import {t} from 'i18next';", {sourceType: 'module'}).program.body[0])
            }
        });
        config.chineseCollections = chineseCollections;
    }

}
