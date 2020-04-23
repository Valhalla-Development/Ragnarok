const { MessageEmbed } = require('discord.js');
const { prefix } = require('../../storage/config.json');

module.exports = async (bot, guild) => {
  console.log(
    `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${
      guild.memberCount
    } members!`,
  );
  bot.user.setActivity(
    `${prefix}help | ${(bot.guilds.cache.size).toLocaleString('en')} Guilds ${(bot.users.cache.size).toLocaleString('en')} Users`,
    {
      type: 'WATCHING',
    },
  );

  let defaultChannel = '';
  guild.channels.cache.forEach((channel) => {
    if (channel.type === 'text' && defaultChannel === '') {
      if (channel.permissionsFor(guild.me).has('SEND_MESSAGES')) {
        defaultChannel = channel;
      }
    }
  });
  const embed = new MessageEmbed()
    .setTitle('Hello, I\'m **Ragnarok**! Thanks for inviting me!')
    .setDescription('The prefix for all my commands is `-`, e.g: `-help`.\nIf you find any bugs, report them with `-bugreport <bug>`\nCheck `-stats` to see the latest announcements!');
  defaultChannel.send({
    embed,
  });
};
