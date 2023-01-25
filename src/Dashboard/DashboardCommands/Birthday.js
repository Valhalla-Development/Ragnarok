/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import { ChannelType } from 'discord.js';
import BirthdayConfigSchema from '../../Mongo/Schemas/BirthdayConfig.js';

export default (client) => {
  const Birthday = {
    categoryId: 'Birthday',
    categoryName: 'Birthday Config',
    categoryDescription: 'Configure the Birthday module.',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    refreshOnSave: true,
    getActualSet: async ({ guild }) => {
      const result = await BirthdayConfigSchema.findOne({ GuildId: guild.id });
      const channelStatus = result ? result.ChannelId : null;
      const roleStatus = result ? result.Role : null;
      const status = !!result;

      return [
        {
          optionId: 'birthdayChannel',
          data: channelStatus
        },
        {
          optionId: 'birthdayRole',
          data: roleStatus
        },
        {
          optionId: 'birthdayToggle',
          data: status
        }
      ];
    },
    setNew: async ({ guild, user, data }) => {
      const result = await BirthdayConfigSchema.findOne({ GuildId: guild.id });

      if (data.some((option) => option.optionId === 'birthdayToggle' && option.data === false)) {
        await BirthdayConfigSchema.deleteOne({ GuildId: guild.id });
        return;
      }

      if (data.some((option) => option.optionId === 'birthdayRole') && !data.some((option) => option.optionId === 'birthdayChannel')) {
        if (!result?.ChannelId) {
          return { error: 'Please set a channel before setting the role!' };
        }
      }

      if (!data.some((option) => option.optionId === 'birthdayChannel')) {
        if (!result?.ChannelId) {
          return { error: 'Please set a channel.' };
        }
      }

      let birthdayRol = result?.Role || null;
      let birthdayChan = result?.ChannelId || null;
      const birthdayroleObj = data.find((obj) => obj.optionId === 'birthdayRole');
      const birthdayChannelObj = data.find((obj) => obj.optionId === 'birthdayChannel');
      birthdayRol = birthdayroleObj?.data || birthdayRol;
      birthdayChan = birthdayChannelObj?.data || birthdayChan;
      console.log(result);
      if (!result) {
        await new BirthdayConfigSchema({
          GuildId: guild.id,
          ChannelId: birthdayChan,
          Role: birthdayRol
        }).save();
      } else {
        await BirthdayConfigSchema.findOneAndUpdate(
          {
            GuildId: guild.id
          },
          {
            ChannelId: birthdayChan,
            Role: birthdayRol
          }
        );
      }
    },
    categoryOptionsList: [
      {
        optionId: 'birthdayChannel',
        optionName: 'Channel',
        optionDescription: 'Select the channel to set.',
        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], false, false)
      },
      {
        optionId: 'birthdayRole',
        optionName: 'Role',
        optionDescription: 'Select the role to set.',
        optionType: DBD.formTypes.rolesSelect()
      },
      {
        optionId: 'birthdayToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the Birthday module.',
        optionType: DBD.formTypes.switch()
      }
    ]
  };

  return Birthday;
};
