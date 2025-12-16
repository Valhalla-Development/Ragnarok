import { Category } from '@discordx/utilities';
import {
    ApplicationCommandOptionType,
    ChannelType,
    type CommandInteraction,
    EmbedBuilder,
} from 'discord.js';
import { type Client, Discord, Slash, SlashChoice, SlashOption } from 'discordx';
import { color, RagnarokEmbed } from '../../utils/Util.js';

@Discord()
@Category('Miscellaneous')
export class Ping {
    /**
     * Displays guild statistics.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param option - The option selected from the command
     */
    @Slash({ description: 'Displays guild statistics.' })
    async serverinfo(
        @SlashChoice({ name: 'Server', value: 'server' })
        @SlashChoice({ name: 'Roles', value: 'roles' })
        @SlashChoice({ name: 'Emojis', value: 'emojis' })
        @SlashOption({
            description: 'Type of request (optional)',
            name: 'option',
            type: ApplicationCommandOptionType.String,
        })
        option: string,
        interaction: CommandInteraction,
        client: Client
    ): Promise<void> {
        const roles = interaction.guild?.roles.cache
            .sort((a, b) => b.position - a.position)
            .map((role) => role.toString())
            .slice(0, -1);

        const emojis = interaction.guild?.emojis.cache;

        const emojiMap = emojis?.map((emoji) => emoji.toString());

        const verificationLevels = {
            0: 'None',
            1: 'Low',
            2: 'Medium',
            3: 'High',
            4: 'Very High',
        };

        const mfa = {
            0: 'None',
            1: 'Elevated',
        };

        if (!option || option === 'server') {
            const guildOwner = await interaction.guild?.fetchOwner();
            const channels = interaction.guild?.channels.cache;

            const textChannels = channels?.filter(
                (channel) => channel.type === ChannelType.GuildText
            );
            const voiceChannels = channels?.filter(
                (channel) => channel.type === ChannelType.GuildVoice
            );

            const embed = new EmbedBuilder()
                .setColor(color(interaction.guild?.members.me?.displayHexColor ?? '#5865F2'))
                .setThumbnail(interaction.guild?.iconURL() || '')
                .setAuthor({
                    name: `Guild Information: ${interaction.guild?.name}`,
                    iconURL: interaction.guild?.iconURL() || '',
                })
                .addFields(
                    {
                        name: 'Guild information',
                        value: `**◎ 👑 Owner:** ${guildOwner?.user}
                        **◎ 🆔 ID:** \`${interaction.guild?.id}\`
                        **◎ 📅 Created At:** <t:${Math.round((interaction.guild?.createdTimestamp ?? 0) / 1000)}> - (<t:${Math.round((interaction.guild?.createdTimestamp ?? 0) / 1000)}:R>)
                        **◎ 🔐 Verification Level:** \`${verificationLevels[interaction.guild?.verificationLevel ?? 0]}\`
                        **◎ 🔏 MFA Level:** \`${mfa[interaction.guild?.mfaLevel ?? 0]}\`
                        **◎ 🧑‍🤝‍🧑 Guild Members:** \`${(interaction.guild?.memberCount || 0) - (interaction.guild?.members.cache.filter((m) => m.user.bot).size || 0)}\`
                        **◎ 🤖 Guild Bots:** \`${interaction.guild?.members.cache.filter((m) => m.user.bot).size || 0}\`
                        \u200b`,
                    },
                    {
                        name: `**Guild Channels** [${(textChannels?.size || 0) + (voiceChannels?.size || 0)}]`,
                        value: `<:TextChannel:855591004236546058> | Text: \`${textChannels?.size}\`\n<:VoiceChannel:855591004300115998> | Voice: \`${voiceChannels?.size}\``,
                        inline: true,
                    },
                    {
                        name: '**Guild Perks**',
                        value: `<a:Booster:855593231294267412> | Boost Tier: \`${interaction.guild?.premiumTier ?? 0}\`\n<a:Booster:855593231294267412> | Boosts: \`${interaction.guild?.premiumSubscriptionCount ?? 0}\``,
                        inline: true,
                    }
                )
                .setFooter({
                    text: `${client.user?.username}`,
                    iconURL: client.user?.displayAvatarURL(),
                });

            if ((roles && roles.length > 0) || (emojiMap && emojiMap.length > 0)) {
                const value: string[] = [];

                if (roles?.length) {
                    value.push(
                        `**Server Roles [${roles.length}]**: To view all roles, run\n\`/serverinfo roles\``
                    );
                }

                if (emojiMap?.length) {
                    value.push(
                        `**Server Emojis [${emojiMap.length}]**: To view all emojis, run\n\`/serverinfo emojis\``
                    );
                }

                embed.addFields({
                    name: '**Assets**',
                    value: value.join('\n'),
                    inline: false,
                });
            }

            await interaction.reply({ embeds: [embed] });
        }

        if (option === 'roles') {
            if (!roles) {
                await RagnarokEmbed(
                    client,
                    interaction,
                    'Error',
                    'Unable to locate any roles.',
                    true
                );
                return;
            }

            let roleList = roles.join(', ');

            if (roleList.length > 4000) {
                roleList = roleList.substring(0, 4000);
                roleList = roleList.substring(0, roleList.lastIndexOf('<'));
            }

            const embed = new EmbedBuilder()
                .setColor(color(interaction.guild?.members.me?.displayHexColor ?? '#5865F2'))
                .setAuthor({
                    name: `Guild Information: ${interaction.guild?.name}`,
                    iconURL: `${interaction.guild?.iconURL()}`,
                })
                .setDescription(
                    `**Server Roles [${roles.length}]**\n${
                        roles.length <= 25
                            ? roleList
                            : `${roleList}... and ${roles.length - 25} more`
                    }`
                )
                .setFooter({
                    text: `${client.user?.username}`,
                    iconURL: client.user?.displayAvatarURL(),
                });

            await interaction.reply({ embeds: [embed] });
        }

        if (option === 'emojis') {
            if (!emojiMap) {
                await RagnarokEmbed(
                    client,
                    interaction,
                    'Error',
                    'Unable to locate any emojis.',
                    true
                );
                return;
            }

            emojiMap.sort((a, b) => a.localeCompare(b));

            let emojiList = emojiMap?.join(', ');

            if (emojiList && emojiList.length > 4000) {
                emojiList = emojiList.substring(0, 4000);
                emojiList = emojiList.substring(0, emojiList.lastIndexOf('<'));
            }

            const embed = new EmbedBuilder()
                .setColor(color(interaction.guild?.members.me?.displayHexColor ?? '#5865F2'))
                .setAuthor({
                    name: `Guild Information: ${interaction.guild?.name}`,
                    iconURL: `${interaction.guild?.iconURL()}`,
                })
                .setDescription(
                    `**Server Emojis [${emojiMap?.length ?? 0}]**\n${
                        emojiMap && emojiMap.length <= 25
                            ? emojiList
                            : `${emojiList}... and ${emojiMap.length - 25} more`
                    }`
                )
                .setFooter({
                    text: `${client.user?.username}`,
                    iconURL: client.user?.displayAvatarURL(),
                });

            await interaction.reply({ embeds: [embed] });
        }
    }
}
