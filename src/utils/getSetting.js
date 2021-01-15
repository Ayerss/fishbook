const { settings } = require(global.fishbook.confPath);

const conf = Object.keys(settings).reduce((o, key) => {
  o[key] = settings[key]['value'];
  return o;
}, {});

module.exports = conf;
