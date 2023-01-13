import { EmbedBuilder } from 'discord.js';
import Event from '../../Structures/Event.js';
import Logging from '../../Mongo/Schemas/Logging.js';

export const EventF = class extends Event {
  async run(role) {
    const id = await Logging.findOne({ guildId: role.guild.id });
    if (!id) return;

    const logs = id.channel;
    if (!logs) return;

    const logembed = new EmbedBuilder()
      .setAuthor({ name: `${role.guild.name}`, iconURL: role.guild.iconURL() })
      .setDescription(`**◎ Role Created: \`${role.name}\`.**`)
      .setColor(this.client.utils.color(role.guild.members.me.displayHexColor))
      .setTimestamp();
    this.client.channels.cache.get(logs).send({ embeds: [logembed] });
  }
};

export default EventF;
