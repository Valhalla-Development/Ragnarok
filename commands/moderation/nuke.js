const { ownerID } = require('../../storage/config.json');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'nuke',
    usage: '${prefix}nuke',
    category: 'moderation',
    description: 'Nukes a channel, by cloning it and deleting the original',
    accessableby: 'Staff',
  },
  run: async (bot, message) => {
    if (!message.member.hasPermission('MANAGE_CHANNELS') && message.author.id !== ownerID) {
      message.channel.send(`${language.nuke.noPermission}`).then((message) => message.delete({
        timeout: 5000,
      }));
      return;
    }
    if (!message.guild.member(bot.user).hasPermission('MANAGE_CHANNELS')) {
      message.channel.send(`${language.nuke.meNoPerms}`).then((message) => message.delete({
        timeout: 5000,
      }));
      return;
    }

    const { channel } = message;

    await channel.clone({ name: channel.name, reason: 'Nuked!' }).then((chn) => {
      channel.delete();
      chn.setParent(channel.parentID);
      chn.setPosition(channel.rawPosition);
      chn.send('Channel has been nuked!\nhttps://tenor.com/view/explosion-mushroom-cloud-atomic-bomb-bomb-boom-gif-4464831');
      return;
    });
  },
};
