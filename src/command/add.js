const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const loading = require(global.fishBook.srcPath + '/utils/loading.js');
const identifyChapter = require(global.fishBook.srcPath + '/utils/identifyChapter.js');
const saveConf = require(global.fishBook.srcPath + '/utils/saveConf.js');

const log = console.log;

module.exports = function (formPath) {

  if (fs.existsSync(formPath) === false) {
    log(chalk.red('\u26A0  未查询到书籍!'));
    return
  }

  const extname = path.extname(formPath);
  if (extname !== '.txt') {
    log(chalk.red('\u26A0  不是txt文本!'));
    return
  }

  const toPath = path.resolve(
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

function copyFile(formPath, toPath) {
  const readable = fs.createReadStream(formPath);

  const writable = fs.createWriteStream(toPath);

  readable.pipe(writable);

  return new Promise((resolve, reject) => {

    readable.on('end', () => {
      writable.close();
    });

    readable.on('error', (e) => {
      reject(e.message);
    });

    writable.on('close', () => {
      resolve();
    });

  });
}

function parsed(formPath, toPath) {
  const load = loading();

  copyFile(formPath, toPath)
    .then(() => {
      load.close();
      log(chalk.green(`\u{1F4E6} 复制完成`));
    })
    .then(() => {
      exportConf(toPath);
    })
    .catch(err => {
      load.close();
      log(chalk.red('Error:' + err));
    });
}

function exportConf (toPath) {
  const conf = require(global.fishBook.confPath);
  const load = loading();
  const filename = path.basename(toPath).replace('.txt', '');
  const chapterPath = path.resolve(global.fishBook.chapterPath, filename + '.json');

  identifyChapter(toPath)
    .then(chapter => {
      saveConf(chapterPath, chapter);
      return chapter.length;
    })
    .then(chapterLength => {
      const stats = fs.statSync(toPath);
      conf.current = filename;
      conf.book[filename] = {
        name: filename,
        path: toPath,
        chapterPath,
        chapterLength,
        current: 0,
        total: stats.size
      };
      saveConf(global.fishBook.confPath, conf);
      load.close();
      log(chalk.green(`\u2728  识别到${chapterLength}个章节`));
    });
}
