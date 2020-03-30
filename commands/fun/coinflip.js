const { MessageEmbed } = require('discord.js');

module.exports = {
  config: {
    name: 'coinflip',
    usage: '${prefix}coinflip',
    category: 'fun',
    description: 'Flips a coin',
    accessableby: 'Everyone',
  },
  run: async (bot, message, color) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    const rolled = Math.floor(Math.random() * 2) + 1;
    const headembed = new MessageEmbed()
      .setAuthor('Coin Flip')
      .addFields({ name: 'Result', value: 'You flipped a: **Heads**!' })
      .setColor(color);
    const tailembed = new MessageEmbed()
      .setAuthor('Coin Flip')
      .addFields({ name: 'Result', value: 'You flipped a: **Tails**!' })
      .setColor(color);
    if (rolled === '1') {
      message.channel.send(tailembed);
    }
    if (rolled === '2') {
      message.channel.send(headembed);
    }
  },
};
