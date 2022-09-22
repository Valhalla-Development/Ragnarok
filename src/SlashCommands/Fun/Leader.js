/* eslint-disable no-continue */
import { EmbedBuilder } from 'discord.js';
import SQLite from 'better-sqlite3';
import SlashCommand from '../../Structures/SlashCommand.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Displays the leaderboard for the level system',
      category: 'Fun'
    });
  }

  async run(interaction) {
    const levelDb = db.prepare(`SELECT status FROM level WHERE guildid = ${interaction.guild.id};`).get();
    if (levelDb) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addField(`**${this.client.user.username} - Leader**`, '**◎ Error:** Level system is disabled for this guild!');
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    const top10 = db.prepare('SELECT * FROM scores WHERE guild = ? ORDER BY points DESC;').all(interaction.guild.id);
    if (!top10) {
      return;
    }

    let userNames = '';
    let levels = '';
    let xp = '';
    let j = 0;

    for (let i = 0; i < top10.length; i++) {
      const data = top10[i];
      const fetchUsers = interaction.guild.members.cache.get(data.user);

      if (fetchUsers === undefined) {
        continue;
      }

      j++;

      userNames += `◎ \`${j}\` ${fetchUsers}\n`;
      levels += `\`${data.level}\`\n`;
      xp += `\`${data.points.toLocaleString('en')}\`\n`;
      if (j === 10) break;
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: `Leaderboard for ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ extension: 'png' }) })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields(
        { name: 'Top 10', value: userNames, inline: true },
        { name: 'Level', value: levels, inline: true },
        { name: 'XP', value: xp, inline: true }
      );
    interaction.reply({ embeds: [embed] });
  }
};

export default SlashCommandF;
