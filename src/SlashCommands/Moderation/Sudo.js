import { SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('sudo')
  .setDescription('Post a message as another user')
  .addUserOption((option) => option.setName('user').setDescription('User to Sudo').setRequired(true))
  .addStringOption((option) => option.setName('input').setDescription('Text to post').setMinLength(1).setMaxLength(2000).setRequired(true));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Post a message as another user',
      category: 'Moderation',
      options: data
    });
  }

  async run(interaction) {
    await interaction.deferReply();
    interaction.deleteReply();

    const user = interaction.options.getMember('user');
    const input = interaction.options.getString('input');

    this.client.functions.sudo(interaction, input, user);
  }
};

export default SlashCommandF;
