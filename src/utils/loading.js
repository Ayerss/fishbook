/**
 *
 * @type {string[]}
 */

const readline = require('readline');
const P = ['\\', '|', '/', '-'];

function loading (txt) {
  let x = 0;

  return setInterval(function () {
    const str = `${P[x++]} ${txt} ${''.padStart(x, '.')}`;

    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(str, 'utf-8');

    if (x === 4) x = 0;
  }, 250);
}

module.exports = function (txt = '加载中') {
 let timeId = loading(txt);

  return {
    start() {
      timeId = loading(txt);
    },
    close() {
      // console.log('\r');
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);

      clearInterval(timeId);
    }
  }
}

