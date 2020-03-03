module.exports = (bot) => {
  const prompt = process.openStdin();
  prompt.addListener('data', (res) => {
    const x = res
      .toString()
      .trim()
      .split(/ +/g);
    bot.channels.cache.get('534872912876797962').send(x.join(' '));
  });
};
