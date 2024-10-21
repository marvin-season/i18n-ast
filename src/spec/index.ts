import parser from "@babel/parser";
import babelGenerate from "@babel/generator";

const ast = parser.parse('const a = 1;');

console.log(babelGenerate(ast).code);