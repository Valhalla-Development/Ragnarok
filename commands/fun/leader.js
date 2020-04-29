const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
  config: {
    name: 'leader',
    aliases: ['pleader'],
    usage: '${prefix}leader',
    category: 'fun',
    description: 'Displays level leaderboard',
    accessableby: 'Everyone',
  },
  run: async (bot, message) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    const top10 = db
      .prepare(
        'SELECT * FROM scores WHERE guild = ? ORDER BY points DESC LIMIT 10;',
      )
      .all(message.guild.id);
    if (!top10) {
      return;
    }

    let userNames = '';
    let levels = '';
    let xp = '';
    for (let i = 0; i < top10.length; i++) {
      const data = top10[i];
      let user = bot.users.cache.get(data.user);
      if (user === undefined) {
        user = 'User Left Guild.';
      }

      userNames += `\`${i + 1}\` ${user}\n`;
      levels += `\`${data.level}\`\n`;
      xp += `\`${data.points.toLocaleString('en')}\`\n`;
    }

    const embed = new MessageEmbed()
      .setAuthor(`Leaderboard for ${message.guild.name}`, message.guild.iconURL({ dynamic: true }))
      .setColor('36393F')
      .addFields({ name: 'Top 10', value: userNames, inline: true },
        { name: 'Level', value: levels, inline: true },
        { name: 'XP', value: xp, inline: true });
    message.channel.send(embed);
    return;
  },
};
