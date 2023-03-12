import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import ms from 'ms';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('slow')
  .setDescription('Sets slow mode in channel')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('time')
      .setDescription('Time to set in slow mode')
      .addStringOption((option) => option.setName('time').setDescription('Time to set in slow mode').setRequired(true))
  )
  .addSubcommand((subcommand) => subcommand.setName('off').setDescription('Turn off slow mode'));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Sets slow mode in channel',
      category: 'Moderation',
      options: data,
      userPerms: ['ManageChannels'],
      botPerms: ['ManageChannels']
    });
  }

  async run(interaction) {
    const sSub = interaction.options.getSubcommand('off');
    const time = interaction.options.getString('time');
    const { channel } = interaction;

    if (sSub === 'off') {
      if (channel.rateLimitPerUser <= 0) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Slow**`,
          value: '**◎ Error:** Slow mode is not enabled in this channel.'
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      await channel.setRateLimitPerUser(0);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Slow**`, value: `**◎ Success:** ${channel} is no longer in slowmode.` });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    const convert = ms(time);
    const toSecond = Math.floor(convert / 1000);

    if (!toSecond) {
      const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Slow**`,
        value: '**◎ Error:** You did not include a valid time! Correct usage is:\n`/slow <time>` an example would be: `/slow 10s`'
      });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    if (toSecond > 21600) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Slow**`, value: '**◎ Error:** The maximum cooldown is 6 hours.' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    if (toSecond < 1) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Slow**`, value: '**◎ Error:** The minimum cooldown is 1 second.' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    await channel.setRateLimitPerUser(toSecond);

    const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
      name: `**${this.client.user.username} - Slow**`,
      value: `**◎ Success:** ${channel} is now in slowmode. Regular users can send messages every \`${ms(ms(time), { long: true })}\``
    });
    interaction.reply({ ephemeral: true, embeds: [embed] });
  }
};

export default SlashCommandF;
