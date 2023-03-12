import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('esay')
  .setDescription('Posts given input in an embed')
  .addStringOption((option) => option.setName('input').setDescription('Text to post').setMinLength(4).setRequired(true));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Posts given input in an embed',
      category: 'Moderation',
      options: data,
      userPerms: ['ManageGuild']
    });
  }

  async run(interaction) {
    await interaction.deferReply();
    await interaction.deleteReply();

    const input = interaction.options.getString('input');
    const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).setDescription(`${input}`);
    interaction.channel.send({ embeds: [embed] });
  }
};

export default SlashCommandF;
