const https = require('https');
const path = require('path');
const chalk = require('chalk');
const {version} = require(path.resolve(__dirname, '..', 'package.json'));

function getVersion() {
  return new Promise((resolve, reject) => {
    https.get(
      'https://ayerss.github.io/fishbook/version.json',
      res => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(JSON.parse(data))
        });
      }).on("error", (err) => {
        reject(err);
      });
  })
}

function format(version) {
  return Number(version.replace(/\./g, ''));
}

module.exports = async () => {
  const confJson = require(path.resolve(global.fishBook.confPath));
  const saveConf = require(path.resolve(global.fishBook.srcPath, 'utils', 'saveConf.js'));

  const { checkVersion } = confJson;
  const now = Date.now();

  if ( now > checkVersion.lastTimestamp + 864e5 ) {
    const data = await getVersion();
    confJson.checkVersion = {
      lastTimestamp: now,       // 最后一次检查的时间戳
      latest: data.latest       // 最后一个的版本
    };
    saveConf(global.fishBook.confPath, confJson);
  } else {
    if (format(checkVersion.latest) > format(version)) {
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
${chalk.yellow('|')}  New ${chalk.cyan('patch')} version of fishbook available! ${chalk.red(version)} -> ${chalk.green(checkVersion.latest)}  ${chalk.yellow('|')}
${chalk.yellow('|')}          Run ${chalk.green('npm install -g fishbook')} to update!           ${chalk.yellow('|')}
${chalk.yellow('|                                                           |')}
${chalk.yellow('\'-----------------------------------------------------------\'')}
`);

      return false;
    }
  }

  return true;
}


