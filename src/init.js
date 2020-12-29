const path = require('path');
const fs = require('fs');
const {homedir} = require('os');

const srcPath = __dirname;
const fishBookPath = path.resolve(homedir(), '.fishBook');
const confPath = path.resolve(fishBookPath, 'fishBook.json');
const bookPath = path.resolve(fishBookPath, 'book');
const chapterPath = path.resolve(fishBookPath, '.chapter');

module.exports = function () {
  if (fs.existsSync(fishBookPath) === false) {
    fs.mkdirSync(fishBookPath);
  }

  if (fs.existsSync(chapterPath) === false) {
    fs.mkdirSync(chapterPath);
  }

  if (fs.existsSync(bookPath) === false) {
    fs.mkdirSync(bookPath);
  }

  if (fs.existsSync(confPath) === false) {
    fs.writeFileSync(
      confPath,
      JSON.stringify({
        version: '1.0.0',
        current: '',
        book: {}
      }, null, 2)
    );
  }

  global.fishBook = {
    fishBookPath,
    confPath,
    bookPath,
    chapterPath,
    srcPath
  };
}
