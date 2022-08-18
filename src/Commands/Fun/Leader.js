/* eslint-disable no-continue */
import { EmbedBuilder } from 'discord.js';
import SQLite from 'better-sqlite3';
import Command from '../../Structures/Command.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ['leaderboard'],
      description: 'Displays the leaderboard for the level system.',
      category: 'Fun',
      usage: '[@user]'
    });
  }

  async run(message) {
    const levelDb = db.prepare(`SELECT status FROM level WHERE guildid = ${message.guild.id};`).get();
    if (levelDb) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Leader**`, value: '**◎ Error:** Level system is disabled for this guild!' });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    const top10 = db.prepare('SELECT * FROM scores WHERE guild = ? ORDER BY points DESC;').all(message.guild.id);
    if (!top10) {
      return;
    }

    let userNames = '';
    let levels = '';
    let xp = '';
    let j = 0;

    for (let i = 0; i < top10.length; i += 1) {
      const data = top10[i];
      const fetchUsers = message.guild.members.cache.get(data.user);

      if (fetchUsers === undefined) {
        continue;
      }

      j += 1;

      userNames += `◎ \`${j}\` ${fetchUsers}\n`;
      levels += `\`${data.level}\`\n`;
      xp += `\`${data.points.toLocaleString('en')}\`\n`;
      if (j === 10) break;
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: `Leaderboard for ${message.guild.name}`, iconURL: message.guild.iconURL({ extension: 'png' }) })
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
      .addFields(
        { name: 'Top 10', value: userNames, inline: true },
        { name: 'Level', value: levels, inline: true },
        { name: 'XP', value: xp, inline: true }
      );
    message.channel.send({ embeds: [embed] });
  }
};

export default CommandF;
