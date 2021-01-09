const inquirer = require('inquirer');
const chalk = require('chalk');
const conf = require(global.fishBook.bookshelfPath);
const saveConf = require('../utils/saveConf');

let chapter;

async function selectChapter(page) {
  const endPage = Math.ceil(chapter.length / 10);

  if (page === 'end' || Number(page) > endPage) {
    page = endPage;
  } else if (Number(page) < 1) {
    page = 1;
  }
  if (/^[0-9]*[1-9][0-9]*$/.test(page) === false) {
    console.log(chalk.red('\u26A0  格式错误'));
    return
  }

  page = Number(page);

  const start = (page - 1) * 10;
  const choices = chapter
    .slice(start, start + 10)
    .map((item, index) => ({
      name: item.name,
      value: index + start
    }));

  if (page > 1) {
    choices.unshift({ name: '上一页', value: -1 });
  }

  if (page < endPage) {
    choices.push({ name: '下一页', value: -2 });
  }

  console.clear();
  console.log(chalk.cyan(`${page} / ${endPage}`));

  const { index } = await inquirer.prompt({
    type: 'list',
    message: '请选择章节:',
    name: 'index',
    pageSize: 12,
    choices
  });

  if ([-1, -2].includes(index)) {
    return await selectChapter(index === -1 ? page - 1 : page + 1);
  } else {
    conf.book[conf.current]['current'] = chapter[index]['value'];
    saveConf(global.fishBook.bookshelfPath, conf);
    return
  }

}

module.exports = function (page, search) {
  if (conf.current) {
    chapter = require(conf.book[conf.current]['chapterPath']);
    if (search) {
      searchChapter(search);
    } else {
      selectChapter(page).then(() => {});
    }
  } else {
    console.log(chalk.red('\u26A0  未找到书籍, 请使用[fishbook add]添加书籍'));
    return
  }
};

function searchChapter(name) {
  const choices = chapter.filter(item => item.name.includes(name));
  const pageSize = process.stdout.rows > 10 ? process.stdout.rows - 5 : 5;
  inquirer.prompt({
    type: 'list',
    message: '请选择章节:',
    name: 'value',
    pageSize,
    choices
  }).then(({value}) => {
    conf.book[conf.current]['current'] = value;
    saveConf(global.fishBook.bookshelfPath, conf);
  });
}
