const path = require('path');
const fs = require('fs');
const {homedir} = require('os');

const srcPath = __dirname;
const fishBookPath = path.resolve(homedir(), '.fishBook');
const confPath = path.resolve(fishBookPath, 'fishBook.json');
const bookshelfPath = path.resolve(fishBookPath, 'bookshelf.json');
const bookPath = path.resolve(fishBookPath, 'book');
const chapterPath = path.resolve(fishBookPath, '.chapter');

const defaultConf = {
  version: '1.0.0',
  checkVersion: {
    lastTimestamp: 0,
    latest: '0.0.4'
  },
  settings: {
    readingDisplayNumberAuto: {
      name: "readingDisplayNumberAuto",
      description: "阅读时是否一行显示",
      message: '是否一行显示:',
      value: true,
      type: 'confirm'
    },
    readingDisplayNumber: {
      name: "readingDisplayNumber",
      description: "设置阅读时显示的字数",
      message: '请输入字数:',
      value: 0,
      type: 'number'
    }
  }
}

module.exports = function () {
  if (fs.existsSync(fishBookPath) === false) {
    fs.mkdirSync(fishBookPath);
  }

  if (fs.existsSync(chapterPath) === false) {
    fs.mkdirSync(chapterPath);
  }

  if (fs.existsSync(confPath) === false) {
    fs.mkdirSync(bookPath);
  }

  if (fs.existsSync(bookshelfPath) === false) {
    fs.writeFileSync(
      bookshelfPath,
      JSON.stringify({
        version: '2.0.0',
        current: '',
        book: {}
      }, null, 2)
    );
  }

  if (fs.existsSync(confPath)) {
    const confJson = require(confPath);
    // 检查到 0.0.4 以下版本
    if (confJson.hasOwnProperty('book')) {
      // 迁移配置文件
      fs.writeFileSync(
        bookshelfPath,
        JSON.stringify({
          version: '2.0.0',
          current: confJson.current,
          book: confJson.book,
        }, null, 2)
      );
      fs.writeFileSync(
        confPath,
        JSON.stringify(defaultConf, null, 2)
      );
    }
  } else {
    fs.writeFileSync(
      confPath,
      JSON.stringify(defaultConf, null, 2)
    );
  }

  global.fishBook = {
    fishBookPath,
    confPath,
    bookshelfPath,
    bookPath,
    chapterPath,
    srcPath
  };
}
