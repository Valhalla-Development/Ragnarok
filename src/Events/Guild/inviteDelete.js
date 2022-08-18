import { EmbedBuilder } from 'discord.js';
import SQLite from 'better-sqlite3';
import Event from '../../Structures/Event.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const EventF = class extends Event {
  async run(invite) {
    const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${invite.guild.id};`).get();
    if (!id) return;

    const logs = id.channel;
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
