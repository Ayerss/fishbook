const inquirer = require('inquirer');
const chalk = require('chalk');
const bookshelfConf = require(global.fishbook.confPath);
const saveConf = require('../utils/saveConf');

const { settings } = bookshelfConf;

module.exports = async () => {
  const choices = Object
    .keys(settings)
    .map(key => {
      return {
        name: settings[key].description,
        value: settings[key]
      }
    });

  const { item } = await inquirer.prompt({
    type: 'list',
    message: '请选择配置项:',
    name: 'item',
    choices
  });

  const { val } = await inquirer.prompt(type2Conf(
    item.type,
    item.message,
    item.value
  ));

  if (val !== item.value) {
    settings[item.name].value = val;
    if (item.name === 'readingDisplayNumber' && val > 0) {
      settings.readingDisplayNumberAuto.value = false;
    }
    if (item.name === 'readingDisplayNumberAuto') {
      settings.readingDisplayNumber.value = val
        ? 0
        : Math.round((process.stdout.columns - 6) * 1.5);
    }

    await saveConf(global.fishbook.confPath, bookshelfConf);
  }

  console.log(chalk.green(`\u{1F389} 设置成功！`));
  return
}

function type2Conf (type, message, suffix) {
  switch (type) {
    case 'number':
      return {
        type: 'number',
        message,
        name: 'val',
        suffix: chalk.gray(`(${suffix})`),
        validate: function(val) {
          return /^([0]|[1-9][0-9]*)$/.test(val)
            ? true
            : "请输入数字 (按上键重新输入)";
        }
      }
    case 'confirm':
      return {
        type: 'confirm',
        message,
        suffix: chalk.gray(`(${suffix ? 'Y' : 'n'})`),
        name: 'val',
      }
    case 'color':
      return {
        type: 'input',
        message,
        suffix: chalk.gray(`(${suffix})`),
        name: 'val',
        validate: function(val) {
          return val === '' || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val)
            ? true
            : "请输入16进制颜色值 (按上键重新输入)";
        }
      }
  }
}
