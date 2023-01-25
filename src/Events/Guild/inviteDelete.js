import { EmbedBuilder } from 'discord.js';
import Logging from '../../Mongo/Schemas/Logging.js';
import Event from '../../Structures/Event.js';

export const EventF = class extends Event {
  async run(invite) {
    const id = await Logging.findOne({ GuildId: invite.guild.id });
    if (!id) return;

    const logs = id.ChannelId;
    if (!logs) return;

    const logembed = new EmbedBuilder()
      .setColor(this.client.utils.color(invite.guild.members.me.displayHexColor))
      .setAuthor({
        name: `${invite.guild.name}`,
        iconURL: invite.guild.iconURL()
      })
      .setDescription(`**◎ Invite Deleted:**\n**◎ Invite Code:** \`${invite.code}\``)
      .setTimestamp();
    this.client.channels.cache.get(logs).send({ embeds: [logembed] });
  }
};

export default EventF;
