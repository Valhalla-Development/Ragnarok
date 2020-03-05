/* eslint-disable no-mixed-operators */
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
  config: {
    name: 'level',
    usage: '${prefix}level',
    category: 'fun',
    description: 'Displays current level',
    accessableby: 'Everyone',
  },
  run: async (bot, message) => {
    bot.getScore = db.prepare(
      'SELECT * FROM scores WHERE user = ? AND guild = ?',
    );
    bot.setScore = db.prepare(
      'INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);',
    );

    const user = message.mentions.users.first() || message.author;
    if (user.bot) return;

    let score;
    if (message.guild) {
      score = bot.getScore.get(user.id, message.guild.id);
    }
    let level;
    let points;
    let difference;
    if (!score) {
      level = '0';
      points = '0';
      difference = '100';
    } else {
      level = score.level;
      points = score.points;
      const levelNoMinus = score.level + 1;
      const nxtLvlXp = (5 / 6 * levelNoMinus * (2 * levelNoMinus * levelNoMinus + 27 * levelNoMinus + 91));
      difference = nxtLvlXp - points;
    }

    const embed = new MessageEmbed()
      .setAuthor(`${user.username}'s Level`)
      .setColor('36393F')
      .setThumbnail(user.displayAvatarURL())
      .addFields({ name: 'XP', value: `\`${points.toLocaleString('en')}\``, inline: true },
        { name: 'Level', value: `\`${level}\``, inline: true })
      .setFooter(`${difference.toLocaleString('en')} XP required to level up!`);

    message.channel.send(embed);
    if (score) {
      if (score.points === 69) message.channel.send('https://tenor.com/view/noice-nice-click-gif-8843762');
    }
  },
};
