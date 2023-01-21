/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import AutoRoleSchema from '../../Mongo/Schemas/AutoRole.js';

export default (client) => {
  const AutoRole = {
    categoryId: 'AutoRole',
    categoryName: 'Auto Role',
    categoryDescription: 'Set the role members will be given once they join your server.',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    refreshOnSave: true,
    getActualSet: async ({ guild }) => {
      const result = await AutoRoleSchema.findOne({ guildId: guild.id });
      const set = result ? result.role : null;
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
      const result = await AutoRoleSchema.findOne({ guildId: guild.id });

      if (data.some((option) => option.optionId === 'autoRoleToggle' && option.data === false)) {
        await AutoRoleSchema.deleteOne({ guildId: guild.id });
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
            guildId: guild.id,
            role: autoRoleObject.data
          }).save();
        } else {
          await AutoRoleSchema.findOneAndUpdate(
            {
              guildId: guild.id
            },
            {
              role: autoRoleObject.data
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
        optionType: DBD.formTypes.rolesSelect()
      },
      {
        optionId: 'autoRoleToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the AutoRole.',
        optionType: DBD.formTypes.switch()
      }
    ]
  };

  return AutoRole;
};
