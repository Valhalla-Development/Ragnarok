import { EmbedBuilder, ChannelType } from 'discord.js';
import Logging from '../../Mongo/Schemas/Logging.js';
import Event from '../../Structures/Event.js';

export const EventF = class extends Event {
  async run(oldChannel, newChannel) {
    const id = await Logging.findOne({ guildId: oldChannel.guild.id });
    if (!id) return;

    const logs = id.channel;
    if (!logs) return;

    let updateM;
    let oldTopic;
    let newTopic;
    let oldNs;
    let newNs;

    const logembed = new EmbedBuilder()
      .setColor(this.client.utils.color(oldChannel.guild.members.me.displayHexColor))
      .setAuthor({
        name: `${oldChannel.guild.name}`,
        iconURL: oldChannel.guild.iconURL()
      })
      .setTitle('Channel Updated')
      .setFooter({ text: `ID: ${newChannel.id}` })
      .setTimestamp();

    if (oldChannel.type === ChannelType.GuildCategory) {
      if (oldChannel.name !== newChannel.name) {
        updateM = `**◎ Category Name Updated:**\nOld:\n\`${oldChannel.name}\`\nNew:\n\`${newChannel.name}\``;
        logembed.setDescription(updateM);
        this.client.channels.cache.get(logs).send({ embeds: [logembed] });
      }
    }

    if (oldChannel.type === ChannelType.GuildVoice) {
      if (oldChannel.name !== newChannel.name) {
        updateM = `**◎ Voice Channel Name Updated:**\nOld:\n\`${oldChannel.name}\`\nNew:\n\`${newChannel.name}\``;
        logembed.setDescription(updateM);
        this.client.channels.cache.get(logs).send({ embeds: [logembed] });
      }
    }

    if (oldChannel.type === ChannelType.GuildText) {
      if (oldChannel.name !== newChannel.name) {
        updateM = `**◎ Channel Name Updated:**\nOld:\n\`#${oldChannel.name}\`\nNew:\n<#${newChannel.id}>`;
        logembed.setDescription(updateM);
        this.client.channels.cache.get(logs).send({ embeds: [logembed] });
      }
    }

    if (oldChannel.nsfw !== newChannel.nsfw) {
      if (oldChannel.nsfw === true) {
        oldNs = 'Enabled';
      } else {
        oldNs = 'Disabled';
      }
      if (newChannel.nsfw === true) {
        newNs = 'Enabled';
      } else {
        newNs = 'Disabled';
      }
      updateM = `**◎ NSFW Status Updated:**\nOld:\n\`${oldNs}\`\nNew:\n\`${newNs}\``;
      logembed.setDescription(updateM);
      this.client.channels.cache.get(logs).send({ embeds: [logembed] });
    } else {
      return;
    }

    if (oldChannel.topic !== newChannel.topic) {
      if (oldChannel.topic === '') {
        oldTopic = 'None';
      } else {
        oldTopic = `${oldChannel.topic}`;
      }
      if (newChannel.topic === '') {
        newTopic = 'None';
      } else {
        newTopic = `${newChannel.topic}`;
      }
      updateM = `**◎ Channel Topic Updated:**\nOld:\n\`${oldTopic}\`\nNew:\n\`${newTopic}\``;
      logembed.setDescription(updateM);
      this.client.channels.cache.get(logs).send({ embeds: [logembed] });
    }
  }
};

export default EventF;
