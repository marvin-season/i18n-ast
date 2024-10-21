import parser from "@babel/parser";
import babelGenerate from "@babel/generator";

const ast = parser.parse('');

console.log(babelGenerate(ast).code);