const fs = require('fs');

const reg = /第(.+)[章回卷节折篇幕集]\s(.+)\s/;

const chapter = [];

function identify(path, highWaterMark) {
  let currentIndex = 0;
  const rs = fs.createReadStream(path, {
    flag: 'r',
    encoding: "utf-8",
    autoClose: true,
    highWaterMark
  });

  return new Promise(function (resolve) {

    rs.on('data', function (data) {
      const index = data.search(reg);
      // console.log(currentIndex, data);
      if (index > -1) {
        let chapterName;
        data.replace(reg, ($1) => {
          chapterName = $1.replace(/[\n|\r]/g, '');
          return $1;
        });
        if (chapter.findIndex(item => item.name === chapterName) === -1) {
          chapter.push({
            name: chapterName,
            value: Buffer.byteLength(data.substring(0, index - 1), 'utf-8')
              + currentIndex
              * highWaterMark
          });
        }
      }
      currentIndex += 1;
    });

    rs.on('close', () => {
      resolve();
    });
  })
}

module.exports = function (path) {
  return identify(path, 256)
    .then(() => {
      return identify(path, 512 - 40);
    }).then(() => {
      return identify(path, 512 + 40);
    }).then(() => {
      return identify(path, 1024 - 200);
    }).then(() => {
      for (let i = 0; i < chapter.length - 1; i++) {
        for (let j = 0; j < chapter.length - 1 - i; j++) {
          if (chapter[j]['value'] > chapter[j + 1]['value']) {
            [chapter[j], chapter[j + 1]] = [chapter[j + 1], chapter[j]];
          }
        }
      }
      return chapter;
    });
}
