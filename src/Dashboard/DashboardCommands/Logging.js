/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import { ChannelType } from 'discord.js';
import LoggingSchema from '../../Mongo/Schemas/Logging.js';

export default (client) => {
  const Logging = {
    categoryId: 'Logging',
    categoryName: 'Logging',
    categoryDescription: 'Set the Logging channel.',
    refreshOnSave: true,
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    getActualSet: async ({ guild }) => {
      const result = await LoggingSchema.findOne({ guildId: guild.id });
      const channelStatus = result ? result.channel : null;
      const status = !!result;

      return [
        {
          optionId: 'loggingChannel',
          data: channelStatus
        },
        {
          optionId: 'loggingToggle',
          data: status
        }
      ];
    },
    setNew: async ({ guild, user, data }) => {
      const result = await LoggingSchema.findOne({ guildId: guild.id });

      if (data.some((option) => option.optionId === 'loggingToggle' && option.data === false)) {
        await LoggingSchema.deleteOne({ guildId: guild.id });
        return;
      }

      const loggingObject = data.find((obj) => obj.optionId === 'loggingChannel');
      if (!loggingObject?.data) return { error: 'Please select a channel' };

      if (!result) {
        await new LoggingSchema({
          guildId: guild.id,
          channel: loggingObject.data
        }).save();
      } else {
        await LoggingSchema.findOneAndUpdate(
          {
            guildId: guild.id
          },
          {
            channel: loggingObject.data
          }
        );
      }
    },
    categoryOptionsList: [
      {
        optionId: 'loggingChannel',
        optionName: 'Channel',
        optionDescription: 'Select a channel.',
        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], false, false)
      },
      {
        optionId: 'loggingToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the Logging Module.',
        optionType: DBD.formTypes.switch()
      }
    ]
  };

  return Logging;
};
