import { EmbedBuilder, AuditLogEvent } from 'discord.js';
import Logging from '../../Mongo/Schemas/Logging.js';
import Event from '../../Structures/Event.js';
import RagnarokEmbedF from '../../Structures/RagnarokEmbed.js';

export const EventF = class extends Event {
  async run(message) {
    if (!message) return;
    if (message.guild) {
      if (!message.author || message.author.bot) return;

      const id = await Logging.findOne({ GuildId: message.guild.id });
      if (!id) return;
      const logs = id.ChannelId;
      if (!logs) return;

      const fetchedLogs = await message.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MessageDelete
      });
      const deletionLog = fetchedLogs.entries.first();

      if (!deletionLog) {
        const noLogE = new EmbedBuilder()
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .setAuthor({
            name: `${message.author.tag}`,
            iconURL: this.client.user.displayAvatarURL({ extension: 'png' })
          })
          .setTitle('Message Deleted')
          .setDescription(`**◎ No Data:** A message sent by <@${message.author.id}> was deleted but no content was found.**`)
          .setTimestamp();
        this.client.channels.cache.get(logs).send({ embeds: [noLogE] });
        return;
      }

      const attachments = message.attachments.size ? message.attachments.map((attachment) => attachment.proxyURL) : null;
      const embed = new RagnarokEmbedF()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .setAuthor({
          name: `${message.author.tag}`,
          iconURL: this.client.user.displayAvatarURL({ extension: 'png' })
        })
        .setTitle('Message Deleted')
        .setDescription(
          `**◎ Message ID:** ${message.id}
				**◎ Channel:** ${message.channel}
				**◎ Author:** ${message.guild.members.resolve(message.author) ? message.author : message.author.username}
				${attachments ? `**◎ Attachments:** ${attachments.join('\n')}` : ''}`
        )
        .setTimestamp();
      if (message.content.length) {
        embed.splitFields(`**◎ Deleted Message:** ${message.content}`);
      }
      this.client.channels.cache.get(logs).send({ embeds: [embed] });
    }
  }
};

export default EventF;
