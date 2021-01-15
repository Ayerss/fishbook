const chalk = require('chalk');
const inquirer = require('inquirer');

async function selectChapter(pageNumber, chapters) {
  const pageTotal = Math.ceil(chapters.length / 10);

  if (pageNumber === 'end' || Number(pageNumber) > pageTotal) {
    pageNumber = pageTotal;
  } else if (Number(pageNumber) < 1) {
    pageNumber = 1;
  }

  if (/^[0-9]*[1-9][0-9]*$/.test(pageNumber) === false) {
    console.log(chalk.red('\u26A0  格式错误'));
    return
  }

  pageNumber = Number(pageNumber);

  const start = (pageNumber - 1) * 10;
  const choices = chapters
    .slice(start, start + 10)
    .map((item, index) => ({
      name: item.name,
      value: index + start
    }));

  if (pageNumber > 1) {
    choices.unshift({ name: '上一页', value: -1 });
  }

  if (pageNumber < pageTotal) {
    choices.push({ name: '下一页', value: -2 });
  }

  console.clear();
  console.log(chalk.cyan(`${pageNumber} / ${pageTotal}`));

  const { index } = await inquirer.prompt({
    type: 'list',
    message: '请选择章节:',
    name: 'index',
    pageSize: 12,
    choices
  });

  if ([-1, -2].includes(index)) {
    return await selectChapter(
      index === -1 ? pageNumber  - 1 : pageNumber + 1,
      chapters
    );
  } else {
    return chapters[index]['value'];
  }
}

module.exports = selectChapter;
