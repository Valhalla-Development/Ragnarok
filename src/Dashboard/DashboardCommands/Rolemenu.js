/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import { PermissionsBitField } from 'discord.js';
import RoleMenuSchema from '../../Mongo/Schemas/RoleMenu.js';

export default (client) => {
  const allowedCheck = async ({ guild, user }) => {
    // Fetch guild
    const fetchGuild = client.guilds.cache.get(guild.id);
    // Fetch user
    const fetchUser = fetchGuild.members.cache.get(user.id);
    // Check if user has perm 'ManageMessages'
    if (!fetchUser.permissions.has(PermissionsBitField.Flags.ManageRoles))
      return {
        allowed: false,
        errorMessage: 'You cannot use this option - Manage Roles permission required.'
      };

    return {
      allowed: true,
      errorMessage: null
    };
  };

  const allowedCheck1 = async ({ guild, user }) => {
    // Fetch guild
    const fetchGuild = client.guilds.cache.get(guild.id);
    // Fetch user
    const fetchUser = fetchGuild.members.cache.get(user.id);
    // Check if user has perm 'ManageMessages'
    if (!fetchUser.permissions.has(PermissionsBitField.Flags.ManageGuild))
      return {
        allowed: false,
        errorMessage: 'You cannot use this option - Manage Guild permission required.'
      };

    return {
      allowed: true,
      errorMessage: null
    };
  };

  return {
    categoryId: 'Rolemenu',
    categoryName: 'Rolemenu',
    categoryDescription: 'Set the rolemenu.',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    refreshOnSave: true,
    getActualSet: async ({ guild }) => {
      const result = await RoleMenuSchema.findOne({ GuildId: guild.id });
      const set = result ? result.RoleList : [];
      const status = !!result;

      return [
        {
          optionId: 'rolemenu',
          data: set
        },
        {
          optionId: 'rolemenuToggle',
          data: status
        }
      ];
    },
    setNew: async ({ guild, data }) => {
      const result = await RoleMenuSchema.findOne({ GuildId: guild.id });

      if (data.some((option) => option.optionId === 'rolemenuToggle' && option.data === false)) {
        await RoleMenuSchema.deleteOne({ GuildId: guild.id });
        return;
      }

      if (
          data.some((option) => option.optionId === 'rolemenuToggle' && option.data === true) &&
          !data.some((option) => option.optionId === 'rolemenu')
      ) {
        return { error: 'Please set a role!' };
      }

      const rolemenObject = data.find((obj) => obj.optionId === 'rolemenu');
      if (rolemenObject?.data) {
        if (!result) {
          await new RoleMenuSchema({
            GuildId: guild.id,
            RoleList: JSON.stringify(rolemenObject.data)
          }).save();
        } else {
          await RoleMenuSchema.findOneAndUpdate(
              {
                GuildId: guild.id
              },
              {
                RoleList: JSON.stringify(rolemenObject.data)
              }
          );
        }
      }
    },
    categoryOptionsList: [
      {
        optionId: 'rolemenu',
        optionName: 'Role',
        optionDescription: 'Select the role to set. (Once set, you must run <code>/rolemenu</code> in a channel to create the menu.)',
        optionType: DBD.formTypes.rolesMultiSelect(false, false, false, true),
        allowedCheck
      },
      {
        optionId: 'rolemenuToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the rolemenu.',
        optionType: DBD.formTypes.switch(),
        allowedCheck1
      }
    ]
  };
};
