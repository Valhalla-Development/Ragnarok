import { EmbedBuilder, ChannelType, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

const verificationLevels = {
  0: 'None',
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Very High'
};

const mfa = {
  0: 'None',
  1: 'Elevated'
};

const data = new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('Displays stats on the guild.')
  .addStringOption((option) =>
    option
      .setName('options')
      .setDescription('Optional sub-commands')
      .setRequired(false)
      .addChoices({ name: 'roles', value: 'serverInfoRoles' }, { name: 'emojis', value: 'serverInfoEmojis' })
  );

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Displays stats on the guild.',
      category: 'Informative',
      options: data
    });
  }

  async run(interaction) {
    const roles = interaction.guild.roles.cache
      .sort((a, b) => b.position - a.position)
      .map((role) => role.toString())
      .slice(0, -1);

    const emojis = interaction.guild.emojis.cache;

    const emojiMap = emojis.sort((a, b) => b.position - a.position).map((emoji) => emoji.toString());

    if (interaction.options.getString('sub-commands') === 'serverInfoRoles') {
      const roleArr = [];

      const join = roles.join(', ');
      if (join.length > 4000) {
        const trim = join.substring(0, 4000);
        const lastOf = trim.substring(0, trim.lastIndexOf('<'));
        roleArr.push(lastOf);
      }

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .setAuthor({ name: `Viewing information for ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ extension: 'png' }) })
        .setDescription(
          `**Server Roles [${roles.length}]**\n${
            !roleArr.length ? roles.join(', ') : `${roleArr.join(', ')}... ${roles.length - roleArr[0].split(', ').length + 1} more!`
          }`
        )
        .setFooter({ text: `${this.client.user.username}`, iconURL: this.client.user.displayAvatarURL({ extension: 'png' }) });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    if (interaction.options.getString('options') === 'serverInfoEmojis') {
      const emojiArr = [];

      const join = emojiMap.join(', ');
      if (join.length > 4000) {
        const trim = join.substring(0, 4000);
        const lastOf = trim.substring(0, trim.lastIndexOf('<'));
        emojiArr.push(lastOf);
      }

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .setAuthor({ name: `Viewing information for ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ extension: 'png' }) })
        .setDescription(
          `**Server Emojis [${emojiMap.length}]**\n${
            !emojiArr.length ? emojiMap.join(', ') : `${emojiArr.join(', ')}... ${emojiMap.length - emojiArr[0].split(', ').length + 1} more!`
          }`
        )
        .setFooter({ text: `${this.client.user.username}`, iconURL: this.client.user.displayAvatarURL({ extension: 'png' }) });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    const guildOwner = await interaction.guild.fetchOwner();
    const channels = interaction.guild.channels.cache;

    const textChan = channels.filter((channel) => channel.type === ChannelType.GuildText);
    const voiceChan = channels.filter((channel) => channel.type === ChannelType.GuildVoice);

    const embed = new EmbedBuilder()
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .setThumbnail(interaction.guild.iconURL({ extension: 'png' }))
      .setAuthor({ name: `Viewing information for ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ extension: 'png' }) })
      .addFields({
        name: 'Guild information',
        value: `**◎ 👑 Owner:** ${guildOwner.user}
				**◎ 🆔 ID:** \`${interaction.guild.id}\`
				**◎ 📅 Created At:** <t:${Math.round(interaction.guild.createdTimestamp / 1000)}> - (<t:${Math.round(interaction.guild.createdTimestamp / 1000)}:R>)
				**◎ 🔐 Verification Level:** \`${verificationLevels[interaction.guild.verificationLevel]}\`
				**◎ 🔏 MFA Level:** \`${mfa[interaction.guild.mfaLevel]}\`
				**◎ 🧑‍🤝‍🧑 Guild Members:** \`${interaction.guild.memberCount - interaction.guild.members.cache.filter((m) => m.user.bot).size.toLocaleString('en')}\`
				**◎ 🤖 Guild Bots:** \`${interaction.guild.members.cache.filter((m) => m.user.bot).size.toLocaleString('en')}\`
				\u200b`
      })
      .addFields(
        {
          name: `**Guild Channels** [${textChan.size + voiceChan.size}]`,
          value: `<:TextChannel:855591004236546058> | Text: \`${textChan.size}\`\n<:VoiceChannel:855591004300115998> | Voice: \`${voiceChan.size}\``,
          inline: true
        },
        {
          name: '**Guild Perks**',
          value: `<a:Booster:855593231294267412> | Boost Tier: \`${interaction.guild.premiumTier}\`\n<a:Booster:855593231294267412> | Boosts: \`${interaction.guild.premiumSubscriptionCount}\``,
          inline: true
        },
        {
          name: '**Assets**',
          value: `**Server Roles [${roles.length}]**: To view all roles, run\n\`/serverinfo roles\`\n**Server Emojis [${emojis.size}]**: To view all emojis, run\n\`/serverinfo emojis\``,
          inline: false
        }
      )
      .setFooter({ text: `${this.client.user.username}`, iconURL: this.client.user.displayAvatarURL({ extension: 'png' }) });
    interaction.reply({ embeds: [embed] });
  }
};

export default SlashCommandF;
