import { EmbedBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Displays bot uptime.',
      category: 'Informative'
    });
  }

  async run(interaction) {
    const nowInMs = Date.now() - this.client.uptime;
    const nowInSecond = Math.round(nowInMs / 1000);

    const embed = new EmbedBuilder()
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({ name: `**${this.client.user.username} - Uptime**`, value: `**◎ My uptime is:** <t:${nowInSecond}:R>` });
    interaction.reply({ embeds: [embed] });
  }
};

export default SlashCommandF;
