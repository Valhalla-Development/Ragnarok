/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import LevelConfigSchema from '../../Mongo/Schemas/LevelConfig.js';

export default (client) => {
  const AdsProtection = {
    categoryId: 'Level',
    categoryName: 'Level',
    categoryDescription: 'Toggle the Level Module. When disabled, no level up messages will be posted (You can still gain XP).',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    getActualSet: async ({ guild }) => {
      const result = await LevelConfigSchema.findOne({ guildId: guild.id });
      const status = !result;
      return [
        {
          optionId: 'levelToggle',
          data: status
        }
      ];
    },
    setNew: async ({ guild, user, data }) => {
      const toggle = data[0].data;

      if (toggle === false) {
        await new LevelConfigSchema({
          guildId: guild.id,
          status: true
        }).save();
      } else {
        await LevelConfigSchema.deleteOne({ guildId: guild.id });
      }
    },
    categoryOptionsList: [
      {
        optionId: 'levelToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the Level Module.',
        optionType: DBD.formTypes.switch()
      }
    ]
  };

  return AdsProtection;
};
