import { EmbedBuilder } from 'discord.js';
import SQLite from 'better-sqlite3';
import Event from '../../Structures/Event.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const EventF = class extends Event {
  async run(role) {
    const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${role.guild.id};`).get();
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
