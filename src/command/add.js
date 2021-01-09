const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const chardet = require('chardet');
const iconv = require('iconv-lite');
const loading = require('../utils/loading');
const identifyChapter = require('../utils/identifyChapter');
const saveConf = require('../utils/saveConf');
const _fs = require('../utils/fs-promise');

const log = console.log;

module.exports = function (formPath) {
  const isRelativePath = formPath.indexOf('/') === 0 ? false : true;

  if (isRelativePath) {
    formPath = path.join(process.cwd(), formPath);
  }

  if (fs.existsSync(formPath) === false) {
    log(chalk.red('\u26A0 未查询到书籍!'));
    return
  }

  const extname = path.extname(formPath);
  if (extname !== '.txt') {
    log(chalk.red('\u26A0 不是txt文本!'));
    return
  }

  const toPath = path.join(
    global.fishBook.bookPath,
    path.basename(formPath)
  );

  if (fs.existsSync(toPath)) {
    require('inquirer').prompt({
      type: 'confirm',
      name: 'status',
      message: '书籍已存在，是否替换？',
      default: true
    }).then(answers => {
      if (answers.status) {
        parsed(formPath, toPath);
      } else {
        log(chalk.yellow('Warning: 已中止'));
      }
    });
  } else {
    parsed(formPath, toPath);
  }
}

async function copyFile(formPath, toPath) {
  const encoding = await chardet.detectFile(formPath);
  let data = await _fs.readFile(formPath);
  if(encoding === "Big5" || encoding === "GB18030" ){
    data = iconv.decode(data, 'gbk');
  } else if(encoding === 'UTF-8') {

  } else {
    return new Error(`不支持${encoding}编码`);
  }
  await _fs.writeFile(toPath, data);
  return Buffer.byteLength(data);
}

function parsed(formPath, toPath) {
  const load = loading();

  copyFile(formPath, toPath)
    .then((size) => {
      load.close();
      log(chalk.green(`\u{1F4E6} 复制完成`));

      exportConf(toPath, size);
    })
    .catch(err => {
      load.close();
      log(chalk.red(err.message));
    });
}

function exportConf (toPath, size) {
  const conf = require(global.fishBook.bookshelfPath);
  const filename = path.basename(toPath).replace('.txt', '');
  const chapterPath = path.join(global.fishBook.chapterPath, filename + '.json');
  // const load = loading();
  console.time('\u23F1');
  identifyChapter(toPath)
    .then(chapter => {
      saveConf(chapterPath, chapter);
      return chapter.length;
    })
    .then(chapterLength => {
      console.timeEnd('\u23F1');
      conf.current = filename;
      conf.book[filename] = {
        name: filename,
        path: toPath,
        chapterPath,
        chapterLength,
        current: 0,
        total: size
      };
      saveConf(global.fishBook.bookshelfPath, conf);
      // load.close();
      log(chalk.green(`\u{1F389} 识别到${chapterLength}个章节`));
    })
    .catch(err => {
      log(chalk.red(err.message));
    });
}

