import fs from 'fs';
import { i18nTransformPlugin } from './i18nTransformPlugin.js';
import { i18nCodeGeneratePlugin } from './i18nCodeGeneratePlugin.js';
import { i18nASTParsePlugin } from './i18nASTParsePlugin.js';

class CodeWalker {

  config = {};

  constructor(config) {
    this.config = config;
  }

  use(plugin) {
    plugin.run(this);
    return this;
  }
}


export const getCodeWalker = (src, { effective = false, logCode = true, group }) => {
  return new CodeWalker({ src, group })
    .use(i18nASTParsePlugin)
    .use(i18nTransformPlugin)
    .use(i18nCodeGeneratePlugin)
    .use({
      run({ config }) {
        if (!config.skip && logCode) {
          console.log('🚀  正在写入文件: \n', config.src);
          console.log(config.transformed.code);

        }
        effective && fs.writeFileSync(config.src, config.transformed.code);
      }
    });
};
