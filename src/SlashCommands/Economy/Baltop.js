/* eslint-disable no-continue */
import { EmbedBuilder } from 'discord.js';
import SQLite from 'better-sqlite3';
import SlashCommand from '../../Structures/SlashCommand.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Displays the leaderboard for the economy system',
      category: 'Economy'
    });
  }

  async run(interaction) {
    const top10 = db.prepare('SELECT * FROM balance WHERE guild = ? ORDER BY total DESC;').all(interaction.guild.id);
    if (!top10) {
      return;
    }

    let userNames = '';
    let total = '';
    let j = 0;

    for (let i = 0; i < top10.length; i += 1) {
      const data = top10[i];
      const fetchUsers = interaction.guild.members.cache.get(data.user);

      if (fetchUsers === undefined) {
        continue;
      }

      j += 1;

      userNames += `◎ \`${j}\` ${fetchUsers}\n`;
      total += `<:coin:706659001164628008> \`${data.total.toLocaleString('en')}\`\n`;
      if (j === 10) break;
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: `Leaderboard for ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ extension: 'png' }) })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({ name: 'Top 10', value: userNames, inline: true }, { name: 'Total', value: total, inline: true });
    interaction.reply({ embeds: [embed] });
  }
};

export default SlashCommandF;
