const fs = require('fs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const conf = require(global.fishBook.bookshelfPath);
const saveConf = require('../utils/saveConf');
const loading = require('../utils/loading');

const log = console.log;

function selectBook(isDel, isUpload) {
  inquirer.prompt({
    type: 'list',
    message: '请选择书籍:',
    name: 'name',
    pageSize: 10,
    choices: Object.keys(conf.book)
  }).then(({name}) => {
    if (isDel) {
      deleteBook(name);
    }
    else if (isUpload) {
      uploadBook(name);
    }
    else {
      conf.current = name;
      saveConf(global.fishBook.bookshelfPath, conf);
      log(chalk.green(`\u{1F389}  切换成功!`));
    }
  });
}

function deleteBook(book) {
  const { path, chapterPath } = conf.book[book];
  delete conf.book[book];
  if (conf.current === book) {
    conf.current = Object.keys(conf.book)[0] || '';
  }
  saveConf(global.fishBook.bookshelfPath, conf);
  fs.unlink(path, () => {});
  fs.unlink(chapterPath, () => {});
  log(chalk.green(`\u{1F389}  删除成功!`));
}

function uploadBook(book) {
  const axios = require('axios');
  const FormData = require('form-data');
  const load = new loading();
  const maxLen = 1024 * 1024 * 100

  const form = new FormData();
  form.append('file', fs.createReadStream(conf.book[book].path));

  axios.post(global.fishBook.api + '/upload', form, {
    headers: form.getHeaders(),
    maxBodyLength: maxLen,
    maxContentLength: maxLen
  }).then(res=> {
    load.close();
    console.log(res.data);
    if (res.data.code === 0) {
      log(chalk.green('\u{1F389} 上传成功'));
    } else {
      log(chalk.red(res.data.message));
    }
  }).catch(err => {
    load.close();
    log(chalk.red(
      err.message === 'Request body larger than maxBodyLength limit'
        ? '最大支持100MB'
        : err.message
    ));
  })
}

module.exports = function (book, isDel, isUpload) {
  if (book == undefined) {
    selectBook(isDel, isUpload);
  } else {
    if (conf.book[book]) {
      if (isDel) {
        deleteBook(book);
      }
      else if (isUpload) {
        uploadBook(book);
      }
      else {
        conf.current = book;
        saveConf(global.fishBook.bookshelfPath, conf);
        log(chalk.green(`\u{1F389}  切换成功!`));
      }
    } else {
      log(chalk.red(`\u26A0 未找到!`));
      selectBook();
    }
  }
}
