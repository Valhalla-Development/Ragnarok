import { Category } from '@discordx/utilities';
import {
    ApplicationCommandOptionType,
    type CommandInteraction,
    EmbedBuilder,
    type GuildMember,
} from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { color } from '../../utils/Util.js';

@Discord()
@Category('Miscellaneous')
export class Userinfo {
    /**
     * Displays information for the author of the interaction or a specified user.
     * @param interaction - The command interaction.
     * @param user - Optional user to lookup.
     */
    @Slash({
        description: 'Displays information for the author of the interaction or a specified user.',
    })
    async userinfo(
        @SlashOption({
            description: 'User to look up (optional)',
            name: 'user',
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember,
        interaction: CommandInteraction
    ): Promise<void> {
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

        const member = user || interaction.member;

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

        const embed = new EmbedBuilder()
            .setColor(color(interaction.guild!.members.me!.displayHexColor))
            .setThumbnail(member.user.displayAvatarURL() || '')
            .setAuthor({
                name: `Information for ${member.user.displayName}`,
                iconURL: member.user.displayAvatarURL() || '',
            })
            .addFields({
                name: 'User Information',
                value: `**◎ 👑 User:** ${member.user}
                **◎ 🆔 ID:** \`${member.user.id}\`
                **◎ 📆 Created At** <t:${Math.round(member.user.createdTimestamp / 1000)}> - (<t:${Math.round(member.user.createdTimestamp / 1000)}:R>)
                **◎ 📆 Joined At** <t:${Math.round(member.joinedTimestamp! / 1000)}> - (<t:${Math.round(member.joinedTimestamp! / 1000)}:R>)
                **◎ 🗺️ Flags:** ${userFlags?.length ? userFlags.join(', ') : 'None'}
                **◎ <a:Booster:855593231294267412> Server Booster:** ${
                    member.premiumSinceTimestamp
                        ? `<t:${Math.round(member.premiumSinceTimestamp / 1000)}> - (<t:${Math.round(member.premiumSinceTimestamp / 1000)}:R>)`
                        : 'No'
                }
                
                **Roles: [${roles.length}]**\n${roleMsg}`,
            });

        await interaction.reply({ embeds: [embed] });
    }
}
