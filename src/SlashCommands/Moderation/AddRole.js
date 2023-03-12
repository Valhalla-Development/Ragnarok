import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('addrole')
  .setDescription('Add a role to a user')
  .addUserOption((option) => option.setName('user').setDescription('User to add a role').setRequired(true))
  .addRoleOption((option) => option.setName('role').setDescription('Role to add').setRequired(true));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Add a role to user',
      category: 'Moderation',
      options: data,
      userPerms: ['ManageRoles', 'ManageGuild'],
      botPerms: ['ManageGuild']
    });
  }

  async run(interaction) {
    const member = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');

    if (role.position >= interaction.member.roles.highest.position) {
      const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Add Role**`,
        value: '**◎ Error:** You cannot give a user a role that is equal or greater than your own!'
      });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    // Check if the user already has the role
    if (member.roles.cache.has(role.id)) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Add Role**`, value: `**◎ Error:** ${member} already has the role: ${role}` });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    try {
      await member.roles.add(role);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Add Role**`, value: `**◎ Success:** I have added the ${role} role to ${member}` });
      interaction.reply({ embeds: [embed] });
    } catch {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Add Role**`, value: '**◎ Error:** An error occured.' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
    }
  }
};

export default SlashCommandF;
