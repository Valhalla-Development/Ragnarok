/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import DadSchema from '../../Mongo/Schemas/Dad.js';

export default (client) => {
  const AdsProtection = {
    categoryId: 'Dad',
    categoryName: 'Dad',
    categoryDescription: 'Toggle the Dad Module. When enabled, it will respond to messages starting with \'im\'.',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    getActualSet: async ({ guild }) => {
      const result = await DadSchema.findOne({ guildId: guild.id });
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
        await new DadSchema({
          guildId: guild.id,
          status: toggle
        }).save();
      } else {
        await DadSchema.deleteOne({ guildId: guild.id });
      }
    },
    categoryOptionsList: [
      {
        optionId: 'dadToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the Dad Module.',
        optionType: DBD.formTypes.switch()
      }
    ]
  };

  return AdsProtection;
};
