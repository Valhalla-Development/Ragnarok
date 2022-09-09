import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import SQLite from 'better-sqlite3';
import SlashCommand from '../../Structures/SlashCommand.js';

const db = new SQLite('./Storage/DB/db.sqlite');

const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Bans user from the guild')
  .addUserOption((option) => option.setName('user').setDescription('User to ban').setRequired(true))
  .addStringOption((option) =>
    option.setName('delete_messages').setDescription('How many messages to delete from the user').setRequired(true).setAutocomplete(true)
  )
  .addStringOption((option) => option.setName('reason').setDescription('Reason for ban').setMinLength(4).setMaxLength(40));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Bans user from the guild',
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

    const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${interaction.guild.id};`).get();

    const deleteMessageFetch = interaction.options.getString('delete_messages');
    const user = interaction.options.getMember('user');
    const reasonArgs = interaction.options.getString('reason') || 'No reason provided.';

    const deleteMessage = deleteTime[deleteMessageFetch];

    // If user id = message id
    if (user.user.id === interaction.user.id) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Ban**`, value: '**◎ Error:** You cannot Ban yourself!' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    // Check if user has a role that is higher than the message author
    if (user.roles.highest.position >= interaction.member.roles.highest.position) {
      const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Ban**`,
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
        .addFields({ name: `**${this.client.user.username} - Ban**`, value: `**◎ Error:** You cannot ban <@${user.id}>` });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    // Check if user is the bot
    if (user.user.id === this.client.user.id) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Kick**`, value: '**◎ Error:** You cannot ban me. :slight_frown:' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    const authoMes = new EmbedBuilder()
      .setThumbnail(this.client.user.displayAvatarURL())
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: `You have been banned from: \`${interaction.guild.name}\``,
        value: `**◎ Reason:** ${reasonArgs}
				**◎ Moderator:** ${interaction.user.tag}`
      })
      .setFooter({ text: 'You have been banned' })
      .setTimestamp();
    try {
      user.send({ embeds: [authoMes] });
    } catch {
      // Do nothing
    }

    // Ban the user and send the embed
    interaction.guild.members.ban(user, { deleteMessageSeconds: deleteMessage, reason: `${reasonArgs}` }).catch(() => {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Ban**`, value: '**◎ Error:** An error occured!' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
    });

    const embed = new EmbedBuilder()
      .setThumbnail(this.client.user.displayAvatarURL())
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: 'User Banned',
        value: `**◎ User:** ${user.user.tag}
				**◎ Reason:** ${reasonArgs}
				**◎ Moderator:** ${interaction.user.tag}`
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
              .addFields({ name: `**${this.client.user.username} - Un-Ban**`, value: '**◎ Error:** An error occured, is the user banned?' });
            interaction.followUp({ ephemeral: true, embeds: [embed1] });
            return;
          }
          const bUser = bans.find((ba) => ba.user.id === user.user.id);
          if (!bUser) {
            const embed2 = new EmbedBuilder()
              .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Un-Ban**`, value: '**◎ Error:** The user specified is not banned!' });
            interaction.followUp({ ephemeral: true, embeds: [embed2] });
            return;
          }

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
      const logch = id.channel;
      const logsch = this.client.channels.cache.get(logch);

      if (!logsch) return;

      logsch.send({ embeds: [embed] });
    }
  }
};

export default SlashCommandF;
