const fs = require('fs');

const reg = /第(.){1,10}[章回卷节折篇幕集](.+)[\s\n\r]/;

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path,
      'utf-8',
      (err,data)=>{
        if(err) reject(err);
        resolve(data);
      });
  });
}

function createNewReg(data) {
  let sequenceAfterString = '';
  data.replace(reg, ($1, $2, $3) => {
    const start = $1.indexOf($2) + 1;
    const end = $1.indexOf($3) + 1;
    sequenceAfterString = $1
      .substring(start, end)
      .replace(/\s/g, '\\s');
  });

  return new RegExp(`第(.){1,10}${sequenceAfterString}(.+)[\\s\\n\\r]`, 'g');
}

function getIndex(data, chapters) {
  const arr = [];
  const len = chapters.length;
  for(let i = 0; i < len; i++) {
    const end = data.indexOf(chapters[i]);
    const value = Buffer.byteLength(data.substring(0, end), 'utf-8');

    data = data.substring(end);
    arr.push({
      name: chapters[i].replace(/[\n|\r]/g, ''),
      value: i > 0 ? arr[i - 1]['value'] + value : value
    });
  }

  return arr;
}

module.exports = async function (path) {
  const data = await readFile(path);
  const newReg = createNewReg(data);
  const chapters = data.match(newReg);

  return getIndex(data, chapters);
}
