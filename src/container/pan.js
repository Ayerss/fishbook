const fs = require('fs');
const {join} = require('path');
const readline = require('readline');
const axios = require('axios');
const inquirer = require('inquirer');
const chalk = require('chalk');
const saveConf = require('../utils/saveConf');

exports.selected = async data => {
  const {book} = await inquirer.prompt({
    type: 'list',
    message: '请选择书籍:',
    name: 'book',
    pageSize: 10,
    choices: data.map(item => ({
      name: `${item.name}  ${(Number(item.size) / 1024 /1024).toFixed(2)}MB`,
      value: item
    }))
  });

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

exports.downloadChapter = info => {
  const formJsonPath = global.fishbook.api + info.chapter;
  const toJson = join(global.fishbook.chapterPath, info.name + '.json');

  const writerJson = fs.createWriteStream(toJson);

  axios({
    url: formJsonPath,
    method: 'GET',
    responseType: 'stream'
  }).then(res => {
    res.data.pipe(writerJson);
  });
  writerJson.on("error", error => {
    fs.unlink(toJson, () => {});
  });
}

exports.download = info => {
  const formPath = global.fishbook.api + info.path;

  const toPath = join(global.fishbook.bookPath, info.name + '.txt');

  const writer = fs.createWriteStream(toPath);

  let isFinish = false;

  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  process.stdout.write('\u23F3 下载中...', 'utf-8');

  return new Promise((resolve, reject) => {
    axios({
      url: formPath,
      method: 'GET',
      responseType: 'stream'
    }).then(res => {
      res.data.pipe(writer);
    }).catch(err => {
      reject(err);
    });

    writer.on('finish', () => {
      isFinish = true;
    });
    writer.on("error", error => {
      fs.unlink(toPath, () => {});
      reject(error);
    });

    fs.watchFile(toPath,(curr) => {
      const percentage = Math.round(curr.size / info.size * 100);
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);

      process.stdout.write(
        percentage === 100
          ? chalk.green('\u{1F381} 下载完成')
          : '\u23F3 下载进度: ' + percentage + '%', 'utf-8');

      if (isFinish) {
        fs.unwatchFile(toPath);
        console.log('\r');
        resolve(true);
      }
    });
  });
}

exports.updateInfo = async book => {
  const conf = require(global.fishbook.bookshelfPath);
  const bookPath = join(global.fishbook.bookPath, book.name + '.txt');
  const chapterPath = join(global.fishbook.chapterPath, book.name + '.json');

  if (conf['book'][book.name]) {
    console.log('\u{1F928} 正在替换本地');
  }

  conf.current = book.name;
  conf['book'][book.name] = {
    name: book.name,
    path: bookPath,
    chapterPath,
    chapterLength: book.chapterLen,
    current: 0,
    total: book.size
  };

  await saveConf(global.fishbook.bookshelfPath, conf);
  console.log(chalk.green(`\u{1F389} 识别到${book.chapterLen}个章节`));

  return;
}

