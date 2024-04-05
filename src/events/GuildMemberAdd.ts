import {
    ArgsOf, Client, Discord, On,
} from 'discordx';
import { ActivityType, ChannelType, EmbedBuilder } from 'discord.js';
import { registerFont } from 'canvas';
import { color } from '../utils/Util.js';
import Tickets from '../mongo/Tickets.js';

registerFont('./assets/canvas/fonts/Handlee-Regular.ttf', {
    family: 'Handlee',
});

registerFont('./assets/canvas/fonts/Montserrat-SemiBold.ttf', {
    family: 'Montserrat',
});

/**
 * Discord.js GuildMemberAdd event handler.
 */
@Discord()
export class GuildMemberAdd {
    /**
     * Executes when the GuildMemberAdd event is emitted.
     * @param member
     * @param client - The Discord client.
     * @returns void
     */
    @On({ event: 'guildMemberAdd' })
    async onGuildMemberAdd([member]: ArgsOf<'guildMemberAdd'>, client: Client) {
        // Set activity
        client.user?.setActivity({
            type: ActivityType.Watching,
            name: `${client.guilds.cache.size.toLocaleString('en')} Guilds
            ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)
        .toLocaleString('en')} Users`,
        });

        async function checkTicket() {
            // Check if the user has a ticket
            const foundTicket = await Tickets.findOne({
                GuildId: member.guild.id,
                AuthorId: member.user.id,
            });

            if (foundTicket) {
                // Fetch the channel
                const channel = member.guild.channels.cache.get(foundTicket.ChannelId);

                // Check if the channel exists
                if (channel && channel.type === ChannelType.GuildText) {
                    // Send a message that the user joined
                    channel.permissionOverwrites
                        .create(member, {
                            ViewChannel: true,
                            SendMessages: true,
                        })
                        .catch(console.error);
                    const embed = new EmbedBuilder()
                        .setColor(color(member.guild!.members.me!.displayHexColor))
                        .addFields({
                            name: `**${client.user?.username} - Ticket**`,
                            value: `**◎:** \`${member.user}\` has rejoined the server\nThey have been added back to the ticket.`,
                        });

                    channel.send({ embeds: [embed] });
                }
            }
        }
        await checkTicket();
    }
}
