/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import AdsProtectionSchema from '../../Mongo/Schemas/AdsProtection.js';

export default (client) => {
  const AdsProtection = {
    categoryId: 'AdProtection',
    categoryName: 'Advert Protection',
    categoryDescription: 'Toggle the Advert Protection Module. When enabled, it will remove all links posted.',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    getActualSet: async ({ guild }) => {
      const result = await AdsProtectionSchema.findOne({ GuildId: guild.id });
      const status = !!result;
      return [
        {
          optionId: 'adToggle',
          data: status
        }
      ];
    },
    setNew: async ({ guild, user, data }) => {
      const toggle = data[0].data;

      if (toggle === true) {
        await new AdsProtectionSchema({
          GuildId: guild.id,
          Status: toggle
        }).save();
      } else {
        await AdsProtectionSchema.deleteOne({ GuildId: guild.id });
      }
    },
    categoryOptionsList: [
      {
        optionId: 'adToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the Advert Protection Module.',
        optionType: DBD.formTypes.switch()
      }
    ]
  };

  return AdsProtection;
};
