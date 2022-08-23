/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
import { EmbedBuilder } from 'discord.js';
import SQLite from 'better-sqlite3';
import SlashCommand from '../../Structures/SlashCommand.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Displays the leaderboard for the level system.',
      category: 'Fun'
    });
  }

  async run(interaction) {
    //! COME BACK TO THIS
    const levelDb = db.prepare(`SELECT status FROM level WHERE guildid = ${interaction.guild.id};`).get();
    if (levelDb) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Leader**`, value: '**◎ Error:** Level system is disabled for this guild!' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    const top10 = db.prepare('SELECT * FROM scores WHERE guild = ? ORDER BY points DESC;').all(interaction.guild.id);
    if (top10) {
      /* const embed = new EmbedBuilder()
        .setAuthor({ name: `Leaderboard for ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields(
          { name: 'Top 10', value: userNames, inline: true },
          { name: 'Level', value: levels, inline: true },
          { name: 'XP', value: xp, inline: true }
        );
      interaction.reply({ embeds: [embed] }); */
    }
  }
};

export default SlashCommandF;
