import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('banner')
  .setDescription('Display users profile banner')
  .addUserOption((option) => option.setName('user').setDescription('Select a user').setRequired(true));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Display users profile banner',
      category: 'Fun',
      options: data
    });
  }

  async run(interaction) {
    const member = interaction.options.getUser('user');
    await member.fetch().then((usr) => {
      const banner = usr.bannerURL({ size: 2048 });

      if (!banner) {
        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Banner**`, value: `**◎ Error:** ${usr} does not have a banner set.` });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setAuthor({ name: `${usr.username}'s Banner`, iconURL: usr.avatarURL() })
        .setImage(banner)
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor));
      interaction.reply({ embeds: [embed] });
    });
  }
};

export default SlashCommandF;
