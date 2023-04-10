/* eslint-disable no-nested-ternary */
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

const flags = {
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
  ActiveDeveloper: '<:ActiveDeveloper:1094985831112003604>'
};

/* const status = {
  online: '<:Online:748655722740580403> Online',
  idle: '<:Idle:748655722639917117> Idle',
  dnd: '<:DND:748655722979393657> DnD',
  offline: '<:Offline:748655722677403850> Offline'
};

const types = {
  5: 'Competing',
  4: 'Custom',
  2: 'Listening',
  0: 'Playing',
  1: 'Streaming',
  3: 'Watching'
}; */

const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Displays information on user.')
  .addUserOption((option) => option.setName('user').setDescription('Select a user').setRequired(true));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Displays information on user.',
      category: 'Informative',
      options: data
    });
  }

  async run(interaction) {
    const member = interaction.options.getMember('user');

    const roles = member.roles.cache
      .sort((a, b) => b.position - a.position)
      .map((role) => role.toString())
      .slice(0, -1);
    const userFlags = member.user.flags.toArray();
    const flagNames = userFlags.filter((flag) => flags[flag]).map((flag) => flags[flag]);

    if (member.user.bot && !userFlags.includes('VerifiedBot')) userFlags.push('Bot');

    let roleMsg;
    if (roles) {
      if (!roles.length) {
        roleMsg = 'None';
      } else {
        roleMsg = roles.length ? roles.join(', ') : 'None';
      }
    }

    const embed = new EmbedBuilder()
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .setThumbnail(member.user.displayAvatarURL())
      .setAuthor({ name: `Viewing information for ${member.user.username}`, iconURL: member.user.displayAvatarURL() })
      .addFields({
        name: 'Member information',
        value: `**◎ 👑 User:** ${member.user}
				**◎ 🆔 ID:** ${member.user.id}
				**◎ 📆 Created At** <t:${Math.round(member.user.createdTimestamp / 1000)}> - (<t:${Math.round(member.user.createdTimestamp / 1000)}:R>)
				**◎ 📆 Joined At** <t:${Math.round(member.joinedTimestamp / 1000)}> - (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)
				**◎ 🗺️ Flags:** ${flagNames.length ? flagNames.join(', ') : 'None'}
				**◎ <a:Booster:855593231294267412> Server Booster:** ${
          member.premiumSinceTimestamp
            ? `<t:${Math.round(member.premiumSinceTimestamp / 1000)}> - (<t:${Math.round(member.premiumSinceTimestamp / 1000)}:R>)`
            : 'No'
        }

        **Roles: [${roles.length}]**\n${roleMsg}`
      });

    interaction.reply({ embeds: [embed] });
  }
};

export default SlashCommandF;
