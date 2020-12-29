const fs = require('fs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const conf = require(global.fishBook.confPath);
const saveConf = require(global.fishBook.srcPath + '/utils/saveConf.js');

const log = console.log;

function selectBook(isDel) {
  inquirer.prompt({
    type: 'list',
    message: '请选择书籍:',
    name: 'name',
    pageSize: 10,
    choices: Object.keys(conf.book)
  }).then(({name}) => {
    if (isDel) {
      deleteBook(name);
    } else {
      conf.current = name;
      saveConf(global.fishBook.confPath, conf);
      log(chalk.green(`\u2728  切换成功!`));
    }
  });
}

function deleteBook(book) {
  const { path, chapterPath } = conf.book[book];
  delete conf.book[book];
  if (conf.current === book) {
    conf.current = Object.keys(conf.book)[0] || '';
  }
  saveConf(global.fishBook.confPath, conf);
  fs.unlink(path, () => {});
  fs.unlink(chapterPath, () => {});
  log(chalk.green(`\u2728  删除成功!`));
}

module.exports = function (book, isDel) {
  if (book == undefined) {
    selectBook(isDel);
  } else {
    if (conf.book[book]) {
      if (isDel) {
        deleteBook(book);
      } else {
        conf.current = book;
        saveConf(global.fishBook.confPath, conf);
        log(chalk.green(`\u2728  切换成功!`));
      }
    } else {
      log(chalk.red(`\u26A0 未找到!`));
      selectBook();
    }
  }
}
