const bookshelfConf = require(global.fishbook.bookshelfPath);
const Read = require('../container/read');

module.exports = async () => {
  if (!bookshelfConf.current) {
    // 未找到书籍, 请使用 fishbook add 添加书籍
    return
  }

  const current = bookshelfConf['book'][bookshelfConf.current];

  await new Read(current);
}
