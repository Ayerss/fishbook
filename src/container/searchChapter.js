const inquirer = require('inquirer');

module.exports = async (name, chapters) => {
  const choices = chapters.filter(item => item.name.includes(name));
  const pageSize = process.stdout.rows > 10 ? process.stdout.rows - 5 : 5;
  const {value} = await inquirer.prompt({
    type: 'list',
    message: '请选择章节:',
    name: 'value',
    pageSize,
    choices
  });
  return value
}
