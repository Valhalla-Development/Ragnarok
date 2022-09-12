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
    const member = interaction.options.getUser('user');
    await member.fetch().then((usr) => {
      const avatar = usr.avatarURL({ size: 2048 });

      if (!avatar) {
        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Avatar**`, value: `**◎ Error:** ${usr} does not have an avatar set.` });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setAuthor({ name: `${usr.username}'s Avatar`, iconURL: usr.avatarURL() })
        .setImage(avatar)
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor));
      interaction.reply({ embeds: [embed] });
    });
  }
};

export default SlashCommandF;
