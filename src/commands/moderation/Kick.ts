import { Category } from '@discordx/utilities';
import {
    ApplicationCommandOptionType,
    type CommandInteraction,
    type GuildMember,
    type GuildMemberRoleManager,
    type GuildTextBasedChannel,
    MessageFlags,
    PermissionsBitField,
} from 'discord.js';
import { type Client, Discord, Guard, Slash, SlashOption } from 'discordx';
import { BotHasPerm } from '../../guards/BotHasPerm.js';
import Logging from '../../mongo/Logging.js';
import { RagnarokComponent, RagnarokContainer } from '../../utils/Util.js';

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
        client: Client
    ): Promise<void> {
        // If user id = message id
        if (user.id === interaction.user.id) {
            await RagnarokComponent(interaction, 'Error', 'You cannot kick yourself!', true);
            return;
        }

        // Check if the user has a role that is higher than the message author
        const memberRoles = interaction.member!.roles as GuildMemberRoleManager;
        if (user.roles.highest.position >= memberRoles.highest.position) {
            await RagnarokComponent(
                interaction,
                'Error',
                'You cannot kick someone with a higher role than yourself!',
                true
            );
            return;
        }

        // Check if user is kickable
        if (
            user.permissions.has(PermissionsBitField.Flags.ManageGuild) ||
            user.permissions.has(PermissionsBitField.Flags.Administrator) ||
            !user.kickable
        ) {
            await RagnarokComponent(interaction, 'Error', `You cannot kick ${user}`, true);
            return;
        }

        // Check if user is the bot
        if (user.id === client.user?.id) {
            await RagnarokComponent(
                interaction,
                'Error',
                'You cannot kick me. :slight_frown:',
                true
            );
            return;
        }

        // Kick the user and send the embed
        interaction.guild!.members.kick(user, `${reason || 'No reason given.'}`).catch(async () => {
            await RagnarokComponent(
                interaction,
                'Error',
                'Kick failed. Check role hierarchy and my Kick Members permission.',
                true
            );
        });

        try {
            const dmContainer = RagnarokContainer(
                `You have been kicked from: \`${interaction.guild!.name}\``,
                `**Reason:** ${reason || 'No reason given.'}\n**Moderator:** ${interaction.user.tag}`
            );
            await user.send({ components: [dmContainer], flags: MessageFlags.IsComponentsV2 });
        } catch {
            // Do nothing
        }

        const logLines = [
            `${user} - \`@${user.user.tag}${user.user.discriminator !== '0' ? `#${user.user.discriminator}` : ''}\``,
            `**Avatar:** ${user.user.displayAvatarURL()}`,
            `**ID:** \`${user.id}\``,
        ];
        if (reason) {
            logLines.push(`**Reason:** \`${reason}\``);
        }
        const logContainer = RagnarokContainer('Member Kicked', logLines.join('\n'));

        const id = await Logging.findOne({ GuildId: interaction.guild!.id });

        if (id?.ChannelId) {
            const loggingChannel = client.channels.cache.get(id.ChannelId) as GuildTextBasedChannel;

            if (loggingChannel) {
                loggingChannel.send({
                    components: [logContainer],
                    flags: MessageFlags.IsComponentsV2,
                    allowedMentions: { parse: [] },
                });
            }
        }
    }
}
