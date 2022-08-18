import { EmbedBuilder } from 'discord.js';
import Command from '../../Structures/Command.js';

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      description: 'Payment for TomakataABC, for contributing to the bot.',
      category: 'Hidden'
    });
  }

  async run(message) {
    const embed = new EmbedBuilder()
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
      .setImage('attachment://taco.png')
      .addFields({ name: 'Please take this **taco**. A gift from me, to you!', value: '_ _' });
    message.channel.send({ embeds: [embed], files: ['./Storage/Images/taco.png'] });
  }
};

export default CommandF;
