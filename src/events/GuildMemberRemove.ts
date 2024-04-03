import {
    ArgsOf, Client, Discord, On,
} from 'discordx';
import { ActivityType, ChannelType, EmbedBuilder } from 'discord.js';
import { color } from '../utils/Util.js';
import Tickets from '../mongo/Tickets.js';

/**
 * Discord.js GuildMemberRemove event handler.
 */
@Discord()
export class GuildMemberRemove {
    /**
     * Executes when the GuildMemberRemove event is emitted.
     * @param member
     * @param client - The Discord client.
     * @returns void
     */
    @On({ event: 'guildMemberRemove' })
    async onGuildMemberRemove([member]: ArgsOf<'guildMemberRemove'>, client: Client) {
        // Set activity
        client.user?.setActivity({
            type: ActivityType.Watching,
            name: `${client.guilds.cache.size.toLocaleString('en')} Guilds
            ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')} Users`,
        });

        // Check if the user has a ticket
        const userTicket = await Tickets.findOne({ GuildId: member.guild.id, AuthorId: member.user.id });
        if (userTicket) {
            // Fetch the channel
            const channel = member.guild.channels.cache.get(userTicket.ChannelId);

            // Check if the channel exists
            if (channel && channel.type === ChannelType.GuildText) {
                // Send a message that the user left
                const existTM = new EmbedBuilder().setColor(color(member.guild!.members.me!.displayHexColor)).addFields({
                    name: `**${client.user?.username} - Ticket**`,
                    value: `${member} - \`@${member.user.tag}${member.user.discriminator !== '0' ? `#${member.user.discriminator}` : ''}\` has the left the server\nThey will be added back to the ticket if they rejoin.`,
                });
                channel.send({ embeds: [existTM] });
            }
        }
    }
}
