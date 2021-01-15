const chalk = require('chalk');
const bookshelf = require('../container/bookshelf');
const saveConf = require('../utils/saveConf');

const bookshelfConf = require(global.fishbook.bookshelfPath);

module.exports = async () => {
  if (Object.keys(bookshelfConf.book).length === 0) {
    console.log(chalk.red('\u26A0  未找到书籍, 请先添加书籍'));
    return
  }
  const bookName = await bookshelf();

  bookshelfConf.current = bookName;

  await saveConf(global.fishbook.bookshelfPath, bookshelfConf);

  return
}
