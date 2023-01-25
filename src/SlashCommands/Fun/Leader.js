/* eslint-disable no-continue */
import { EmbedBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';
import LevelConfig from '../../Mongo/Schemas/LevelConfig.js';
import Level from '../../Mongo/Schemas/Level.js';

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Displays the leaderboard for the level system',
      category: 'Fun'
    });
  }

  async run(interaction) {
    const levelDb = await LevelConfig.findOne({ GuildId: interaction.guild.id });

    if (levelDb) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addField(`**${this.client.user.username} - Leader**`, '**◎ Error:** Level system is disabled for this guild!');
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    const top10 = await Level.find({ GuildId: interaction.guild.id }).sort({ Xp: -1 });

    if (!top10) {
      return;
    }

    let userNames = '';
    let levels = '';
    let xp = '';
    let j = 0;

    for (let i = 0; i < top10.length; i++) {
      const data = top10[i];
      const fetchUsers = interaction.guild.members.cache.get(data.UserId);

      if (fetchUsers === undefined) {
        continue;
      }

      j++;

      userNames += `◎ \`${j}\` ${fetchUsers}\n`;
      levels += `\`${data.Level}\`\n`;
      xp += `\`${data.Xp.toLocaleString('en')}\`\n`;
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
