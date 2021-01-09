const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const axios = require('axios');
const inquirer = require('inquirer');
const loading = require('../utils/loading');
const saveConf = require('../utils/saveConf');
const identifyChapter = require('../utils/identifyChapter');
const log = console.log;

module.exports = async function (search) {
  if (search === true) {
    log(chalk.red('请输入需要搜索的书名'));
    return;
  } else if(search === undefined) {
    openDefaultBrowser(global.fishBook.api);
    return;
  } else if (/^[A-Za-z0-9\u4e00-\u9fa5]+$/g.test(search) === false) {
    log(chalk.red('书名格式错误'));
    return;
  }

  const searchData = await axios.get(
    global.fishBook.api
    + '/search?name='
    + encodeURIComponent(search)
  ).then(res => res.data);

  if (searchData.code == 0) {
    const book = await selected(searchData.data);
    if (book) {
      const load = loading();
      await download(book);
      load.close();

      await saveBookInfo(book);
    }

  } else {
    log(chalk.red(searchData.message));
  }
}

async function selected(data) {
  const {book} = await inquirer.prompt({
    type: 'list',
    message: '请选择书籍:',
    name: 'book',
    pageSize: 10,
    choices: data.map(item => ({
      name: `${item.name}  ${(Number(item.size) / 1024 /1024).toFixed(2)}MB`,
      value: item
    }))
  });

  const { status } = await inquirer.prompt({
    type: 'confirm',
    name: 'status',
    message: '是否从网盘下载该小说？',
    default: true
  });

  if (status) {
    return book;
  } else {
    log(chalk.green('\u{1F4E6} 已取消下载'));
    return false;
  }
}

function download(info) {
  const formPath = path.join(global.fishBook.api, info.path);
  const toPath = path.join(global.fishBook.bookPath, info.name + '.txt');

  const writer = fs.createWriteStream(toPath);

  return new Promise((resolve, reject) => {
    axios({
      url: formPath,
      method: 'GET',
      responseType: 'stream',
    }).then(res => {
      res.data.pipe(writer);
    }).catch(err => {
      reject(err);
    });

    writer.on('finish', () => {
      resolve(true);
    });
    writer.on("error", error => {
      reject(error);
    });
  });
}

async function saveBookInfo(book) {
  const conf = require(global.fishBook.bookshelfPath);
  const bookPath = path.join(global.fishBook.bookPath, book.name + '.txt');
  const chapterPath = path.join(global.fishBook.chapterPath, book.name + '.json');

  if (conf.book[book.name]) {
    log('\u{1F928} 正在替换本地');
  }

  const chapters = await identifyChapter(bookPath);

  conf.current = book.name;
  conf.book[book.name] = {
    name: book.name,
    path: bookPath,
    chapterPath,
    chapterLength: chapters.length,
    current: 0,
    total: book.size
  };

  saveConf(chapterPath, chapters);
  saveConf(global.fishBook.bookshelfPath, conf);
  log(chalk.green(`\u{1F389} 识别到${chapters.length}个章节`));
}

function openDefaultBrowser(url) {
  const {exec} = require('child_process');
  switch (process.platform) {
    case 'darwin':
      exec('open ' + url);
      break;
    case 'win32':
      exec('start ' + url);
      break;
    default:
      exec('xdg-open', [url]);
  }
}
