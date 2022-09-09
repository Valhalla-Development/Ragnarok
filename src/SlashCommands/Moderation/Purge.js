import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Deletes specificed amount of messages')
  .addIntegerOption((option) =>
    option.setName('amount').setDescription('Amount of messages to delete').setMinValue(1).setMaxValue(100).setRequired(true)
  );

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Deletes specified amount of messages from the channel.',
      category: 'Moderation',
      options: data,
      userPerms: ['ManageMessages'],
      botPerms: ['ManageMessages']
    });
  }

  async run(interaction) {
    const messageCount = interaction.options.getInteger('amount');

    try {
      const fetch = await interaction.channel.messages.fetch({ limit: Number(messageCount) });
      await interaction.channel.bulkDelete(fetch, true);

      const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Purge**`,
        value: `**◎ Success:** ${Number(messageCount)} message${Number(messageCount) > 1 ? 's were' : ' was'} removed.`
      });
      interaction.reply({ ephemeral: true, embeds: [embed] });
    } catch {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Purge**`, value: '**◎ Error:** An error occured.' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
    }
  }
};

export default SlashCommandF;
