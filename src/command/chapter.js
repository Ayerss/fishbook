const bookshelfConf = require(global.fishbook.bookshelfPath);
const searchChapter = require('../container/searchChapter');
const selectChapter = require('../container/selectChapter');
const saveConf = require('../utils/saveConf');
const chapters = require(bookshelfConf['book'][bookshelfConf.current]['chapterPath']);

module.exports = async (page, search) => {
  const value = search
    ? await searchChapter(search, chapters)
    : await selectChapter(page, chapters);

  bookshelfConf['book'][bookshelfConf.current]['current'] = value;
  await saveConf(global.fishbook.bookshelfPath, bookshelfConf);
  return
}
