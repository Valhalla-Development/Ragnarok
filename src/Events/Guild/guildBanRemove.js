import { EmbedBuilder, AuditLogEvent } from 'discord.js';
import Logging from '../../Mongo/Schemas/Logging.js';
import Event from '../../Structures/Event.js';

export const EventF = class extends Event {
  async run(ban) {
    const id = await Logging.findOne({ guildId: ban.guild.id });
    if (!id) return;

    const logs = id.channel;
    if (!logs) return;

    const entry = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove }).then((audit) => audit.entries.first());

    if (entry.reason && entry.reason.includes('tempban')) return;

    const mod = entry.executor.id;

    const embed = new EmbedBuilder()
      .setThumbnail(this.client.user.displayAvatarURL())
      .setColor(this.client.utils.color(ban.guild.members.me.displayHexColor))
      .addFields({
        name: 'User Unbanned',
        value: `**◎ User:** ${ban.user.tag}
				**◎ Moderator:** ${mod}`
      })
      .setFooter({ text: 'User Ban Logs' })
      .setTimestamp();
    this.client.channels.cache.get(logs).send({ embeds: [embed] });
  }
};

export default EventF;
