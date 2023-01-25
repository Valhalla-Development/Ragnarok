/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import { PermissionsBitField } from 'discord.js';
import AutoRoleSchema from '../../Mongo/Schemas/AutoRole.js';

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

  const AutoRole = {
    categoryId: 'AutoRole',
    categoryName: 'Auto Role',
    categoryDescription: 'Set the role members will be given once they join your server.',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    refreshOnSave: true,
    getActualSet: async ({ guild }) => {
      const result = await AutoRoleSchema.findOne({ GuildId: guild.id });
      const set = result ? result.Role : null;
      const status = !!result;

      return [
        {
          optionId: 'autoRole',
          data: set
        },
        {
          optionId: 'autoRoleToggle',
          data: status
        }
      ];
    },
    setNew: async ({ guild, user, data }) => {
      const result = await AutoRoleSchema.findOne({ GuildId: guild.id });

      if (data.some((option) => option.optionId === 'autoRoleToggle' && option.data === false)) {
        await AutoRoleSchema.deleteOne({ GuildId: guild.id });
        return;
      }

      if (
        data.some((option) => option.optionId === 'autoRoleToggle' && option.data === true) &&
        !data.some((option) => option.optionId === 'autoRole')
      ) {
        return { error: 'Please set a role!' };
      }

      const autoRoleObject = data.find((obj) => obj.optionId === 'autoRole');
      if (autoRoleObject?.data) {
        if (!result) {
          await new AutoRoleSchema({
            GuildId: guild.id,
            Role: autoRoleObject.data
          }).save();
        } else {
          await AutoRoleSchema.findOneAndUpdate(
            {
              GuildId: guild.id
            },
            {
              Role: autoRoleObject.data
            }
          );
        }
      }
    },
    categoryOptionsList: [
      {
        optionId: 'autoRole',
        optionName: 'Role',
        optionDescription: 'Select the role to set.',
        optionType: DBD.formTypes.rolesSelect(),
        allowedCheck
      },
      {
        optionId: 'autoRoleToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the AutoRole.',
        optionType: DBD.formTypes.switch(),
        allowedCheck1
      }
    ]
  };

  return AutoRole;
};
