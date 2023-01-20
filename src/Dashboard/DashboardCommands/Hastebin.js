/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import HastebinSchema from '../../Mongo/Schemas/Hastebin.js';

export default (client) => {
  const AdsProtection = {
    categoryId: 'Hastebin',
    categoryName: 'Hastebin',
    categoryDescription: 'Toggle the Hastebin Module. When enabled, it will remove any links posted via the command.',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    getActualSet: async ({ guild }) => {
      const result = await HastebinSchema.findOne({ guildId: guild.id });
      const status = !!result;
      return [
        {
          optionId: 'dadToggle',
          data: status
        }
      ];
    },
    setNew: async ({ guild, user, data }) => {
      const toggle = data[0].data;

      if (toggle === true) {
        await new HastebinSchema({
          guildId: guild.id,
          status: toggle
        }).save();
      } else {
        await HastebinSchema.deleteOne({ guildId: guild.id });
      }
    },
    categoryOptionsList: [
      {
        optionId: 'dadToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the Hastebin Module.',
        optionType: DBD.formTypes.switch()
      }
    ]
  };

  return AdsProtection;
};
