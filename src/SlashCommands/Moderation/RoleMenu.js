/* eslint-disable no-restricted-syntax */
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';
import RoleMenu from '../../Mongo/Schemas/RoleMenu.js';

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Posts the role menu with pre-defiend roles.',
      category: 'Moderation',
      userPerms: ['ManageGuild']
    });
  }

  async run(interaction) {
    const foundRoleMenu = await RoleMenu.findOne({ GuildId: interaction.guild.id });

    if (!foundRoleMenu || !foundRoleMenu.RoleList || JSON.parse(foundRoleMenu.RoleList).length <= 0) {
      const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - RoleMenu**`,
        value: '**◎ Error:** The roles for the menu have not been set yet. Please try again later.'
      });
      interaction.reply({ ephemeral: true, embeds: [embed] });

      await RoleMenu.deleteOne({ GuildId: interaction.guild.id });
    } else {
      let activeMenu;
      if (!foundRoleMenu.RoleMenuId) {
        activeMenu = {};
      } else {
        activeMenu = JSON.parse(foundRoleMenu.RoleMenuId);
      }

      const roleArray = JSON.parse(foundRoleMenu.RoleList);

      // Check if roles in the array exist in the server, if it does not, remove it from the array
      const roleArrayCleaned = roleArray.filter((role) => !!interaction.guild.roles.cache.has(role));

      // If there is no length to roleArrayCleaned, delete from database and send a message
      if (roleArrayCleaned.length <= 0) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - RoleMenu**`,
          value: '**◎ Error:** The roles for the menu have been removed from the server. Please try again later.'
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });

        await RoleMenu.deleteOne({ GuildId: interaction.guild.id });
        return;
      }

      const buttonsArr = [];
      const rows = [];

      for (const buttonObject of roleArrayCleaned) {
        const role = interaction.guild.roles.cache.get(buttonObject);
        buttonsArr.push(new ButtonBuilder().setCustomId(`rm-${role.id}`).setLabel(`${role.name}`).setStyle(ButtonStyle.Success));
      }

      for (const rowObject of chunkArrayInGroups(buttonsArr, 5)) {
        rows.push(new ActionRowBuilder().addComponents(...rowObject));
      }

      await interaction.deferReply();
      interaction.deleteReply();

      const roleMenuEmbed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .setTitle('Assign a Role')
        .setDescription('Select the role you wish to assign to yourself.');
      interaction.channel.send({ embeds: [roleMenuEmbed], components: [...rows] }).then(async (reactEmbed) => {
        activeMenu.channel = interaction.channel.id;
        activeMenu.message = reactEmbed.id;

        await RoleMenu.findOneAndUpdate(
          {
            GuildId: interaction.guild.id
          },
          {
            RoleMenuId: JSON.stringify(activeMenu),
            RoleList: JSON.stringify(roleArrayCleaned)
          }
        );
      });
    }

    function chunkArrayInGroups(arr, size) {
      const result = [];
      let pos = 0;
      while (pos < arr.length) {
        result.push(arr.slice(pos, pos + size));
        pos += size;
      }
      return result;
    }
  }
};

export default SlashCommandF;
