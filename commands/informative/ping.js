module.exports = {
  config: {
    name: 'ping',
    usage: '${prefix}ping',
    category: 'informative',
    description: 'Displays bot latency',
    accessableby: 'Everyone',
  },
  run: async (bot, message) => {
    message.channel.send('Pong!').then((msg) => {
      msg.edit(`Bot latency: \`${msg.createdTimestamp - message.createdTimestamp}\`ms. API latency: \`${Math.round(bot.ws.ping)}\`ms.`);
    });
  },
};
