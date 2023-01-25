/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import { PermissionsBitField } from 'discord.js';
import DadSchema from '../../Mongo/Schemas/Dad.js';

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

  const AdsProtection = {
    categoryId: 'Dad',
    categoryName: 'Dad',
    categoryDescription: 'Toggle the Dad Module. When enabled, it will respond to messages starting with \'im\'.',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    getActualSet: async ({ guild }) => {
      const result = await DadSchema.findOne({ GuildId: guild.id });
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
          GuildId: guild.id,
          Status: toggle
        }).save();
      } else {
        await DadSchema.deleteOne({ GuildId: guild.id });
      }
    },
    categoryOptionsList: [
      {
        optionId: 'dadToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the Dad Module.',
        optionType: DBD.formTypes.switch(),
        allowedCheck
      }
    ]
  };

  return AdsProtection;
};
