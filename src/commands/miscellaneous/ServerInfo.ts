import { Category } from '@discordx/utilities';
import {
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    ChannelType,
    type CommandInteraction,
    ContainerBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import { ButtonComponent, Discord, Slash } from 'discordx';

@Discord()
@Category('Miscellaneous')
export class Ping {
    /**
     * Displays guild statistics.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'Displays guild statistics.' })
    async serverinfo(interaction: CommandInteraction): Promise<void> {
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

        const guildOwner = await interaction.guild?.fetchOwner();
        const channels = interaction.guild?.channels.cache;

        const textChannels = channels?.filter((channel) => channel.type === ChannelType.GuildText);
        const voiceChannels = channels?.filter(
            (channel) => channel.type === ChannelType.GuildVoice
        );

        const memberCount =
            (interaction.guild?.memberCount || 0) -
            (interaction.guild?.members.cache.filter((m) => m.user.bot).size || 0);
        const botCount = interaction.guild?.members.cache.filter((m) => m.user.bot).size || 0;
        const totalChannels = (textChannels?.size || 0) + (voiceChannels?.size || 0);

        const header = new TextDisplayBuilder().setContent(
            [
                `# 🏰 Guild Information: ${interaction.guild?.name}`,
                `> 👑 Owner: ${guildOwner?.user}`,
                `> 🆔 ID: \`${interaction.guild?.id}\``,
            ].join('\n')
        );

        const guildInfo = new TextDisplayBuilder().setContent(
            [
                '## 📋 Guild Information',
                '',
                `> 📅 **Created:** <t:${Math.round((interaction.guild?.createdTimestamp ?? 0) / 1000)}:F> (<t:${Math.round((interaction.guild?.createdTimestamp ?? 0) / 1000)}:R>)`,
                `> 🔐 **Verification Level:** \`${verificationLevels[interaction.guild?.verificationLevel ?? 0]}\``,
                `> 🔏 **MFA Level:** \`${mfa[interaction.guild?.mfaLevel ?? 0]}\``,
                `> 🧑‍🤝‍🧑 **Members:** \`${memberCount.toLocaleString()}\``,
                `> 🤖 **Bots:** \`${botCount.toLocaleString()}\``,
            ].join('\n')
        );

        const channelsInfo = new TextDisplayBuilder().setContent(
            [
                `## 📝 Guild Channels [${totalChannels}]`,
                '',
                `> <:TextChannel:855591004236546058> **Text:** \`${(textChannels?.size || 0).toLocaleString()}\``,
                `> <:VoiceChannel:855591004300115998> **Voice:** \`${(voiceChannels?.size || 0).toLocaleString()}\``,
            ].join('\n')
        );

        const perksInfo = new TextDisplayBuilder().setContent(
            [
                '## ⭐ Guild Perks',
                '',
                `> <a:Booster:855593231294267412> **Boost Tier:** \`${interaction.guild?.premiumTier ?? 0}\``,
                `> <a:Booster:855593231294267412> **Boosts:** \`${(interaction.guild?.premiumSubscriptionCount ?? 0).toLocaleString()}\``,
            ].join('\n')
        );

        const buttons: ButtonBuilder[] = [];
        if (roles && roles.length > 0) {
            buttons.push(
                new ButtonBuilder()
                    .setLabel(`View Roles [${roles.length.toLocaleString()}]`)
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('serverinfo_roles')
            );
        }
        if (emojiMap && emojiMap.length > 0) {
            buttons.push(
                new ButtonBuilder()
                    .setLabel(`View Emojis [${emojiMap.length.toLocaleString()}]`)
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('serverinfo_emojis')
            );
        }

        const container = new ContainerBuilder()
            .addTextDisplayComponents(header)
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(guildInfo)
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(channelsInfo)
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(perksInfo);

        if (buttons.length > 0) {
            container
                .addSeparatorComponents((separator) =>
                    separator.setSpacing(SeparatorSpacingSize.Small)
                )
                .addActionRowComponents((row) => row.addComponents(...buttons));
        }

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    @ButtonComponent({ id: 'serverinfo_roles' })
    async rolesButton(interaction: ButtonInteraction): Promise<void> {
        const roles = interaction
            .guild!.roles.cache.sort((a, b) => b.position - a.position)
            .map((role) => role.toString())
            .slice(0, -1);

        if (!roles || roles.length === 0) {
            await interaction.reply({
                content: 'Unable to locate any roles.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        let roleList = roles.join(', ');

        if (roleList.length > 4000) {
            roleList = roleList.slice(0, 4000);
            roleList = roleList.slice(0, roleList.lastIndexOf('<'));
        }

        const rolesDisplay = new TextDisplayBuilder().setContent(
            [
                `# 🎭 Server Roles [${roles.length.toLocaleString()}]`,
                '',
                roles.length <= 25
                    ? `> ${roleList}`
                    : `> ${roleList}... and ${roles.length - 25} more`,
            ].join('\n')
        );

        const container = new ContainerBuilder().addTextDisplayComponents(rolesDisplay);

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    @ButtonComponent({ id: 'serverinfo_emojis' })
    async emojisButton(interaction: ButtonInteraction): Promise<void> {
        const emojis = interaction.guild!.emojis.cache;
        const emojiMap = emojis.map((emoji) => emoji.toString());

        if (!emojiMap || emojiMap.length === 0) {
            await interaction.reply({
                content: 'Unable to locate any emojis.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        emojiMap.sort((a, b) => a.localeCompare(b));

        let emojiList = emojiMap.join(', ');

        if (emojiList.length > 4000) {
            emojiList = emojiList.slice(0, 4000);
            emojiList = emojiList.slice(0, emojiList.lastIndexOf('<'));
        }

        const emojisDisplay = new TextDisplayBuilder().setContent(
            [
                `# 😀 Server Emojis [${emojiMap.length.toLocaleString()}]`,
                '',
                emojiMap.length <= 25
                    ? `> ${emojiList}`
                    : `> ${emojiList}... and ${emojiMap.length - 25} more`,
            ].join('\n')
        );

        const container = new ContainerBuilder().addTextDisplayComponents(emojisDisplay);

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
