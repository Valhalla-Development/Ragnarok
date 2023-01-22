/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import { ChannelType } from 'discord.js';
import StarBoardSchema from '../../Mongo/Schemas/StarBoard.js';

export default (client) => {
  const Starboard = {
    categoryId: 'Starboard',
    categoryName: 'Starboard',
    categoryDescription: 'Set the Starboard channel.',
    refreshOnSave: true,
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    getActualSet: async ({ guild }) => {
      const result = await StarBoardSchema.findOne({ guildId: guild.id });
      const channelStatus = result ? result.channel : null;
      const status = !!result;

      return [
        {
          optionId: 'starChannel',
          data: channelStatus
        },
        {
          optionId: 'starToggle',
          data: status
        }
      ];
    },
    setNew: async ({ guild, user, data }) => {
      const result = await StarBoardSchema.findOne({ guildId: guild.id });

      if (data.some((option) => option.optionId === 'starToggle' && option.data === false)) {
        await StarBoardSchema.deleteOne({ guildId: guild.id });
        return;
      }

      const starObject = data.find((obj) => obj.optionId === 'starChannel');
      if (!starObject?.data) return { error: 'Please select a channel' };

      if (!result) {
        await new StarBoardSchema({
          guildId: guild.id,
          channel: starObject.data
        }).save();
      } else {
        await StarBoardSchema.findOneAndUpdate(
          {
            guildId: guild.id
          },
          {
            channel: starObject.data
          }
        );
      }
    },
    categoryOptionsList: [
      {
        optionId: 'starChannel',
        optionName: 'Channel',
        optionDescription: 'Select a channel.',
        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], false, false)
      },
      {
        optionId: 'starToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the Starboard Module.',
        optionType: DBD.formTypes.switch()
      }
    ]
  };

  return Starboard;
};
