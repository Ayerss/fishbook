#!/usr/bin/env node

const init = require('../src/init');
const path = require('path');
const {program} = require('commander');
const {version} = require(path.resolve(__dirname, '..', 'package.json'));

init();
//
// console.log(`
//  >=>                            >=>
//  >=>                            >=>
//  >=>         >=>        >=>     >=>  >=>
//  >=>>==>   >=>  >=>   >=>  >=>  >=> >=>
//  >=>  >=> >=>    >=> >=>    >=> >=>=>
//  >=>  >=>  >=>  >=>   >=>  >=>  >=> >=>
//  >=>>==>     >=>        >=>     >=>  >=>
// `);

program
  .command('add <path>')
  .description('添加书籍')
  .action(function (options) {
    require(global.fishBook.srcPath + '/command/add.js')(options);
  });

program
  .command('chapter [page]')
  .description('查看目录')
  .action(function (options) {
    require(global.fishBook.srcPath + '/command/chapter.js')(options);
  });

program
  .command('bookshelf [book]')
  .option('-d, --delete', '删除书籍')
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
  .version(version, '-v, --version')
  .parse(process.argv);
