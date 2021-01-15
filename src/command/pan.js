const axios = require('axios');
const chalk = require('chalk');
const inquirer = require('inquirer');
const {
  downloadChapter,
  download,
  updateInfo
} = require('../container/pan');

module.exports = async () => {
  const book = await getBook();
  if (book) {
    downloadChapter(book);
    await download(book);
    await updateInfo(book);
    return true
  }
}

async function getBook(page = 1) {
  const { code, message, data } = await axios.get(`${global.fishbook.api}/book?page=${page}`).then(res => res.data);
  if (code !== 0) {
    console.log(chalk.red(message));
    return false
  }

  const pageTotal = Math.ceil(data.total / 10);

  const choices = data.book.map(item => ({
    name: `${item.name}  ${(Number(item.size) / 1024 /1024).toFixed(2)}MB`,
    value: item
  }));

  if (data.page > 1) {
    choices.unshift({ name: '上一页', value: -1 });
  }

  if (data.page === 1 && pageTotal > 1) {
    choices.push({ name: '下一页', value: -2 });
  }

  console.clear();
  console.log(chalk.cyan(`${data.page} / ${pageTotal}`));

  const {book} = await inquirer.prompt({
    type: 'list',
    message: '请选择书籍:',
    name: 'book',
    pageSize: 12,
    choices: choices
  });

  if ([-1, -2].includes(book)) {
    return await getBook(page + 1);
  }

  const { status } = await inquirer.prompt({
    type: 'confirm',
    name: 'status',
    message: '是否从网盘下载该小说？',
    default: true
  });

  if (status) {
    return book;
  } else {
    console.log(chalk.green('\u{1F4E6} 已取消下载'));
    return false;
  }
}
