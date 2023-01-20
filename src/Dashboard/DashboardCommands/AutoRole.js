/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import AutoRoleSchema from '../../Mongo/Schemas/AutoRole.js';

export default (client) => {
  const AutoRole = {
    //! DOESNT WORK
    categoryId: 'AutoRole',
    categoryName: 'Auto Role',
    categoryDescription: 'Set the role members will be given once they join your server.',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    getActualSet: async ({ guild }) => {
      const result = await AutoRoleSchema.findOne({ guildId: guild.id });
      const set = result ? { test: result.role } : { test: null };

      return [
        {
          optionId: 'autoRole',
          data: {
            test: '1234',
            test2: '4321'
          }
        }
      ];
    },
    setNew: async ({ guild, user, data }) => {
      const toggle = data[0].data;

      if (toggle === true) {
        await new AutoRoleSchema({
          guildId: guild.id,
          status: toggle
        }).save();
      } else {
        await AutoRoleSchema.deleteOne({ guildId: guild.id });
      }
    },
    categoryOptionsList: [
      {
        optionId: 'autoRole',
        optionName: 'Toggle',
        optionDescription: 'Toggle the Anti Anti Scam Module.',
        optionType: DBD.formTypes.select({ Polish: 'pl', English: 'en', French: 'fr' }, false)
      }
    ]
  };

  return AutoRole;
};
