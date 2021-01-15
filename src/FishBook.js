const {join} = require('path');
const {homedir} = require('os');
const chalk = require('chalk');
const fileDetection = require('./utils/fileDetection');

const fishBookPath = homedir() + '/.fishBook';

global.fishbook = {
  fishBookPath,
  srcPath: __dirname,
  confPath: join(fishBookPath, 'fishBook.json'),
  bookshelfPath: join(fishBookPath, 'bookshelf.json'),
  bookPath: join(fishBookPath, 'book'),
  chapterPath: join(fishBookPath, '.chapter'),
  api: 'http://fish.ayers.top'
}

class FishBook {
  constructor() {
    fileDetection();
  }

  bookshelf = async ({delete: isDelete, upload: isUpload}) => {
    if(isDelete) {
      await this.operatBook('delete');
    }
    else if(isUpload) {
      await this.operatBook('upload');
    }
    else {
      await this.selectedBook();
    }
    return
  }

  add = async path => {
    const add = require(getPath('add'));
    await add(path);
    this.read();
  }

  chapter = async (page = 1, option) => {
    if (getCurrent) {
      const selectedChapter = require(getPath('chapter'));
      await selectedChapter(page, option.search);
      this.read();
    }
  }

  read = () => {
    if (getCurrent) {
      require(getPath('read'))();
    }
  }

  setting = async () => {
    const setting = require(getPath('setting'));
    await setting();
  }

  pan = async ({search}) => {
    if (search === true) {
      console.log(chalk.red('请输入需要搜索的书名'));
      return;
    } else if (
      search !== undefined &&
      /^[A-Za-z0-9\u4e00-\u9fa5]+$/g.test(search) === false) {
      console.log(chalk.red('书名格式错误'));
      return;
    }

    const pan = require(getPath(search ? 'panSearch' : 'pan'));
    const isRead = await pan(search);
    if (isRead) {
      console.log('即将进入阅读模式...');
      setTimeout(() => {
        isRead && this.read();
      }, 1500);
    }
  }

  selectedBook = async () => {
    const selectedBook = require(getPath('bookshelf'));
    await selectedBook();
    this.read();
  }

  operatBook = async type => {
    const operating = require(getPath('operatBook'));
    await operating(type);
    return
  }

}

function getPath(name) {
  return join(__dirname, 'command', name);
}

function getCurrent() {
  const { current, book } = require(global.fishbook.bookshelfPath);
  if (current && book[current]) {
    return true;
  } else {
    console.log(chalk.red('\u26A0  未找到书籍, 请先添加书籍'));
    return false;
  }
}

module.exports = new FishBook();
