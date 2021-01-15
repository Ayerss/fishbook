const chalk = require('chalk');
const inquirer = require('inquirer');
const { unlink } = require('fs/promises');
const { createReadStream } = require('fs');
const bookshelf = require('../container/bookshelf');
const saveConf = require('../utils/saveConf');

const bookshelfConf = require(global.fishbook.bookshelfPath);

module.exports = async type => {
  if (Object.keys(bookshelfConf.book).length === 0) {
    console.log(chalk.red('\u26A0  未找到书籍'));
    return
  }

  const bookName = await bookshelf();

  const { status } = await inquirer.prompt({
    type: 'confirm',
    name: 'status',
    message: `是否${type === 'delete' ? '删除' : '上传'}该小说？`,
    default: true
  });

  if(!status) {
    console.log(chalk.yellow('Warning: 已中止'));
    return
  }

  const book = bookshelfConf['book'][bookName];

  if (type === 'delete') {
    delete bookshelfConf['book'][bookName];
    if (bookshelfConf.current === bookName) {
      bookshelfConf.current = Object.keys(bookshelfConf.book)[0] || '';
    }

    await saveConf(global.fishbook.bookshelfPath, bookshelfConf);

    await unlink(book.path);
    await unlink(book.chapterPath);
    console.log(chalk.green(`\u{1F389}  删除成功!`));
  } else {
    try{
      await uploadBook(book);
    }catch (e) {
      console.log(chalk.red('\u26A0 ' + e.message));
    }
  }
  return
}

function uploadBook(book) {
  const axios = require('axios');
  const FormData = require('form-data');
  const loading = require('../utils/loading');
  const load = new loading('上传中');
  const maxLen = 1024 * 1024 * 100;

  const form = new FormData();
  form.append('file', createReadStream(book.path));

  return axios.post(global.fishbook.api + '/upload', form, {
    headers: form.getHeaders(),
    maxBodyLength: maxLen,
    maxContentLength: maxLen
  }).then(res=> {
    load.close();
    if (res.data.code === 0) {
      console.log(chalk.green('\u{1F389} 上传成功'));
    } else {
      console.log(chalk.red(res.data.message));
    }
  }).catch(err => {
    load.close();
    console.log(chalk.red(
      err.message === 'Request body larger than maxBodyLength limit'
        ? '最大支持100MB'
        : err.message
    ));
  })
}
