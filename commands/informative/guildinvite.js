const { MessageEmbed } = require('discord.js');
const { ownerID } = require('../../storage/config.json');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'guildinvite',
    aliases: ['ginvite'],
    usage: '${prefix}guildinvite',
    category: 'informative',
    description: 'Posts an invite link to current Discord',
    accessableby: 'Everyone',
  },
  run: async (bot, message) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    if (
      !message.member.hasPermission('CREATE_INSTANT_INVITE') && message.author.id !== ownerID) {
      message.channel.send(`${language.invite.noPermission}`);
      return;
    }

    message.channel
      .createInvite({
        maxAge: 0,
      })
      .then((invite) => {
        const embed = new MessageEmbed()
          .setColor('36393F')
          .setDescription(
            `:white_check_mark: **Permanent Invite Link**: ${invite}`,
          );
        message.channel.send(embed);
      });
  },
};
