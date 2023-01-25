/* eslint-disable no-restricted-syntax */
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Event from '../../Structures/Event.js';
import RoleMenu from '../../Mongo/Schemas/RoleMenu.js';
import Logging from '../../Mongo/Schemas/Logging.js';

export const EventF = class extends Event {
  async run(role) {
    async function checkRoleMenu(clientGrab) {
      const foundRoleMenu = await RoleMenu.findOne({ GuildId: role.guild.id });

      if (!foundRoleMenu?.RoleList?.length) return;

      const roleArray = JSON.parse(foundRoleMenu.RoleList);

      if (roleArray.includes(role.id)) {
        roleArray.splice(roleArray.indexOf(role.id), 1);

        await RoleMenu.findOneAndUpdate(
          {
            GuildId: role.guild.id
          },
          {
            RoleList: JSON.stringify(roleArray)
          }
        );

        // Update rolemenu if exists
        if (foundRoleMenu.RoleMenuId) {
          const activeMenu = JSON.parse(foundRoleMenu.RoleMenuId);

          if (activeMenu) {
            const ch = role.guild.channels.cache.get(activeMenu.ChannelId);

            try {
              ch.messages.fetch({ message: activeMenu.message }).then((ms) => {
                const buttonsArr = [];
                const rows = [];

                for (const buttonObject of roleArray) {
                  const currentRoles = role.guild.roles.cache.get(buttonObject);
                  buttonsArr.push(
                    new ButtonBuilder().setCustomId(`rm-${currentRoles.id}`).setLabel(`${currentRoles.name}`).setStyle(ButtonStyle.Success)
                  );
                }

                for (const rowObject of chunkArrayInGroups(buttonsArr, 5)) {
                  rows.push(new ActionRowBuilder().addComponents(...rowObject));
                }

                setTimeout(() => {
                  // I added this timeout because I couldn’t be bothered fixing, please don’t remove or I cry
                  const roleMenuEmbed = new EmbedBuilder()
                    .setColor(clientGrab.utils.color(role.guild.members.me.displayHexColor))
                    .setTitle('Assign a Role')
                    .setDescription('Select the role you wish to assign to yourself.');
                  ms.edit({ embeds: [roleMenuEmbed], components: [...rows] });
                });
              }, 1000);
            } catch {
              const embed = new EmbedBuilder().setColor(clientGrab.utils.color(role.guild.members.me.displayHexColor)).addFields({
                name: `**${clientGrab.user.username} - Config**`,
                value:
                  '**◎ Error:** A role in the role menu was deleted, I was unable to update the active role menu. Please run the following command to refresh it.\n`/rolemenu`'
              });
              ch.send({ embeds: [embed] }).then((m) => clientGrab.utils.deletableCheck(m, 10000));
            }
          }
        }
      }
    }
    checkRoleMenu(this.client);

    const id = await Logging.findOne({ GuildId: role.guild.id });
    if (!id) return;

    const logs = id.ChannelId;
    if (!logs) return;

    const logembed = new EmbedBuilder()
      .setAuthor({ name: `${role.guild.name}`, iconURL: role.guild.iconURL() })
      .setDescription(`**◎ Role Deleted: \`${role.name}\`.**`)
      .setColor(this.client.utils.color(role.guild.members.me.displayHexColor))
      .setTimestamp();
    this.client.channels.cache.get(logs).send({ embeds: [logembed] });

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

export default EventF;
