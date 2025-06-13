import { ActivityType, ChannelType, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { type ArgsOf, type Client, Discord, On } from 'discordx';
import Logging from '../mongo/Logging.js';
import Tickets from '../mongo/Tickets.js';
import { color, updateStatus } from '../utils/Util.js';

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
        updateStatus(client);

        // Check if the user has a ticket
        const userTicket = await Tickets.findOne({
            GuildId: member.guild.id,
            AuthorId: member.user.id,
        });
        if (userTicket) {
            // Fetch the channel
            const channel = member.guild.channels.cache.get(userTicket.ChannelId);

            // Check if the channel exists
            if (channel && channel.type === ChannelType.GuildText) {
                // Send a message that the user left
                const existTM = new EmbedBuilder()
                    .setColor(color(member.guild!.members.me!.displayHexColor))
                    .addFields({
                        name: `**${client.user?.username} - Ticket**`,
                        value: `${member} - \`@${member.user.tag}${member.user.discriminator !== '0' ? `#${member.user.discriminator}` : ''}\` has the left the server\nThey will be added back to the ticket if they rejoin.`,
                    });
                channel.send({ embeds: [existTM] });
            }
        }

        // If logging is enabled, send an embed to the set channel
        const logging = await Logging.findOne({ GuildId: member.guild.id });
        if (logging) {
            // Fetch the logging channel
            const channel =
                member.guild?.channels.cache.get(logging.ChannelId) ??
                (await member.guild?.channels.fetch(logging.ChannelId));

            // Check if the channel exists, is a text channel, and has the necessary permissions to send messages
            if (
                channel &&
                channel.type === ChannelType.GuildText &&
                channel
                    .permissionsFor(channel.guild.members.me!)
                    .has(PermissionsBitField.Flags.SendMessages)
            ) {
                // Create an embed with information about the joined member
                const embed = new EmbedBuilder()
                    .setColor('#FE4611')
                    .setThumbnail(member.user.displayAvatarURL())
                    .setAuthor({
                        name: 'Member Left',
                        iconURL: `${member.user.displayAvatarURL()}`,
                    })
                    .setDescription(
                        `${member} - \`@${member.user.tag}${member.user.discriminator !== '0' ? `#${member.user.discriminator}` : ''}\``
                    )
                    .setFooter({ text: `ID: ${member.user.id}` })
                    .setTimestamp();

                // Send the embed to the logging channel
                if (channel) {
                    channel.send({ embeds: [embed] });
                }
            }
        }
    }
}
