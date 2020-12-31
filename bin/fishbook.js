#!/usr/bin/env node

const {program} = require('commander');
const {version} = require('../package.json');
const init = require('../src/init');
const checkVersion = require('../src/checkVersion');

init();
checkVersion().then((status) => {
  if (status) {
    program
      .command('add <path>')
      .description('添加书籍')
      .action(function (options) {
        require(global.fishBook.srcPath + '/command/add.js')(options);
      });

    program
      .command('chapter [page]')
      .description('查看目录')
      .option('-s, --search <chapterName>', '模糊搜索章节')
      .action(function (page = 1, option) {
        require(global.fishBook.srcPath + '/command/chapter.js')(page, option.search);
      });

    program
      .command('bookshelf [book]')
      .option('-d, --delete [bool]', '删除书籍')
      .description('切换书籍')
      .action(function (name, option) {
        require(global.fishBook.srcPath + '/command/bookshelf.js')(name, !!option.delete);
      });

    program
      .command('read')
      .description('阅读')
      .action(function (options) {
        require(global.fishBook.srcPath + '/command/read.js')(options);
      });

    program
      .command('setting')
      .description('设置')
      .action(function () {
        require(global.fishBook.srcPath + '/command/setting.js')();
      });

    program
      .version(version, '-v, --version')
      .parse(process.argv);
  }
})
