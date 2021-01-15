const axios = require('axios');
const chalk = require('chalk');
const {version} = require('../../package.json');

function getVersion() {
  return axios.get('http://registry.npmjs.org/fishbook').then(res => {
    return res.data['dist-tags']['latest'];
  });
}

function format(version) {
  return Number(version.replace(/\./g, ''));
}

module.exports = async () => {
  const confJson = require(global.fishbook.confPath);
  const saveConf = require(global.fishbook.srcPath + '/utils/saveConf.js');

  const { checkVersion } = confJson;

  if (checkVersion === undefined) {
    return true;
  }

  const now = Date.now();
  let latest = checkVersion.latest;

  if ( now > checkVersion.lastTimestamp + 864e5 ) {
    latest = await getVersion();
    confJson.checkVersion = {
      lastTimestamp: now,     // 最后一次检查的时间戳
      latest                  // 最后一个的版本
    };
    await saveConf(global.fishbook.confPath, confJson);
  }

  if (format(latest) > format(version)) {
    console.log(`
          >=>                            >=>
          >=>                            >=>
          >=>         >=>        >=>     >=>  >=>
          >=>>==>   >=>  >=>   >=>  >=>  >=> >=>
          >=>  >=> >=>    >=> >=>    >=> >=>=>
          >=>  >=>  >=>  >=>   >=>  >=>  >=> >=>
          >=>>==>     >=>        >=>     >=>  >=>
  ${chalk.yellow('.-----------------------------------------------------------.')}
  ${chalk.yellow('|                                                           |')}
  ${chalk.yellow('|')}  New ${chalk.cyan('patch')} version of fishbook available! ${chalk.red(version)} -> ${chalk.green(latest)}  ${chalk.yellow('|')}
  ${chalk.yellow('|')}          Run ${chalk.green('npm install -g fishbook')} to update!           ${chalk.yellow('|')}
  ${chalk.yellow('|                                                           |')}
  ${chalk.yellow('\'-----------------------------------------------------------\'')}
`);

    return false;
  }

  return true;
}
