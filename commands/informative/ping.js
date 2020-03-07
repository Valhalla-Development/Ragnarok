const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'ping',
    usage: '${prefix}ping',
    category: 'informative',
    description: 'Displays bot latency',
    accessableby: 'Everyone',
  },
  run: async (bot, message) => {
    if (message.member.guild.me.hasPermission('MANAGE_MESSAGES')) {
      message.delete();
    }

    const pingMessage = language.ping.ping;
    const ping = pingMessage.replace('${ping}', Math.round(bot.ws.ping));

    message.channel.send(`${ping}`);
  },
};
