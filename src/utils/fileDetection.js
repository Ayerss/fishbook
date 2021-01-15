const fs = require('fs');
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

module.exports = () => {
  if (fs.existsSync(global.fishbook.fishBookPath) === false) {
    fs.mkdirSync(global.fishbook.fishBookPath);
  }

  if (fs.existsSync(global.fishbook.chapterPath) === false) {
    fs.mkdirSync(global.fishbook.chapterPath);
  }

  if (fs.existsSync(global.fishbook.bookPath) === false) {
    fs.mkdirSync(global.fishbook.bookPath);
  }

  if (fs.existsSync(global.fishbook.bookshelfPath) === false) {
    fs.writeFileSync(
      global.fishbook.bookshelfPath,
      JSON.stringify({
        version: '2.0.0',
        current: '',
        book: {}
      }, null, 2)
    );
  }

  if (fs.existsSync(global.fishbook.confPath)) {
    const confJson = require(global.fishbook.confPath);
    // 检查到 0.0.4 以下版本
    if (confJson.hasOwnProperty('book')) {
      // 迁移配置文件
      fs.writeFileSync(
        global.fishbook.bookshelfPath,
        JSON.stringify({
          version: '2.0.0',
          current: confJson.current,
          book: confJson.book,
        }, null, 2)
      );
      fs.writeFileSync(
        global.fishbook.confPath,
        JSON.stringify(defaultConf, null, 2)
      );
    } else {
      // 检查版本
      if (confJson.version !== defaultConf.version) {
        fs.writeFileSync(
          global.fishbook.confPath,
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
      global.fishbook.confPath,
      JSON.stringify(defaultConf, null, 2)
    );
  }
}
