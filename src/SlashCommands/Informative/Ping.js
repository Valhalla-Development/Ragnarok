import { EmbedBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Displays bot and API ping.',
      category: 'Informative'
    });
  }

  async run(interaction) {
    const msg = await interaction.channel.send({ content: 'Pinging...' });
    const latency = msg.createdTimestamp - interaction.createdTimestamp;
    this.client.utils.deletableCheck(msg, 0);

    const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields([
      {
        name: `**${this.client.user.username} - Ping**`,
        value: `**◎ Bot Latency:** \`${latency}ms\`
          **◎ API Latency:** \`${Math.round(this.client.ws.ping)}ms\``
      }
    ]);

    interaction.reply({ embeds: [embed] });
  }
};

export default SlashCommandF;
