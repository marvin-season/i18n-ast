import path from 'path';
import fs from 'fs';
import { getCodeWalker } from './CodeWalker.js';

const args = process.argv.slice(2);

const dirs = args[0];
if (!dirs) {
  console.log('🚀  ', '请输入要处理的文件夹，例如: ./src/a:./src/b');
  process.exit(1)
}
const group = 'ask-and-learn'
const excludesFile = ['App.tsx', 'main.tsx']
const excludeFilepath = ['src/components/NavBar']
const chineseCollections = [];

const processedFile = new Set();

const walk = (dir, parentRoute, deep) => {
  if (deep >= 10) {
    return;
  }
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (excludeFilepath.includes(filePath)) {
        console.log('🚀  跳过文件夹： ===========>', filePath);
        return;
      }
      walk(filePath, path.join(parentRoute, file), deep + 1);
    } else if (/\.(tsx|jsx)$/.test(file)) {
      if (excludesFile.includes(file)) {
        return;
      }
      const path = parentRoute + '/' + file;
      console.log('🚀  开始处理： ===========>', path);

      const codeWalker = getCodeWalker(path, { effective: false, logCode: true, group });
      codeWalker.use({
        run({ config }) {
          config.chineseCollections?.length > 0 && chineseCollections.push({
            group,
            path,
            collections: config.chineseCollections
          });
          !config.skip && processedFile.add(path);
        }
      });
        if (codeWalker.config.skip) {
            console.log('🚀  跳过处理： ===========>', path);
        } else {
            console.log('🚀  完成处理： ===========>', path);
        }
    }
  });
};
const walkBatches = (dirs) => {
  console.log('🚀  处理以下目录： ===========>', dirs);
  dirs.forEach(d => {
    walk(d, d, 0);
  });
  console.log('🚀  文件处理完成：===========>', processedFile.size);
  fs.writeFileSync('i18n/translations.json', JSON.stringify(chineseCollections, null, 2), 'utf8');
};

walkBatches(dirs.split(':'));
