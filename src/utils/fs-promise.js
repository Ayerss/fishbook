const fs = require('fs');

module.exports = {
  readFile: path => {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    })
  },
  writeFile: (path, data) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, data, err => {
        if (err) reject(err);
        resolve();
      });
    })
  }
}
