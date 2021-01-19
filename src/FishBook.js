const {join} = require('path');
const chalk = require('chalk');

async function bookshelf({delete: isDelete, upload: isUpload}) {
  if(isDelete) {
    await operatBook('delete');
  }
  else if(isUpload) {
    await operatBook('upload');
  }
  else {
    await selectedBook();
  }
  return
}

async function add(path){
  const add = require(getPath('add'));
  await add(path);
  read();
}

async function chapter(page = 1, option){
  if (getCurrent) {
    const selectedChapter = require(getPath('chapter'));
    await selectedChapter(page, option.search);
    read();
  }
}

function read(){
  if (getCurrent) {
    require(getPath('read'))();
  }
}

async function setting(){
  const setting = require(getPath('setting'));
  await setting();
}

async function pan({search}) {
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
      isRead && read();
    }, 1500);
  }
}

async function selectedBook() {
  const selectedBook = require(getPath('bookshelf'));
  await selectedBook();
  read();
}

async function operatBook({type}) {
  const operating = require(getPath('operatBook'));
  await operating(type);
  return
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

module.exports = {
  bookshelf,
  add,
  chapter,
  read,
  pan,
  setting
};
