/* jshint -W083, -W014 */
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
  config: {
    name: 'help',
    aliases: ['commands'],
    usage: '${prefix}help <command>',
    category: 'informative',
    description: 'Shows a list of commands',
    accessableby: 'Everyone',
  },
  run: async (bot, message, args) => {
    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);
    const { prefix } = prefixgrab;

    const arr = [];
    const types = [
      'Fun',
      'Generators',
      'Informative',
      'Moderation',
      'Music',
      'Ticket',
    ];
    const embed = new MessageEmbed();

    if (!args[0]) {
      for (let i = 0; i < types.length; i++) {
        arr.push(
          bot.commands
            .filter((c) => c.config.category === types[i].toLowerCase())
            .map((c) => `\`${c.config.name.charAt(0).toUpperCase() + c.config.name.substring(1)}\``)
            .join(' '),
        );
        try {
          embed.addFields({ name: types[i], value: arr[i] });
        } catch (e) {
          embed.addFields({ name: '\u200b', value: '\u200b' });
        }
      }

      embed
        .setColor('RANDOM')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setTimestamp()
        .setDescription(
          `Hey, I'm [**__Ragnarok__**]! A multi-purpose bot!\nRun \`${prefix}help <command>\` to see command specific instructions!\nAll commands must be preceded by \`${prefix}\``,
        )
        .setFooter(`This guild's prefix is ${prefix}`, bot.user.avatarURL());
      message.channel.send(embed);
    } else {
      const command = bot.commands.get(args[0].toLowerCase())
        ? bot.commands.get(args[0].toLowerCase()).config
        : bot.commands.get(bot.aliases.get(args[0].toLowerCase())).config;
      const cUsagePrefix = command.usage.replace('${prefix}', prefix);
      if (command.accessableby === 'Owner') {
        return;
      }
      const lower = command.name;
      const upper = lower.charAt(0).toUpperCase() + lower.substring(1);

      embed
        .setColor('RANDOM')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription(
          `The bot prefix is: ${prefix}\n\n**Command:** \`${
            upper
          }\`\n**Description:** \`${command.description || 'No Description'}\`\n**Usage:** \`${cUsagePrefix || 'No Usage'}\`\n**Accessable by:** \`${command.accessableby || 'Members'}\`\n**Aliases:** \`${
            command.aliases ? command.aliases.join(', ') : 'None'
          }\``,
        );
      message.channel.send(embed);
    }
  },
};
