const fs = require('fs/promises');

module.exports = (path, data) => {
  return fs.writeFile(path, JSON.stringify(data, null, 2));
}
