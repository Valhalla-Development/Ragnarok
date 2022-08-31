import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('avatar')
  .setDescription('Display users profile picture')
  .addUserOption((option) => option.setName('user').setDescription('Select a user').setRequired(true));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Display users profile picture',
      category: 'Fun',
      options: data
    });
  }

  async run(interaction) {
    const member = interaction.options.getMember('user');

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${member.user.username}'s Avatar`, iconURL: member.user.avatarURL() })
      .setImage(member.user.avatarURL({ size: 1024 }))
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor));
    interaction.reply({ embeds: [embed] });
  }
};

export default SlashCommandF;
