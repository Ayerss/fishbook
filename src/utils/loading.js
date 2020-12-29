/**
 *
 * @type {string[]}
 */

const readline = require('readline');
const P = ['\\', '|', '/', '-'];

function loading () {
  let x = 0;

  return setInterval(function () {
    const str = P[x++] + ' 加载中' + ''.padStart(x, '.');

    // console.clear();
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);

    process.stdout.write(str, 'utf-8');
    // console.log('\r');

    if (x === 4) x = 0;
  }, 250);
}

module.exports = function () {
 let timeId = loading();

  return {
    start() {
      timeId = loading();
    },
    close() {
      // console.log('\r');
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);

      clearInterval(timeId);
    }
  }
}

