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

    try {
      // Use an object to map the possible values of args to event names.
      const events = {
        guildMemberAdd: 'guildMemberAdd',
        guildMemberRemove: 'guildMemberRemove',
        guildBanAdd: 'guildBanAdd',
        channelUpdate: 'channelUpdate',
        guildBanRemove: 'guildBanRemove'
      };

        this.client.emit(events[args], interaction.member);
    } catch (error) {
      console.error(error)
    }
  }
};

export default SlashCommandF;
