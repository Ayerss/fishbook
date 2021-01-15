#!/usr/bin/env node

const {program} = require('commander');
const {version} = require('../package.json');
const fishBook = require('../src/FishBook');
const checkVersion = require('../src/utils/checkVersion');

checkVersion().then(status => {
  if (status) {
    program
      .command('bookshelf')
      .description('书架')
      .option('-u, --upload', '上传书籍')
      .option('-d, --delete', '删除书籍')
      .action(fishBook.bookshelf);

    program
      .command('add <path>')
      .description('添加书籍')
      .action(fishBook.add);

    program
      .command('chapter [page]')
      .description('查看目录')
      .option('-s, --search <chapterName>', '模糊搜索章节')
      .action(fishBook.chapter);

    program
      .command('read')
      .description('阅读')
      .action(fishBook.read);

    program
      .command('pan')
      .option('-s, --search [book]', '搜索书籍')
      .description('共享网盘')
      .action(fishBook.pan);

    program
      .command('setting')
      .description('设置')
      .action(fishBook.setting);

    program
      .version(version, '-v, --version')
      .parse(process.argv);
  }
})

