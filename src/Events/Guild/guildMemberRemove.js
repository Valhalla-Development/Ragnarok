import { EmbedBuilder, ActivityType } from 'discord.js';
import SQLite from 'better-sqlite3';
import Event from '../../Structures/Event.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const EventF = class extends Event {
  async run(member) {
    this.client.user.setActivity(
      `${this.client.prefix}help | ${this.client.guilds.cache.size.toLocaleString('en')} Guilds ${this.client.guilds.cache
        .reduce((a, b) => a + b.memberCount, 0)
        .toLocaleString('en')} Users`,
      {
        type: ActivityType.Watching
      }
    );

    function checkTicket(client) {
      // Check if the user has a ticket
      const foundTicket = db.prepare(`SELECT * FROM tickets WHERE guildid = ${member.guild.id} AND authorid = (@authorid)`);
      if (foundTicket.get({ authorid: member.user.id })) {
        // Fetch the channel
        const channel = member.guild.channels.cache.get(foundTicket.get({ authorid: member.user.id }).chanid);

        // Check if the channel exists
        if (channel) {
          // Send a message that the user left
          const existTM = new EmbedBuilder().setColor(client.utils.color(member.guild.members.me.displayHexColor)).addFields({
            name: `**${client.user.username} - Ticket**`,
            value: `**◎ Error:** \`${member.user.tag}\` has the left the server\nThey will be added back to the ticket if they rejoin.`
          });
          channel.send({ embeds: [existTM] });
        }
      }
    }
    checkTicket(this.client);

    function logging(grabClient) {
      const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${member.guild.id};`).get();
      if (!id) return;

      const logs = id.channel;
      if (!logs) return;

      const chnCheck = grabClient.channels.cache.get(logs);
      if (!chnCheck) {
        db.prepare('DELETE FROM logging WHERE guildid = ?').run(member.guild.id);
      }

      const logembed = new EmbedBuilder()
        .setColor(grabClient.utils.color(member.guild.members.me.displayHexColor))
        .setAuthor({
          name: `${member.guild.name}`,
          iconURL: member.user.avatarURL()
        })
        .setDescription(
          `**◎ Member Left:** \`${member.user.tag}\` - \`(${member.user.id})\`\n**◎ Account Created:** <t:${Math.round(
            member.user.createdTimestamp / 1000
          )}> - (<t:${Math.round(member.user.createdTimestamp / 1000)}:R>)\n**◎ Joined:** <t:${Math.round(
            member.joinedTimestamp / 1000
          )}> - (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)\n**◎ Left:** <t:${Math.floor(new Date().getTime() / 1000)}> - (<t:${Math.floor(
            new Date().getTime() / 1000
          )}:R>)`
        )
        .setFooter({ text: `ID: ${member.user.id}` })
        .setTimestamp();
      grabClient.channels.cache.get(logs).send({ embeds: [logembed] });
    }
    logging(this.client);
  }
};

export default EventF;
