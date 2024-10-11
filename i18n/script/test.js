import types from '@babel/types';
import generator from "@babel/generator";
import traverse_ from '@babel/traverse';
import {parse} from "@babel/parser";

const generate = generator.default
const traverse = traverse_.default

const code = `

function add(foo, bar) {
    return foo + bar
}
`

const ast = parse(code)
traverse(ast, {
    enter: function enter(path) {
        const node = path.node
    },
    FunctionDeclaration(path) {
        const firstParams = path.get('params.0')
        if (firstParams == null) {
            return
        }

        const name = firstParams.node.name
        // 递归遍历，这是插件常用的模式。这样可以避免影响到外部作用域
        path.traverse({
            Identifier(path) {
                if (path.node.name === name) {
                    path.replaceWith(types.identifier('axxxx'))
                    path.skip();
                }
            }
        })
    }
})

console.log(generate(ast).code)