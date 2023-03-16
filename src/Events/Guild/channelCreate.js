import { EmbedBuilder, ChannelType } from 'discord.js';
import Logging from '../../Mongo/Schemas/Logging.js';

import Event from '../../Structures/Event.js';

export const EventF = class extends Event {
  async run(channel) {
    if (channel.type === ChannelType.DM) return;

    const channelId = await Logging.findOne({ GuildId: channel.guild.id });
    if (!channelId) return;

    const logs = channelId.ChannelId;
    if (!logs) return;

    const chnCheck = this.client.channels.cache.get(logs);
    if (!chnCheck) {
      await Logging.deleteOne({ GuildId: channel.guild.id });
      return;
    }

    const logEmbed = new EmbedBuilder()
      .setColor(this.client.utils.color(channel.guild.members.me.displayHexColor))
      .setAuthor({
        name: `${channel.guild.name}`,
        iconURL: channel.guild.iconURL()
      })
      .setTitle('Channel Created')
      .setFooter({ text: `ID: ${channel.id}` })
      .setTimestamp();

    let updateMessage;

    if (channel.type === ChannelType.GuildText) {
      updateMessage = `**◎ Text Channel Created:**\n<#${channel.id}>`;
      logEmbed.setDescription(updateMessage);
      this.client.channels.cache.get(logs).send({ embeds: [logEmbed] });
    }

    if (channel.type === ChannelType.GuildVoice) {
      updateMessage = `**◎ Voice Channel Created:**\n\`${channel.name}\``;
      logEmbed.setDescription(updateMessage);
      this.client.channels.cache.get(logs).send({ embeds: [logEmbed] });
    }

    if (channel.type === ChannelType.GuildCategory) {
      updateMessage = `**◎ Category Created:**\n\`${channel.name}\``;
      logEmbed.setDescription(updateMessage);
      this.client.channels.cache.get(logs).send({ embeds: [logEmbed] });
    }
  }
};

export default EventF;
