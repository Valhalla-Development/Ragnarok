import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import ms from 'ms';
import SlashCommand from '../../Structures/SlashCommand.js';
import Logging from '../../Mongo/Schemas/Logging.js';

const data = new SlashCommandBuilder()
  .setName('timeout')
  .setDescription('Timeouts tagged user')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('user')
      .setDescription('User to timeout')
      .addUserOption((option) => option.setName('user').setDescription('User to timeout').setRequired(true))
      .addStringOption((option) => option.setName('time').setDescription('Time to time them out for').setRequired(true))
      .addStringOption((option) => option.setName('reason').setDescription('Reason for timeout'))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('clear')
      .setDescription('Clear timeout from user')
      .addUserOption((option) => option.setName('user').setDescription('User to clear').setRequired(true))
  );

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Timeouts tagged user',
      category: 'Moderation',
      options: data,
      userPerms: ['ModerateMembers'],
      botPerms: ['ModerateMembers']
    });
  }

  async run(interaction) {
    const subCommand = interaction.options.getSubcommand();

    if (subCommand === 'clear') {
      const user = interaction.options.getMember('user');

      if (!user.isCommunicationDisabled()) {
        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Timeout**`, value: `**◎ Error:** ${user} is not timed out` });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      try {
        await user.timeout(null);
      } catch {
        const valueLow = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Timeout**`, value: '**◎ Error:** An unknown error occured.' });
        interaction.reply({ ephemeral: true, embeds: [valueLow] });
        return;
      }

      const embed = new EmbedBuilder()
        .setThumbnail(this.client.user.displayAvatarURL())
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: 'Action | Timeout Clear',
          value: `**◎ User:** ${user.user.tag}
				**◎ Moderator:** ${interaction.user.tag}`
        })
        .setFooter({ text: 'User Timeout Logs' })
        .setTimestamp();

      interaction.reply({ embeds: [embed] });

      const dbid = await Logging.findOne({ GuildId: interaction.guild.id });
      if (dbid && dbid.ChannelId && dbid.ChannelId === interaction.channel.id) return;
      if (!dbid) return;

      const dblogs = dbid.ChannelId;
      const chnCheck = this.client.channels.cache.get(dblogs);

      if (dbid && chnCheck) {
        this.client.channels.cache.get(dblogs).send({ embeds: [embed] });
      }
      return;
    }

    const user = interaction.options.getMember('user');
    const time = interaction.options.getString('time');
    const reason = interaction.options.getString('reason') || 'No reason given.';

    // Check if user is message.author
    if (user.user.id === interaction.user.id) {
      const incorrectFormat = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Timeout**`, value: '**◎ Error:** You can\'t timeout yourself!' });
      interaction.reply({ ephemeral: true, embeds: [incorrectFormat] });
      return;
    }

    if (user.permissions.has(PermissionsBitField.Flags.ManageGuild) || user.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Timeout**`, value: `**◎ Error:** You cannot timeout <@${user.id}>` });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    if (user.isCommunicationDisabled()) {
      const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Timeout**`,
        value: `**◎ Error:** ${user} is already timed out, are you looking for \`/timeout clear\`?`
      });
      interaction.reply({ embeds: [embed] });
      return;
    }

    // Ensure timeoutTime is a valid option
    if (!time.match('[dhms]')) {
      const incorrectFormat = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Timeout**`,
        value: '**◎ Error:** You did not use the correct formatting for the time! The valid options are `d`, `h`, `m` or `s`'
      });
      interaction.reply({ ephemeral: true, embeds: [incorrectFormat] });
      return;
    }

    // Checks if timeoutTime is a number
    if (Number.isNaN(ms(time))) {
      const invalidDur = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Timeout**`, value: '**◎ Error:** Please input a valid duration!' });
      interaction.reply({ ephemeral: true, embeds: [invalidDur] });
      return;
    }

    // Check if timeoutTime is higher than 30 seconds
    if (ms(time) < '30000') {
      const valueLow = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Timeout**`, value: '**◎ Error:** Please input a value higher than 30 seconds!' });
      interaction.reply({ embeds: [valueLow] });
      return;
    }

    // Check if timeoutTime is higher than 28 days
    if (ms(time) > '2419200000') {
      const valueLow = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Timeout**`, value: '**◎ Error:** Please input a value lower than 28 days!' });
      interaction.reply({ ephemeral: true, embeds: [valueLow] });
      return;
    }

    const endTime = new Date().getTime() + ms(time);
    const nowInSecond = Math.round(endTime / 1000);

    try {
      user.timeout(ms(time), reason);
    } catch {
      const valueLow = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Timeout**`, value: '**◎ Error:** An unknown error occured.' });
      interaction.reply({ embeds: [valueLow] });
      return;
    }

    const embed = new EmbedBuilder()
      .setThumbnail(this.client.user.displayAvatarURL())
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: 'Action | Timeout',
        value: `**◎ User:** ${user.user.tag}
				**◎ Reason:** ${reason}
				**◎ Time:** <t:${nowInSecond}>
				**◎ Moderator:** ${interaction.user.tag}`
      })
      .setFooter({ text: 'User Timeout Logs' })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });

    const dbid = await Logging.findOne({ GuildId: interaction.guild.id });
    if (dbid && dbid.ChannelId && dbid.ChannelId === interaction.channel.id) return;

    if (!dbid) return;
    const dblogs = dbid.ChannelId;
    const chnCheck = this.client.channels.cache.get(dblogs);

    if (dbid && chnCheck) {
      this.client.channels.cache.get(dblogs).send({ embeds: [embed] });
    }
  }
};

export default SlashCommandF;
