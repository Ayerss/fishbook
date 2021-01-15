const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const {
  pathFormat,
  isNext,
  copyFile,
  exportConf
} = require('../container/add');

module.exports = async formPath => {
  formPath = pathFormat(formPath);

  if (fs.existsSync(formPath) === false) {
    console.log(chalk.red('\u26A0 未查询到书籍!'));
    return
  }

  const extname = path.extname(formPath);

  if (extname !== '.txt') {
    console.log(chalk.red('\u26A0 不是txt文本!'));
    return
  }

  const toPath = path.join(
    global.fishbook.bookPath,
    path.basename(formPath)
  );

  const status = await isNext(toPath);

  if (!status) {
    console.log(chalk.yellow('Warning: 已中止'));
    return
  }

  const size = await copyFile(formPath, toPath);

  console.log(chalk.green(`\u{1F4E6} 复制完成`));

  const len = await exportConf(toPath, size);

  console.log(chalk.green(`\u{1F389} 识别到${len}个章节`));

  return
}
