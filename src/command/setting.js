const inquirer = require('inquirer');
const chalk = require('chalk');
const confJson = require(global.fishBook.confPath);
const { settings } = confJson;
const saveConf = require(global.fishBook.srcPath + '/utils/saveConf.js');

function type2Conf (type, message, suffix) {
  switch (type) {
    case 'number':
      return {
        type: 'number',
        message,
        name: 'val',
        suffix: chalk.gray(`(${suffix})`),
        validate: function(val) {
          return /^[0-9]*[1-9][0-9]*$/.test(val)
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
  }
}

module.exports = function () {
  const choices = Object
    .keys(settings)
    .map(key => {
      return {
        name: settings[key].description,
        value: settings[key]
      }
    });

  inquirer.prompt({
    type: 'list',
    message: '请选择配置项:',
    name: 'item',
    choices
  }).then(({ item }) => {
    inquirer.prompt(type2Conf(item.type, item.message, item.value)).then(({ val }) => {
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
        saveConf(global.fishBook.confPath, confJson);
      }

      console.log(chalk.green(`\u2728 设置成功！`));
    })
  });
}