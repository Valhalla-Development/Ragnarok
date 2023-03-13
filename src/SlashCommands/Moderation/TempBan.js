import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import ms from 'ms';
import SlashCommand from '../../Structures/SlashCommand.js';
import Logging from '../../Mongo/Schemas/Logging.js';
import TempBan from '../../Mongo/Schemas/TempBan.js';

const data = new SlashCommandBuilder()
  .setName('tempban')
  .setDescription('Temporarily bans user from the guild')
  .addUserOption((option) => option.setName('user').setDescription('User to ban').setRequired(true))
  .addStringOption((option) => option.setName('duration').setDescription('Duration of ban').setRequired(true))
  .addStringOption((option) =>
    option.setName('delete_messages').setDescription('How many messages to delete from the user').setRequired(true).setAutocomplete(true)
  )
  .addStringOption((option) => option.setName('reason').setDescription('Reason for ban').setMinLength(4).setMaxLength(40));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Temporarily bans user from the guild',
      category: 'Moderation',
      options: data,
      userPerms: ['BanMembers'],
      botPerms: ['BanMembers']
    });
  }

  async autoComplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = [
      'Don\'t Delete Any',
      'Previous Hour',
      'Previous 6 Hours',
      'Previous 12 Hours',
      'Previous 24 Hours',
      'Previous 3 Days',
      'Previous 7 Days'
    ];
    const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
    await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
  }

  async run(interaction) {
    const deleteTime = {
      'Don\'t Delete Any': 0,
      'Previous Hour': 3600,
      'Previous 6 Hours': 21600,
      'Previous 12 Hours': 43200,
      'Previous 24 Hours': 86400,
      'Previous 3 Days': 259200,
      'Previous 7 Days': 604800
    };

    const id = await Logging.findOne({ GuildId: interaction.guild.id });

    const deleteMessageFetch = interaction.options.getString('delete_messages');
    const user = interaction.options.getMember('user');
    const reasonArgs = interaction.options.getString('reason') || 'No reason provided.';
    const duration = interaction.options.getString('duration');

    const deleteMessage = deleteTime[deleteMessageFetch];

    // If user id = message id
    if (user.user.id === interaction.user.id) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Temp Ban**`, value: '**◎ Error:** You cannot Ban yourself!' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    // Check if user has a role that is higher than the message author
    if (user.roles.highest.position >= interaction.member.roles.highest.position) {
      const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Temp Ban**`,
        value: '**◎ Error:** You cannot ban someone with a higher role than yourself!'
      });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    // Check if user is bannable
    if (
      user.permissions.has(PermissionsBitField.Flags.ManageGuild) ||
      user.permissions.has(PermissionsBitField.Flags.Administrator) ||
      !user.bannable
    ) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Temp Ban**`, value: `**◎ Error:** You cannot ban <@${user.id}>` });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    // Check if user is the bot
    if (user.user.id === this.client.user.id) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Temp Ban**`, value: '**◎ Error:** You cannot ban me. :slight_frown:' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    // Ensure bantime is a valid option
    if (!duration.match('[dhms]')) {
      const incorrectFormat = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Temp Ban**`,
        value: '**◎ Error:** You did not use the correct formatting for the time! The valid options are `d`, `h`, `m` or `s`'
      });
      interaction.reply({ ephemeral: true, embeds: [incorrectFormat] });
      return;
    }

    // Checks if bantime is a number
    if (Number.isNaN(ms(duration))) {
      const invalidDur = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Temp Ban**`, value: '**◎ Error:** Please input a valid duration!' });
      interaction.reply({ ephemeral: true, embeds: [invalidDur] });
      return;
    }

    // Check if bantime is higher than 30 seconds
    if (ms(duration) < '30000') {
      const valueLow = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Temp Ban**`, value: '**◎ Error:** Please input a value higher than 30 seconds!' });
      interaction.reply({ ephemeral: true, embeds: [valueLow] });
      return;
    }

    // Ban the user and send the embed
    interaction.guild.members.ban(user, { deleteMessageSeconds: deleteMessage, reason: `${reasonArgs}` }).catch(() => {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Temp Ban**`, value: '**◎ Error:** An error occured!' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
    });

    const nowInMs = Date.now() + ms(duration);
    const epoch = Math.round(nowInMs / 1000);

    try {
      const authoMes = new EmbedBuilder()
        .setThumbnail(this.client.user.displayAvatarURL())
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `You have been temporarily banned from: \`${interaction.guild.name}\``,
          value: `**◎ Reason:** ${reasonArgs}
				**◎ Moderator:** ${interaction.user.tag}
        **◎ Expires:** <t:${epoch}:F>`
        })
        .setFooter({ text: 'You have been banned' })
        .setTimestamp();

      await user.send({ embeds: [authoMes] });
    } catch {
      // Do nothing
    }

    const endTime = new Date().getTime() + ms(duration);

    await new TempBan({
      IdJoined: `${user.user.id}-${interaction.guild.id}`,
      GuildId: interaction.guild.id,
      UserId: user.user.id,
      EndTime: endTime,
      ChannelId: interaction.channel.id,
      Username: user.user.tag
    }).save();

    const embed = new EmbedBuilder()
      .setThumbnail(this.client.user.displayAvatarURL())
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: 'User Temporarily Banned',
        value: `**◎ User:** ${user.user.tag}
				**◎ Reason:** ${reasonArgs}
				**◎ Moderator:** ${interaction.user.tag}
        **◎ Expires:** <t:${epoch}:F>`
      })
      .setFooter({ text: 'User Ban Logs' })
      .setTimestamp();

    const buttonA = new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('Unban').setCustomId('unban');

    const row = new ActionRowBuilder().addComponents(buttonA);

    const m = await interaction.reply({ components: [row], embeds: [embed] });
    const filter = (but) => but.user.id === interaction.user.id;

    const collector = m.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async (b) => {
      if (b.customId === 'unban') {
        interaction.guild.bans.fetch().then(async (bans) => {
          if (bans.size === 0) {
            const embed1 = new EmbedBuilder()
              .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Un-Temp Ban**`, value: '**◎ Error:** An error occured, is the user banned?' });
            await interaction.followUp({ ephemeral: true, embeds: [embed1] });
            return;
          }
          const bUser = bans.find((ba) => ba.user.id === user.user.id);
          if (!bUser) {
            const embed2 = new EmbedBuilder()
              .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Un-Temp Ban**`, value: '**◎ Error:** The user specified is not banned!' });
            await interaction.followUp({ ephemeral: true, embeds: [embed2] });
            return;
          }

          await TempBan.deleteOne({ IdJoined: `${user.user.userid}-${interaction.guild.id}` }); // TODO log user.user.userid just to be sure

          const unbanEmbed = new EmbedBuilder()
            .setThumbnail(this.client.user.displayAvatarURL())
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: 'Action | Un-Ban',
              value: `**◎ User ID:** ${user.user.id}
				**◎ Moderator:** ${interaction.user.tag}`
            })
            .setFooter({ text: 'User Un-Ban Logs' })
            .setTimestamp();
          interaction.guild.members.unban(bUser.user).then(() => interaction.channel.send({ embeds: [unbanEmbed] }));
          collector.stop('unbanned');
        });
      }
    });
    collector.on('end', () => {
      interaction.deleteReply();
    });

    if (id) {
      const logch = id.ChannelId;
      const logsch = this.client.channels.cache.get(logch);

      if (!logsch) return;

      logsch.send({ embeds: [embed] });
    }
  }
};

export default SlashCommandF;
