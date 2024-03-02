import {
    Client, Discord, Guard, Slash, SlashOption,
} from 'discordx';
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    EmbedBuilder,
    GuildMember,
    GuildMemberRoleManager,
    GuildTextBasedChannel,
    PermissionsBitField,
} from 'discord.js';
import { Category } from '@discordx/utilities';
import { BotHasPerm } from '../../guards/BotHasPerm.js';
import { color, RagnarokEmbed } from '../../utils/Util.js';
import Logging from '../../mongo/schemas/Logging.js';

@Discord()
@Category('Moderation')
export class Kick {
    /**
     * Kick a user from the server.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param user - User to kick
     * @param reason - Reason for the kick (optional)
     */
    @Slash({
        description: 'Kick a user from the server.',
        defaultMemberPermissions: [PermissionsBitField.Flags.KickMembers],
    })
    @Guard(BotHasPerm([PermissionsBitField.Flags.KickMembers]))
    async kick(
        @SlashOption({
            description: 'Specify the user to kick.',
            name: 'user',
            required: true,
            type: ApplicationCommandOptionType.User,
        })
            user: GuildMember,
        @SlashOption({
            description: 'Provide a reason for the kick.',
            name: 'reason',
            type: ApplicationCommandOptionType.String,
        })
            reason: string,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        // If user id = message id
        if (user.id === interaction.user.id) {
            await RagnarokEmbed(client, interaction, 'Error', 'You cannot kick yourself!', true);
            return;
        }

        // Check if the user has a role that is higher than the message author
        const memberRoles = interaction.member!.roles as GuildMemberRoleManager;
        if (user.roles.highest.position >= memberRoles.highest.position) {
            await RagnarokEmbed(client, interaction, 'Error', 'You cannot kick someone with a higher role than yourself!', true);
            return;
        }

        // Check if user is kickable
        if (
            user.permissions.has(PermissionsBitField.Flags.ManageGuild)
            || user.permissions.has(PermissionsBitField.Flags.Administrator)
            || !user.kickable
        ) {
            await RagnarokEmbed(client, interaction, 'Error', `You cannot kick ${user}`, true);
            return;
        }

        // Check if user is the bot
        if (user.id === client.user?.id) {
            await RagnarokEmbed(client, interaction, 'Error', 'You cannot kick me. :slight_frown:', true);
            return;
        }

        // Kick the user and send the embed
        interaction.guild!.members.kick(user, `${reason || 'No reason given.'}`).catch(async () => {
            await RagnarokEmbed(client, interaction, 'Error', 'An error occurred!', true);
        });

        try {
            const authoMes = new EmbedBuilder()
                .setThumbnail(`${client.user?.displayAvatarURL()}`)
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .addFields({
                    name: `You have been kicked from: \`${interaction.guild!.name}\``,
                    value: `**◎ Reason:** ${reason || 'No reason given.'}
                    **◎ Moderator:** ${interaction.user.tag}`,
                })
                .setFooter({ text: 'You have been kicked' })
                .setTimestamp();

            await user.send({ embeds: [authoMes] });
        } catch {
            // Do nothing
        }

        const embed = new EmbedBuilder()
            .setColor('#FE4611')
            .setAuthor({ name: 'Member Kicked', iconURL: user.user.displayAvatarURL() })
            .setThumbnail(user.user.displayAvatarURL())
            .setDescription(`${user} - \`@${user.user.tag}${user.user.discriminator !== '0' ? `#${user.user.discriminator}` : ''}\``)
            .setFooter({ text: `ID: ${user.id}` })
            .setTimestamp();

        // Add a field for the ban reason if it exists
        if (reason) {
            embed.addFields({ name: 'Reason', value: `\`${reason}\`` });
        }

        const id = await Logging.findOne({ GuildId: interaction.guild!.id });

        if (id) {
            const loggingChannel = client.channels.cache.get(id.ChannelId) as GuildTextBasedChannel;

            if (loggingChannel) loggingChannel.send({ embeds: [embed] });
        }
    }
}
