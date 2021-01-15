const { writeFile, readFile } = require('fs/promises');
const { join, basename } = require('path');
const { detectFile } = require('chardet');
const { existsSync } = require('fs');
const { decode } = require('iconv-lite');
const identifyChapter = require('../utils/identifyChapter');
const saveConf = require('../utils/saveConf');
const bookshelfConf = require(global.fishbook.bookshelfPath);

exports.pathFormat = path => {
  const isRelativePath = path.indexOf('/') === 0 ? false : true;

  return isRelativePath
    ? path
    : join(
      process.cwd(),
      path.indexOf('.') === 0
        ? path
        : `./${path}`
    );
}

exports.isNext = async path => {
  if (existsSync(path)) {
    const inquirer = require('inquirer');
    const { status } = await inquirer.prompt({
      type: 'confirm',
      name: 'status',
      message: '书籍已存在，是否替换？',
      default: true
    });

    return status;
  } else {
    return true;
  }
}

exports.copyFile = async (formPath, toPath) => {
  const encoding = await detectFile(formPath);
  let data = await readFile(formPath);
  if(encoding === "Big5" || encoding === "GB18030" ){
    data = decode(data, 'gbk');
  } else if(encoding === 'UTF-8') {

  } else {
    return new Error(`不支持${encoding}编码`);
  }
  await writeFile(toPath, data);
  return Buffer.byteLength(data);
}

exports.exportConf = async (toPath, size) => {
  const filename = basename(toPath).replace('.txt', '');
  const chapterPath = join(global.fishbook.chapterPath, filename + '.json');
  console.time('\u23F1');

  let chapter = await identifyChapter(toPath);

  await saveConf(chapterPath, chapter);

  console.timeEnd('\u23F1');

  const chapterLength = chapter.length;
  chapter = null;

  bookshelfConf.current = filename;
  bookshelfConf['book'][filename] = {
    name: filename,
    path: toPath,
    chapterPath,
    chapterLength,
    current: 0,
    total: size
  };

  await saveConf(global.fishbook.bookshelfPath, bookshelfConf);

  return chapterLength;
}
