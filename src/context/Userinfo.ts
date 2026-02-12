import {
    ApplicationCommandType,
    AttachmentBuilder,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    ContainerBuilder,
    type GuildMember,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    type UserContextMenuCommandInteraction,
} from 'discord.js';
import { ButtonComponent, ContextMenu, Discord } from 'discordx';

@Discord()
export class UserinfoContext {
    /**
     * Displays information for target user
     * @param interaction - The command interaction
     */
    @ContextMenu({
        name: 'Userinfo',
        type: ApplicationCommandType.User,
    })
    async userinfoContext(interaction: UserContextMenuCommandInteraction): Promise<void> {
        const member = interaction.targetMember as GuildMember;
        await member.fetch();
        await member.user.fetch();

        const flags: { [key: string]: string } = {
            ActiveDeveloper: '<:ActiveDeveloper:1094985831112003604>',
            BotHTTPInteractions: '<:Bot:854724408458870814>',
            CertifiedModerator: '<:CertifiedModerator:854722328382406676>',
            HypeSquadOnlineHouse3: '<:HypeSquadBalance:748651259631894579>',
            PremiumEarlySupporter: '<:DiscordNitroEarlySupporter:748651259816312992>',
            Staff: '<:DiscordStaff:748651259849998377>',
            VerifiedDeveloper: '<:VerifiedBotDeveloper:748651259858255973>',
            BugHunterLevel1: '<:DiscordBugHunter1:748651259724300364>',
            HypeSquadOnlineHouse1: '<:HypeSquadBravery:748651259845673020>',
            Hypesquad: '<:HypeSquadEvents:748651259761786981>',
            Quarantined: '<:Quarantined:1021867285582983208>',
            TeamPseudoUser: 'Team User',
            BugHunterLevel2: '<:DiscordBugHunter2:748651259741077574>',
            HypeSquadOnlineHouse2: '<:HypeSquadBrilliance:748651259933753464>',
            Partner: '<:DiscordPartner:748985364022165694>',
            VerifiedBot: '<:VerifiedBot:854725852101476382>',
            Spammer: '<:Spammer:1021857158280794172>',
            Bot: '<:Bot:854724408458870814>',
        };

        const roles = member.roles.cache
            .sort((a, b) => b.position - a.position)
            .map((role) => role.toString())
            .slice(0, -1);

        const userFlags = member.user.flags
            ?.toArray()
            .map((flag) => flags[flag])
            .filter(Boolean);

        if (member.user.bot && !userFlags?.includes('VerifiedBot')) {
            (userFlags as Array<keyof typeof flags>).push('Bot');
        }

        const roleMsg = roles.length ? roles.join(', ') : 'None';

        const boosterInfo = member.premiumSinceTimestamp
            ? `<t:${Math.round(member.premiumSinceTimestamp / 1000)}> - (<t:${Math.round(
                  member.premiumSinceTimestamp / 1000
              )}:R>)`
            : 'No';

        const header = new TextDisplayBuilder().setContent(
            [
                `# 🧾 Information for ${member.user.displayName}`,
                `> 👑 User: ${member}`,
                `> 🆔 ID: \`${member.user.id}\``,
            ].join('\n')
        );

        const timeline = new TextDisplayBuilder().setContent(
            [
                '## 🗓️ Timeline',
                '',
                `> 🕰️ Created: <t:${Math.round(member.user.createdTimestamp / 1000)}:F> (<t:${Math.round(
                    member.user.createdTimestamp / 1000
                )}:R>)`,
                `> 🏠 Joined: <t:${Math.round(member.joinedTimestamp! / 1000)}:F> (<t:${Math.round(
                    member.joinedTimestamp! / 1000
                )}:R>)`,
            ].join('\n')
        );

        const flagsDisplay = new TextDisplayBuilder().setContent(
            [
                '## 🏷️ Flags & Booster',
                '',
                `> 🗺️ Flags: ${userFlags?.length ? userFlags.join(', ') : 'None'}`,
                `> <a:Booster:855593231294267412> Server Booster: ${boosterInfo}`,
            ].join('\n')
        );

        const rolesDisplay = new TextDisplayBuilder().setContent(
            [`## 🎭 Roles [${roles.length}]`, '', roles.length ? `> ${roleMsg}` : '> None'].join(
                '\n'
            )
        );

        const avatarUrl = member.user.displayAvatarURL();
        const bannerUrl = member.user.bannerURL();

        const avatarButton = new ButtonBuilder()
            .setLabel('Avatar')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`userinfo_avatar_${member.user.id}`);

        const bannerButton = new ButtonBuilder()
            .setLabel('Banner')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`userinfo_banner_${member.user.id}`);

        const buttons: ButtonBuilder[] = [];
        if (avatarUrl) {
            buttons.push(avatarButton);
        }
        if (bannerUrl) {
            buttons.push(bannerButton);
        }

        const container = new ContainerBuilder()
            .addTextDisplayComponents(header)
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(timeline)
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(flagsDisplay)
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(rolesDisplay);

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

    @ButtonComponent({ id: /^userinfo_avatar_/ })
    async avatarButton(interaction: ButtonInteraction): Promise<void> {
        const userId = interaction.customId.split('_')[2]!.toString();
        const member = interaction.guild?.members.cache.get(userId);

        if (!member) {
            await interaction.reply({ content: 'Avatar not found.', ephemeral: true });
            return;
        }

        const avatarUrl = member.user.displayAvatarURL({ size: 1024 });

        const attachment = new AttachmentBuilder(avatarUrl);

        await interaction.reply({
            files: [attachment],
        });
    }

    @ButtonComponent({ id: /^userinfo_banner_/ })
    async bannerButton(interaction: ButtonInteraction): Promise<void> {
        const userId = interaction.customId.split('_')[2]!.toString();
        const member = await interaction.client.users.fetch(userId, { force: true });

        if (!member) {
            await interaction.reply({ content: 'Banner not found.', ephemeral: true });
            return;
        }

        const bannerUrl = member.bannerURL({ size: 1024 });

        const attachment = new AttachmentBuilder(bannerUrl!);

        await interaction.reply({
            files: [attachment],
        });
    }
}
