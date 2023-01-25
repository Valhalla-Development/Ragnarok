/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import { ChannelType, PermissionsBitField } from 'discord.js';
import LoggingSchema from '../../Mongo/Schemas/Logging.js';

export default (client) => {
  const allowedCheck = async ({ guild, user }) => {
    // Fetch guild
    const fetchGuild = client.guilds.cache.get(guild.id);
    // Fetch user
    const fetchUser = fetchGuild.members.cache.get(user.id);
    // Check if user has perm 'ManageMessages'
    if (!fetchUser.permissions.has(PermissionsBitField.Flags.ManageGuild))
      return {
        allowed: false,
        errorMessage: 'You cannot use this option - Manage Server permission required.'
      };

    return {
      allowed: true,
      errorMessage: null
    };
  };

  const Logging = {
    categoryId: 'Logging',
    categoryName: 'Logging',
    categoryDescription: 'Set the Logging channel.',
    refreshOnSave: true,
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    getActualSet: async ({ guild }) => {
      const result = await LoggingSchema.findOne({ GuildId: guild.id });
      const channelStatus = result ? result.ChannelId : null;
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
      const result = await LoggingSchema.findOne({ GuildId: guild.id });

      if (data.some((option) => option.optionId === 'loggingToggle' && option.data === false)) {
        await LoggingSchema.deleteOne({ GuildId: guild.id });
        return;
      }

      const loggingObject = data.find((obj) => obj.optionId === 'loggingChannel');
      if (!loggingObject?.data) return { error: 'Please select a channel' };

      if (!result) {
        await new LoggingSchema({
          GuildId: guild.id,
          ChannelId: loggingObject.data
        }).save();
      } else {
        await LoggingSchema.findOneAndUpdate(
          {
            GuildId: guild.id
          },
          {
            ChannelId: loggingObject.data
          }
        );
      }
    },
    categoryOptionsList: [
      {
        optionId: 'loggingChannel',
        optionName: 'Channel',
        optionDescription: 'Select a channel.',
        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], false, false),
        allowedCheck
      },
      {
        optionId: 'loggingToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the Logging Module.',
        optionType: DBD.formTypes.switch(),
        allowedCheck
      }
    ]
  };

  return Logging;
};
