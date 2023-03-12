/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import { PermissionsBitField } from 'discord.js';
import LevelConfigSchema from '../../Mongo/Schemas/LevelConfig.js';

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
    categoryId: 'Level',
    categoryName: 'Level',
    categoryDescription: 'Toggle the Level Module. When disabled, no level up messages will be posted (You can still gain XP).',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    getActualSet: async ({ guild }) => {
      const result = await LevelConfigSchema.findOne({ GuildId: guild.id });
      const status = !result;
      return [
        {
          optionId: 'levelToggle',
          data: status
        }
      ];
    },
    setNew: async ({ guild, data }) => {
      const toggle = data[0].data;

      if (toggle === false) {
        await new LevelConfigSchema({
          GuildId: guild.id,
          Status: true
        }).save();
      } else {
        await LevelConfigSchema.deleteOne({ GuildId: guild.id });
      }
    },
    categoryOptionsList: [
      {
        optionId: 'levelToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the Level Module.',
        optionType: DBD.formTypes.switch(),
        allowedCheck
      }
    ]
  };

  return AdsProtection;
};
