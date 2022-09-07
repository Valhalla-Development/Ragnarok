import { EmbedBuilder, PermissionsBitField, SlashCommandBuilder, ChannelType } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('say')
  .setDescription('Send a message as the bot')
  .addStringOption((option) => option.setName('input').setDescription('Text to send as the bot').setMinLength(1).setMaxLength(40).setRequired(true))
  .addChannelOption((option) => option.setName('channel').setDescription('Optional channel to send the message to'));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Makes the bot post given text',
      category: 'Moderation',
      options: data,
      userPerms: ['ManageMessages']
    });
  }

  async run(interaction) {
    const input = interaction.options.getString('input');
    const channel = interaction.options.getChannel('channel');

    if (channel) {
      if (channel.type !== ChannelType.GuildText) {
        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Say**`, value: '**◎ Error:** Please input a valid channel!' });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (!interaction.guild.members.me.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages)) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Say**`,
          value: `**◎ Error:** I do not have permissions to send a message in ${channel}!`
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      const user = interaction.guild.members.cache.get(interaction.user.id);

      if (!user.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages)) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Say**`,
          value: `**◎ Error:** You do not have permission to send messages to ${channel}!`
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      channel.send(input);

      const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Say**`,
        value: `**◎ Success:** The following message has been posted in ${channel}\n\n${input}`
      });
      interaction.reply({ ephemeral: true, embeds: [embed] });
    } else {
      await interaction.deferReply();
      interaction.deleteReply();

      interaction.channel.send(input);
    }
  }
};

export default SlashCommandF;
