import { SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('emit')
  .setDescription('Emit client events')
  .addStringOption((option) => option.setName('type').setDescription('Type of event to emit').setRequired(true).setAutocomplete(true));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Emit client events',
      category: 'Hidden',
      options: data,
      ownerOnly: true
    });
  }

  async autoComplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = ['guildMemberAdd', 'guildMemberRemove', 'guildBanAdd', 'channelUpdate', 'guildBanRemove'];
    const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
    await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
  }

  async run(interaction) {
    const args = interaction.options.getString('type');

    if (args === 'guildMemberAdd') {
      this.client.emit('guildMemberAdd', interaction.member);
    }

    if (args === 'guildMemberRemove') {
      this.client.emit('guildMemberRemove', interaction.member);
    }

    if (args === 'guildBanAdd') {
      this.client.emit('guildBanAdd', interaction.member);
    }

    if (args === 'channelUpdate') {
      this.client.emit('channelUpdate', interaction.member);
    }

    if (args === 'guildBanRemove') {
      this.client.emit('guildBanRemove', interaction.member);
    }
  }
};

export default SlashCommandF;
