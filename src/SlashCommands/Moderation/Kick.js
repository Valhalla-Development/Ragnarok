import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';
import Logging from '../../Mongo/Schemas/Logging.js'; //! TEST ANY OF THESE

const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kicks user from the guild')
  .addUserOption((option) => option.setName('user').setDescription('User to Kick').setRequired(true))
  .addStringOption((option) => option.setName('reason').setDescription('Reason for Kick').setMinLength(4).setMaxLength(40));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Kicks tagged user from the guild.',
      category: 'Moderation',
      options: data,
      userPerms: ['KickMembers'],
      botPerms: ['KickMembers']
    });
  }

  async run(interaction) {
    const id = await Logging.findOne({ guildId: interaction.guild.id });

    const user = interaction.options.getMember('user');

    // If user id = message id
    if (user.user.id === interaction.user.id) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Kick**`, value: '**◎ Error:** You can\'t kick yourself <:wut:745408596233289839>' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    // Check if user has a role that is higher than the message author
    if (user.roles.highest.position >= interaction.member.roles.highest.position) {
      const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Kick**`,
        value: '**◎ Error:** You cannot kick someone with a higher role than yourself!'
      });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    // Check if user is kickable
    if (
      user.permissions.has(PermissionsBitField.Flags.ManageGuild) ||
      user.permissions.has(PermissionsBitField.Flags.Administrator) ||
      !user.kickable
    ) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Kick**`, value: `**◎ Error:** You cannot kick <@${user.id}>` });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    // Check if user is the bot
    if (user.user.id === this.client.user.id) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Kick**`, value: '**◎ Error:** You cannot kick me. :slight_frown:' });
      interaction.reply({ ephemeral: true, mbeds: [embed] });
      return;
    }

    const reason = interaction.options.getString('reason') || 'No reason given.';

    // Kick the user and send the embed
    user.kick({ reason: `${reason}` }).catch(() => {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Kick**`, value: '**◎ Error:** An error occured!' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
    });

    const embed = new EmbedBuilder()
      .setThumbnail(this.client.user.displayAvatarURL())
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: 'User Kicked',
        value: `**◎ User:** ${user.user.tag}
				**◎ Reason:** ${reason}
				**◎ Moderator:** ${interaction.user.tag}`
      })
      .setFooter({ text: 'User Kick Logs' })
      .setTimestamp();
    interaction.reply({ embeds: [embed] });

    if (id) {
      const logch = id.channel;
      const logsch = this.client.channels.cache.get(logch);

      if (!logsch) return;

      logsch.send({ embeds: [embed] });
    }
  }
};

export default SlashCommandF;
