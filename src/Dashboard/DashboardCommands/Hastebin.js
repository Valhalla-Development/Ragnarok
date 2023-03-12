/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import { PermissionsBitField } from 'discord.js';
import HastebinSchema from '../../Mongo/Schemas/Hastebin.js';

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

  return {
    categoryId: 'Hastebin',
    categoryName: 'Hastebin',
    categoryDescription: 'Toggle the Hastebin Module. When enabled, it will remove any links posted via the command.',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    getActualSet: async ({ guild }) => {
      const result = await HastebinSchema.findOne({ GuildId: guild.id });
      const status = !!result;
      return [
        {
          optionId: 'dadToggle',
          data: status
        }
      ];
    },
    setNew: async ({ guild, data }) => {
      const toggle = data[0].data;

      if (toggle === true) {
        await new HastebinSchema({
          GuildId: guild.id,
          Status: toggle
        }).save();
      } else {
        await HastebinSchema.deleteOne({ GuildId: guild.id });
      }
    },
    categoryOptionsList: [
      {
        optionId: 'dadToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the Hastebin Module.',
        optionType: DBD.formTypes.switch(),
        allowedCheck
      }
    ]
  };
};
