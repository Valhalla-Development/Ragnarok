const { MessageEmbed } = require('discord.js');
const meme = require('memejs');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'meme',
    usage: '${prefix}meme',
    category: 'fun',
    description: 'Posts a meme',
    accessableby: 'Everyone',
  },
  run: async (bot, message, args, color) => {
    const msg = await message.channel.send('Generating...');
    message.channel.startTyping();

    meme((data) => {
      const embed = new MessageEmbed()
        .setTitle(data.title[0])
        .setColor(color)
        .setImage(data.url[0]);

      if (
        !message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')
      ) {
        message.channel.send(`${language.meme.noEmbedPermission}`);
        return;
      }
      msg.delete();
      message.channel.stopTyping();

      message.channel.send({
        embed,
      });
    });
  },
};
