const fs = require('fs');

module.exports = (path, data) => {
  return new Promise((resolve, rejects) => {
    fs.writeFile(path, JSON.stringify(data, null, 2), err => {
      if (err) {
        rejects(err);
      }
      resolve();
    })
  });
}
