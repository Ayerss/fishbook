const fs = require('fs');
const {homedir} = require('os');

const srcPath = __dirname;
const fishBookPath = homedir() + '/.fishBook';
const confPath = fishBookPath + '/fishBook.json';
const bookshelfPath = fishBookPath + '/bookshelf.json';
const bookPath = fishBookPath + '/book';
const chapterPath = fishBookPath + '/.chapter';

const defaultConf = {
  version: '1.1.0',
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
    },
    readingColor: {
      name: "readingColor",
      description: "设置阅读时文字颜色",
      message: '请输入16进制颜色:',
      value: '',
      type: 'color'
    },
    readingAutoPageTurn: {
      name: "readingAutoPageTurn",
      description: "设置阅读时自动翻页时间",
      message: '请输入秒数:',
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
    } else {
      // 检查版本
      if (confJson.version !== defaultConf.version) {
        fs.writeFileSync(
          confPath,
          JSON.stringify({
            version: defaultConf.version,
            checkVersion: confJson.checkVersion,
            settings: {
              ...defaultConf.settings,
              ...confJson.settings
            }
          }, null, 2)
        );
      }
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
    srcPath,
    api: 'http://fish.ayers.top'
  };
}
