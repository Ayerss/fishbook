const fs = require('fs');
const chalk = require('chalk');
const keypress = require('keypress');
const readline = require('readline');
const saveConf = require('../utils/saveConf');
const bookshelfConf = require(global.fishbook.bookshelfPath);const {
  readingDisplayNumberAuto,
  readingDisplayNumber,
  readingColor,
  readingAutoPageTurn
} = require('../utils/getSetting');
const spawn = require('child_process').spawn;

const osType = require('os').type();

class Read {
  constructor(book) {
    this.isPlay = false;
    this.timeId = undefined;
    this.fd = process.stdin.fd;
    this.path = book.path; // 小说路径
    this.total = book.total; // 总字节

    this.start = this.oldStart = book.current; // 阅读进度

    this.renderWordTotal = Math.round(readingDisplayNumberAuto
      ? (process.stdout.columns - 6) * 1.5
      : readingDisplayNumber * 2.9
    ); // 显示字数

    this.execute();
  }

  reading (cb, sOffset = 0, eOffset = 0) {


    const start = this.start < 0 ? 0 : this.start;

    if (readingDisplayNumberAuto) {
      this.renderWordTotal = Math.round((process.stdout.columns - 6) * 1.5);
    }

    let renderText = '';

    const rs = fs.createReadStream(this.path, {
      flag: 'r',
      encoding: "utf-8",
      autoClose: true,
      start: start + sOffset + 1,
      end: start + sOffset + this.renderWordTotal + eOffset
    });

    rs.on('data', (data) => {
      renderText += data;
    });

    rs.on('close', () => {
      const unicodeTxt = this.encodeUnicode(renderText);

      if (unicodeTxt.includes('$fffd')) {
        this.reading(
          cb,
          unicodeTxt.indexOf('$fffd') === 0 ? sOffset - 1 : sOffset,
          unicodeTxt.lastIndexOf('$fffd') > 0 ? eOffset + 1 : eOffset
        );
      }
      else {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0, this.fd);

        const formatTxt = renderText
          .replace(/[\n|\r]/g, '')
          .replace(/\s+/g, ' ');
        process.stdout.write(
          readingColor
            ? chalk.hex(readingColor)(formatTxt)
            : formatTxt,
          'utf-8'
        );

        if (this.isPlay) {
          this.play(formatTxt).then(() => {
            this.reading(() => this.isEnd());
          })
        }

        this.oldStart = start + sOffset;
        this.start = this.oldStart + this.renderWordTotal + eOffset;
        cb();
      }
    })
  }

  execute() {
    console.clear();

    keypress(process.stdin);

    this.reading(() => {
      this.isEnd();

      if (readingAutoPageTurn) {
        this.timeId = setInterval(() => {
          this.reading(() => this.isEnd());
        }, readingAutoPageTurn * 1000);
      }

      process.stdin.resume();
    });

    process.stdin.on('keypress', (ch, key) => {

      if (key && ['down', 'up'].includes(key.name)) {
        this.start = key.name === 'down'
          ? this.start
          : this.oldStart - this.renderWordTotal;
        this.reading(() => this.isEnd());
      }

      if (key && key.name == 'p' && ['Darwin', 'Windows_NT'].includes(osType)) {
        if (this.isPlay) {
          this.start = this.oldStart;
          this.isPlay = false;
          this.playId.kill('SIGHUP');
        } else {
          this.isPlay = true;
          this.start = this.oldStart;
          this.reading(() => this.isEnd());
        }
      }

      if (key && key.name == 's') {
        clearInterval(this.timeId);
        this.timeId = undefined;
      }

      if (key && key.ctrl && key.name == 'c') {
        if (this.timeId) clearInterval(this.timeId);
        if (this.isPlay) {
          this.isPlay = false;
          this.start = this.oldStart;
          this.playId.kill('SIGHUP');
        };
        this.save(this.oldStart);
        process.stdin.pause();
      }
    });

    process.stdin.setRawMode(true);
  }

  // 文字转Unicode
  encodeUnicode(str) {
    const res = [];
    for (let i = 0, len = str.length; i < len; i++) {
      res[i] = ( "00" + str.charCodeAt(i).toString(16) ).slice(-4);
    }
    return "$" + res.join("$"); // $ = \u
  }

  isEnd() {
    if (this.start >= this.total) {
      console.log('\r');
      console.log(chalk.cyan('已读完'));
      this.save(this.total - this.renderWordTotal);
      process.stdin.pause();
    }
  }

  save(start) {
    bookshelfConf.book[bookshelfConf.current]['current'] = start;
    saveConf(global.fishbook.bookshelfPath, bookshelfConf);
    console.log('\r');
    console.log(chalk.green('\u{1F516} 已保存阅读记录'));
  }

  play(txt) {
    return new Promise((resolve, reject) => {
      this.playId = osType === 'Darwin'
        ? spawn('say', [
          '-r',
          '10',
          '-v',
          'Mei-Jia', // Ting-Ting
          txt
        ])
        : spawn('cmd.exe', [
          '/s',
          '/c',
          `mshta vbscript:createobject("sapi.spvoice").speak("${txt}")(window.close)`
        ]);

      this.playId.on('close', () => {
        resolve();
      });
      this.playId.on('error', (err) => {
        reject(err);
      })
    })
  }
}

module.exports = Read;
