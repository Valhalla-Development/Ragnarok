/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import { PermissionsBitField } from 'discord.js';
import AntiScamSchema from '../../Mongo/Schemas/AntiScam.js';

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
    categoryId: 'AntiScam',
    categoryName: 'Anti Scam',
    categoryDescription: 'Toggle the Anti Scam Module. When enabled, it will remove all known scam links (retreived from an API).',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    getActualSet: async ({ guild }) => {
      const result = await AntiScamSchema.findOne({ GuildId: guild.id });
      const status = !!result;
      return [
        {
          optionId: 'antiToggle',
          data: status
        }
      ];
    },
    setNew: async ({ guild, data }) => {
      const toggle = data[0].data;

      if (toggle === true) {
        await new AntiScamSchema({
          GuildId: guild.id,
          Status: toggle
        }).save();
      } else {
        await AntiScamSchema.deleteOne({ GuildId: guild.id });
      }
    },
    categoryOptionsList: [
      {
        optionId: 'antiToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the Anti Anti Scam Module.',
        optionType: DBD.formTypes.switch(),
        allowedCheck
      }
    ]
  };
};
