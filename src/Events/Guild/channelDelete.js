import { EmbedBuilder, ChannelType } from 'discord.js';
import SQLite from 'better-sqlite3';
import Event from '../../Structures/Event.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const EventF = class extends Event {
  async run(channel) {
    const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${channel.guild.id};`).get();
    if (!id) return;

    const logs = id.channel;
    if (!logs) return;

    const logembed = new EmbedBuilder()
      .setColor(this.client.utils.color(channel.guild.members.me.displayHexColor))
      .setAuthor({
        name: `${channel.guild.name}`,
        iconURL: channel.guild.iconURL()
      })
      .setTitle('Channel Deleted')
      .setFooter({ text: `ID: ${channel.id}` })
      .setTimestamp();

    let updateM;

    if (channel.type === ChannelType.GuildText) {
      updateM = `**◎ Text Channel Deleted:**\n\`#${channel.name}\``;
      logembed.setDescription(updateM);
      this.client.channels.cache.get(logs).send({ embeds: [logembed] });
    }

    if (channel.type === ChannelType.GuildVoice) {
      updateM = `**◎ Voice Channel Deleted:**\n\`${channel.name}\``;
      logembed.setDescription(updateM);
      this.client.channels.cache.get(logs).send({ embeds: [logembed] });
    }

    if (channel.type === ChannelType.GuildCategory) {
      updateM = `**◎ Category Deleted:**\n\`${channel.name}\``;
      logembed.setDescription(updateM);
      this.client.channels.cache.get(logs).send({ embeds: [logembed] });
    }
  }
};

export default EventF;
