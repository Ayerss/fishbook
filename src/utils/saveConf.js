const fs = require('fs');

module.exports = function (path, conf) {
  fs.writeFileSync(
    path,
    JSON.stringify(conf, null, 2)
  );
}
