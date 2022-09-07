/* eslint-disable no-restricted-syntax */
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import SQLite from 'better-sqlite3';
import SlashCommand from '../../Structures/SlashCommand.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Posts the role menu with pre-defiend roles.',
      category: 'Moderation'
    });
  }

  async run(interaction) {
    const foundRoleMenu = db.prepare(`SELECT * FROM rolemenu WHERE guildid=${interaction.guild.id}`).get();

    if (!foundRoleMenu || !foundRoleMenu.roleList || JSON.parse(foundRoleMenu.roleList).length <= 0) {
      const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - RoleMenu**`,
        value: '**◎ Error:** The roles for the menu have not been set yet. Please try again later.'
      });
      interaction.reply({ ephemeral: true, embeds: [embed] });

      db.prepare(`DELETE FROM rolemenu WHERE guildid=${interaction.guild.id}`).run();
    } else {
      let activeMenu;
      if (!foundRoleMenu.activeRoleMenuID) {
        activeMenu = {};
      } else {
        activeMenu = JSON.parse(foundRoleMenu.activeRoleMenuID);
      }

      const roleArray = JSON.parse(foundRoleMenu.roleList);

      // Check if roles in the array exist in the server, if it does not, remove it from the array
      const roleArrayCleaned = roleArray.filter((role) => {
        if (interaction.guild.roles.cache.has(role)) {
          return true;
        }
        return false;
      });

      // If there is no length to roleArrayCleaned, delete from database and send a message
      if (roleArrayCleaned.length <= 0) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - RoleMenu**`,
          value: '**◎ Error:** The roles for the menu have been removed from the server. Please try again later.'
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        db.prepare(`DELETE FROM rolemenu WHERE guildid=${interaction.guild.id}`).run();
        return;
      }

      const row = new ActionRowBuilder();

      for (const buttonObject of roleArrayCleaned) {
        const role = interaction.guild.roles.cache.get(buttonObject);

        row.addComponents(new ButtonBuilder().setCustomId(`rm-${role.id}`).setLabel(`${role.name}`).setStyle(ButtonStyle.Success));
      }

      const roleMenuEmbed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .setTitle('Assign a Role')
        .setDescription('Select the role you wish to assign to yourself.');
      interaction.channel.send({ embeds: [roleMenuEmbed], components: [row] }).then(async (reactEmbed) => {
        activeMenu.channel = interaction.channel.id;
        activeMenu.message = reactEmbed.id;

        db.prepare('UPDATE rolemenu SET activeRoleMenuID = (@activeRoleMenuID), roleList = (@roleList) WHERE guildid = (@guildid);').run({
          activeRoleMenuID: JSON.stringify(activeMenu),
          roleList: JSON.stringify(roleArrayCleaned),
          guildid: `${interaction.guild.id}`
        });
      });
    }
  }
};

export default SlashCommandF;
