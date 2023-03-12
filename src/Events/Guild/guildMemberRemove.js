import { EmbedBuilder, ActivityType } from 'discord.js';
import Event from '../../Structures/Event.js';
import Tickets from '../../Mongo/Schemas/Tickets.js';
import Logging from '../../Mongo/Schemas/Logging.js';

export const EventF = class extends Event {
  async run(member) {
    this.client.user.setActivity(
      `/help | ${this.client.guilds.cache.size.toLocaleString('en')} Guilds ${this.client.guilds.cache
        .reduce((a, b) => a + b.memberCount, 0)
        .toLocaleString('en')} Users`,
      {
        type: ActivityType.Watching
      }
    );

    async function checkTicket(client) {
      // Check if the user has a ticket
      const foundTicket = await Tickets.findOne({ GuildId: member.guild.id, AuthorId: member.user.id });
      if (foundTicket) {
        // Fetch the channel
        const channel = member.guild.channels.cache.get(foundTicket.ChannelId);

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
    await checkTicket(this.client);

    async function logging(grabClient) {
      const id = await Logging.findOne({ GuildId: member.guild.id });
      if (!id) return;

      const logs = id.ChannelId;
      if (!logs) return;

      const chnCheck = grabClient.channels.cache.get(logs);
      if (!chnCheck) {
        await Logging.deleteOne({ GuildId: member.guild.id });
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
    await logging(this.client);
  }
};

export default EventF;
