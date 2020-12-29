const fs = require('fs');
const keypress = require('keypress');
const readline = require('readline');
const chalk = require('chalk');
const conf = require(global.fishBook.confPath);
const saveConf = require(global.fishBook.srcPath + '/utils/saveConf.js');

let txtLen = (process.stdout.columns - 6) * 1.4;
let fd;

function read(path, start, cb, sOffset = 0, eOffset = 0) {
  if (start < 0) start = 0;
  txtLen = Math.round((process.stdout.columns - 6) * 1.4);

  const rs = fs.createReadStream(path, {
    flag: 'r',
    encoding: "utf-8",
    autoClose: true,
    start: start + sOffset + 1,
    end: start + sOffset + txtLen + eOffset
  });
  let txt = '';

  // txt += encodeUnicode(data.replace(/[\n|\r]/g, '')).replace(/\\ufffd/g, '');

  return new Promise((resolve => {
    rs.on('data', (data) => {
      txt += data;
    });
    rs.on('close', () => {
      const unicodeTxt = encodeUnicode(txt);

      if (unicodeTxt.includes('$fffd')) {
        read(
          path,
          start,
          cb,
          unicodeTxt.indexOf('$fffd') === 0 ? sOffset - 1 : sOffset,
          unicodeTxt.lastIndexOf('$fffd') > 0 ? eOffset + 1 : eOffset,
        )
      }
      else {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0, fd);

        process.stdout.write(
          txt.replace(/[\n|\r]/g, '').replace(/\s+/g, ' '),
          'utf-8'
        );
        cb(start + sOffset + txtLen + eOffset, start + sOffset);
      }
    })
  }));
}

module.exports = () => {
  if (!conf.current) {
    console.log(chalk.red('\u26A0  未找到书籍, 请使用[fishbook add]添加书籍'));
    return
  }

  const _conf = conf.book[conf.current];
  let start = _conf.current;
  let oldStart = start;
  fd = process.stdin.fd;

  read(_conf.path, start, function (s, o) {
    isEnd(s, _conf.total);
    start = s;
    oldStart = o;
  });

  keypress(process.stdin);

  process.stdin.on('keypress', function (ch, key) {
    if (key && ['down', 'up'].includes(key.name)) {
      read(
        _conf.path,
        key.name === 'down' ? start : oldStart - txtLen,
        (s, o) => {
          isEnd(s, _conf.total);
          start = s;
          oldStart = o;
        });
    }

    if (key && key.ctrl && key.name == 'c') {
      save(oldStart);
      process.stdin.pause();
    }
  });

  process.stdin.setRawMode(true);
  return;
}

function save(start) {
  conf.book[conf.current]['current'] = start;
  saveConf(global.fishBook.confPath, conf);
  console.log('\r');
  console.log(chalk.green('\u{1F516} 已保存阅读记录'));
}

function isEnd(s, total) {
  if (s >= total) {
    console.log('\r');
    console.log(chalk.cyan('已读完'));
    save(total - txtLen);
    process.stdin.pause();
  }
}

function encodeUnicode(str) {
  const res = [];
  for (let i = 0, len = str.length; i < len; i++) {
    res[i] = ( "00" + str.charCodeAt(i).toString(16) ).slice(-4);
  }
  return "$" + res.join("$"); // $ = \u
}
