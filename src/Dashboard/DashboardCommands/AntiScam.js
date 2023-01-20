/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import AntiScamSchema from '../../Mongo/Schemas/AntiScam.js';

export default (client) => {
  const AntiScam = {
    categoryId: 'AntiScam',
    categoryName: 'Anti Scam',
    categoryDescription: 'Toggle the Anti Scam Module. When enabled, it will remove all known scam links (retreived from an API).',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    getActualSet: async ({ guild }) => {
      const result = await AntiScamSchema.findOne({ guildId: guild.id });
      const status = !!result;
      return [
        {
          optionId: 'antiToggle',
          data: status
        }
      ];
    },
    setNew: async ({ guild, user, data }) => {
      const toggle = data[0].data;

      if (toggle === true) {
        await new AntiScamSchema({
          guildId: guild.id,
          status: toggle
        }).save();
      } else {
        await AntiScamSchema.deleteOne({ guildId: guild.id });
      }
    },
    categoryOptionsList: [
      {
        optionId: 'antiToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the Anti Anti Scam Module.',
        optionType: DBD.formTypes.switch()
      }
    ]
  };

  return AntiScam;
};
