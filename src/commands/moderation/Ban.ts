import { Category } from '@discordx/utilities';
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    type CommandInteraction,
    EmbedBuilder,
    type GuildMember,
    type GuildMemberRoleManager,
    PermissionsBitField,
    codeBlock,
} from 'discord.js';
import { type Client, Discord, Guard, Slash, SlashChoice, SlashOption } from 'discordx';
import { BotHasPerm } from '../../guards/BotHasPerm.js';
import { RagnarokEmbed, color } from '../../utils/Util.js';

type DeleteTimeKey =
    | 'Previous Hour'
    | 'Previous 6 Hours'
    | 'Previous 12 Hours'
    | 'Previous 24 Hours'
    | 'Previous 3 Days'
    | 'Previous 7 Days';

@Discord()
@Category('Moderation')
export class Ban {
    /**
     * Ban a user from the server.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param user - User to ban
     * @param reason - Reason for the ban (optional)
     * @param deleteMessages - How many messages to delete from the user (optional)
     */
    @Slash({
        description: 'Ban a user from the server.',
        defaultMemberPermissions: [PermissionsBitField.Flags.BanMembers],
    })
    @Guard(BotHasPerm([PermissionsBitField.Flags.BanMembers]))
    async ban(
        @SlashOption({
            description: 'Specify the user to ban.',
            name: 'user',
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember,
        @SlashOption({
            description: 'Provide a reason for the ban.',
            name: 'reason',
            type: ApplicationCommandOptionType.String,
        })
        reason: string,
        @SlashChoice({ name: 'Previous Hour', value: 'delete1h' })
        @SlashChoice({ name: 'Previous 6 Hours', value: 'delete6h' })
        @SlashChoice({ name: 'Previous 12 Hours', value: 'delete12h' })
        @SlashChoice({ name: 'Previous 24 Hours', value: 'delete24h' })
        @SlashChoice({ name: 'Previous 3 Days', value: 'delete3d' })
        @SlashChoice({ name: 'Previous 7 Days', value: 'delete7d' })
        @SlashOption({
            description: 'Specify the number of messages to delete from the user.',
            name: 'delete_messages',
            type: ApplicationCommandOptionType.String,
        })
        deleteMessages: DeleteTimeKey,
        interaction: CommandInteraction,
        client: Client
    ): Promise<void> {
        const deleteTime = {
            'Previous Hour': 3600,
            'Previous 6 Hours': 21600,
            'Previous 12 Hours': 43200,
            'Previous 24 Hours': 86400,
            'Previous 3 Days': 259200,
            'Previous 7 Days': 604800,
        };

        const deleteMessage = deleteTime[deleteMessages || 'Previous Hour'];

        // If user id = message id
        if (user.id === interaction.user.id) {
            await RagnarokEmbed(client, interaction, 'Error', 'You cannot ban yourself!', true);
            return;
        }

        // Check if the user has a role that is higher than the message author
        const memberRoles = interaction.member!.roles as GuildMemberRoleManager;
        if (user.roles.highest.position >= memberRoles.highest.position) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'You cannot ban someone with a higher role than yourself!',
                true
            );
            return;
        }

        // Check if user is bannable
        if (
            user.permissions.has(PermissionsBitField.Flags.ManageGuild) ||
            user.permissions.has(PermissionsBitField.Flags.Administrator) ||
            !user.bannable
        ) {
            await RagnarokEmbed(client, interaction, 'Error', `You cannot ban ${user}`, true);
            return;
        }

        // Check if user is the bot
        if (user.id === client.user?.id) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'You cannot ban me. :slight_frown:',
                true
            );
            return;
        }

        // Ban the user and send the embed
        interaction
            .guild!.members.ban(user, {
                deleteMessageSeconds: deleteMessage,
                reason: `${reason || 'No reason given.'}`,
            })
            .catch(async () => {
                await RagnarokEmbed(client, interaction, 'Error', 'An error occurred!', true);
            });

        try {
            const authoMes = new EmbedBuilder()
                .setThumbnail(`${client.user?.displayAvatarURL()}`)
                .setColor(color(interaction.guild?.members.me?.displayHexColor ?? '#5865F2'))
                .addFields({
                    name: `You have been banned from: \`${interaction.guild!.name}\``,
                    value: `**◎ Reason:** ${reason || 'No reason given.'}
                    **◎ Moderator:** ${interaction.user.tag}`,
                })
                .setFooter({ text: 'You have been banned' })
                .setTimestamp();

            await user.send({ embeds: [authoMes] });
        } catch {
            // Do nothing
        }

        const embed = new EmbedBuilder()
            .setColor('#FE4611')
            .setAuthor({ name: 'Member Banned', iconURL: user.user.displayAvatarURL() })
            .setThumbnail(user.user.displayAvatarURL())
            .setDescription(
                `${user} - \`@${user.user.tag}${user.user.discriminator !== '0' ? `#${user.user.discriminator}` : ''}\``
            )
            .setFooter({ text: `ID: ${user.id}` })
            .setTimestamp();

        // Add a field for the ban reason if it exists
        if (reason) {
            embed.addFields({ name: 'Reason', value: `\`${reason}\`` });
        }

        const button = new ButtonBuilder()
            .setLabel('Unban')
            .setStyle(ButtonStyle.Danger)
            .setCustomId(`unban_Ban_${user.id}`);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

        const m = await interaction.reply({ embeds: [embed], components: [row] });

        const collector = m.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', async () => {
            try {
                const memberPerms = interaction.member!.permissions as PermissionsBitField;

                if (!memberPerms.has(PermissionsBitField.Flags.BanMembers)) {
                    await RagnarokEmbed(
                        client,
                        interaction,
                        'Error',
                        'You require the `Ban Members` permission to execute this command!',
                        true
                    );
                }

                interaction.guild!.bans.fetch().then(async (bans) => {
                    if (bans.size === 0) {
                        await RagnarokEmbed(
                            client,
                            interaction,
                            'Error',
                            'An error occurred, is the user banned?',
                            true
                        );
                        return;
                    }

                    const bUser = bans.find((ban) => ban.user.id === user.id);
                    if (!bUser) {
                        await RagnarokEmbed(
                            client,
                            interaction,
                            'Error',
                            'The user specified is not banned.',
                            true
                        );
                        return;
                    }

                    await interaction.guild!.members.unban(bUser.user);

                    collector.stop();
                });
            } catch (error) {
                await RagnarokEmbed(
                    client,
                    interaction,
                    'Error',
                    `An error occurred\n${codeBlock('text', `${error}`)}`,
                    true
                );
            }
        });

        collector.on('end', async () => {
            button.setDisabled(true);

            const unbanEmbed = new EmbedBuilder()
                .setColor('#156FA4')
                .setAuthor({
                    name: 'Member Unbanned',
                    iconURL: user.displayAvatarURL(),
                })
                .setThumbnail(user.user.displayAvatarURL())
                .setDescription(
                    `${user} - \`@${user.user.tag}${user.user.discriminator !== '0' ? `#${user.user.discriminator}` : ''}\``
                )
                .setFooter({ text: `ID: ${user.id}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [unbanEmbed], components: [row] });
        });
    }
}
