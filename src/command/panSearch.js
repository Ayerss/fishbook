const axios = require('axios');
const chalk = require('chalk');
const {
  selected,
  downloadChapter,
  download,
  updateInfo
} = require('../container/pan');

module.exports = async search => {
  const { code, data, message } = await axios.get(`${global.fishbook.api}/search?name=${encodeURIComponent(search)}`).then(res => res.data);

  if (code == 0) {
    if (data.length === 0) {
      console.log(chalk.red('\u{1F50E} 未查询到'));
      return;
    }
    const book = await selected(data);
    if (book) {
      downloadChapter(book);
      await download(book);
      await updateInfo(book);
      return true
    }
  } else {
    console.log(chalk.red(message));
  }

  return false

}
