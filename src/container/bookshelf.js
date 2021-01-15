const inquirer = require('inquirer');
const { book, current = '' } = require(global.fishbook.bookshelfPath);

module.exports = async (message = '请选择书籍:') => {
  const { name } = await inquirer.prompt({
    type: 'list',
    message,
    name: 'name',
    pageSize: 10,
    default: current,
    choices: Object.keys(book)
  });

  return name;
}
