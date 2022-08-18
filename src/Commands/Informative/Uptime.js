import { EmbedBuilder } from 'discord.js';
import Command from '../../Structures/Command.js';

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      description: 'Displays bot uptime.',
      category: 'Informative'
    });
  }

  async run(message) {
    const nowInMs = Date.now() - this.client.uptime;
    const nowInSecond = Math.round(nowInMs / 1000);

    const botembed = new EmbedBuilder()
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
      .addFields({ name: `**${this.client.user.username} - Uptime**`, value: `**◎ My uptime is:** <t:${nowInSecond}:R>` });
    message.channel.send({ embeds: [botembed] });
  }
};

export default CommandF;
