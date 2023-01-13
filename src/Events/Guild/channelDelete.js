import { EmbedBuilder, ChannelType } from 'discord.js';
import Logging from '../../Mongo/Schemas/Logging.js';
import Event from '../../Structures/Event.js';

export const EventF = class extends Event {
  async run(channel) {
    const channelId = await Logging.findOne({ guildId: channel.guild.id });
    if (!channelId) return;

    const logs = channelId.channel;
    if (!logs) return;

    const logEmbed = new EmbedBuilder()
      .setColor(this.client.utils.color(channel.guild.members.me.displayHexColor))
      .setAuthor({
        name: `${channel.guild.name}`,
        iconURL: channel.guild.iconURL()
      })
      .setTitle('Channel Deleted')
      .setFooter({ text: `ID: ${channel.id}` })
      .setTimestamp();

    let updateMessage;

    if (channel.type === ChannelType.GuildText) {
      updateMessage = `**◎ Text Channel Deleted:**\n\`#${channel.name}\``;
      logEmbed.setDescription(updateMessage);
      this.client.channels.cache.get(logs).send({ embeds: [logEmbed] });
    }

    if (channel.type === ChannelType.GuildVoice) {
      updateMessage = `**◎ Voice Channel Deleted:**\n\`${channel.name}\``;
      logEmbed.setDescription(updateMessage);
      this.client.channels.cache.get(logs).send({ embeds: [logEmbed] });
    }

    if (channel.type === ChannelType.GuildCategory) {
      updateMessage = `**◎ Category Deleted:**\n\`${channel.name}\``;
      logEmbed.setDescription(updateMessage);
      this.client.channels.cache.get(logs).send({ embeds: [logEmbed] });
    }
  }
};

export default EventF;
