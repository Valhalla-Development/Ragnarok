/* eslint-disable default-case */
/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-restricted-syntax */
import { ChannelType, PermissionsBitField } from 'discord.js';
import DBD from 'discord-dashboard';
import validator from 'discord-embed-validator';

export default (client) => {
  const sendEmbed = (channel, str) => {
    const c = client.channels.cache.get(channel);
    c.send(getOutput(str));
  };

  const allowedCheck = async ({ guild, user }) => {
    // Fetch guild
    const fetchGuild = client.guilds.cache.get(guild.id);
    // Fetch user
    const fetchUser = fetchGuild.members.cache.get(user.id);
    // Check if user has perm 'ManageMessages'
    if (!fetchUser.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return {
        allowed: false,
        errorMessage: 'You cannot use this option - Manage Messages permission required.'
      };

    return {
      allowed: true,
      errorMessage: null
    };
  };

  const Embed = {
    categoryId: 'EmbedCreator',
    categoryName: 'Embed Creator',
    categoryDescription: 'Build your own Embed, and send it to a specified channel!',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    getActualSet: async ({ guild }) => [
      {
        optionId: 'embed'
      },
      {
        optionId: 'channel'
      }
    ],
    setNew: async ({ guild, user, data }) => {
      if (
        data.some((option) => option.optionId === 'embed' && Object.keys(option.data).length > 0) &&
        data.some((option) => option.optionId === 'channel' && option.data)
      ) {
        const [returnedChannel, returnedEmbed, error] = forLoopThingy(data);
        if (error) return error;
        sendEmbed(returnedChannel, returnedEmbed);
      }
      const [returnedChannel, returnedEmbed, error] = forLoopThingy(data);
      if (error) return error;
      if (!returnedChannel && Object.keys(returnedEmbed).length <= 0) {
        return { error: 'Please save a valid Embed, and Channel.' };
      }
      if (!returnedChannel) {
        return { error: 'Please save a valid Channel.' };
      }
      if (Object.keys(returnedEmbed).length <= 0) {
        return { error: 'Please save a valid Embed.' };
      }
    },
    categoryOptionsList: [
      {
        optionId: 'embed',
        optionName: 'Embed Creator',
        optionDescription: 'Build your own Embed, and send it to a specified channel!',
        optionType: DBD.formTypes.embedBuilder({
          username: 'Ragnarok',
          avatarURL: 'https://cdn.discordapp.com/avatars/508756879564865539/cf3b93aaee0351708a4f65593e6fe6b4.webp',
          defaultJson: {}
        }),
        allowedCheck
      },
      {
        optionId: 'channel',
        optionName: 'Embed Channel',
        optionDescription: 'Pick a channel to send the embed to.',
        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], false, false, true),
        allowedCheck
      }
    ]
  };

  function forLoopThingy(data) {
    let channel;
    let embed;
    let error;

    for (const item of data) {
      let result;
      switch (item.optionId) {
        case 'embed':
          embed = removeEmptyValues(item.data);
          if (embed.embed) {
            result = validator.validate(removeEmptyValues(embed.embed));
            if (result.error) {
              error = { error: result.error.details[0]?.message };
              return [channel, embed, error];
            }
          }

          break;
        case 'channel':
          channel = item.data;
          break;
      }
    }

    return [channel, embed, error];
  }

  function getOutput(str) {
    // create a copy of str
    const modifiedStr = { ...str };

    if (modifiedStr.embed) {
      for (const key of Object.keys(modifiedStr.embed)) {
        if (modifiedStr.embed[key] === '') {
          delete modifiedStr.embed[key];
        }
      }

      if (Object.keys(str.embed).length === 0) {
        delete modifiedStr.embed;
      }
    }

    let output = {};

    // if no embed and content
    if (!modifiedStr.embed && modifiedStr.content) {
      output = modifiedStr;
      // if embed and no content
    } else if (modifiedStr.embed && !modifiedStr.content) {
      output = { embeds: [modifiedStr.embed] };
      // if both content and embed
    } else {
      output = { embeds: [modifiedStr.embed], content: modifiedStr.content };
    }

    return output;
  }

  function removeEmptyValues(obj) {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        const newArray = value.map((item) => {
          if (typeof item === 'object') {
            return removeEmptyValues(item);
          }
          return item;
        });
        const filteredArray = newArray.filter((item) => Object.keys(item).length > 0);
        if (filteredArray.length > 0) {
          newObj[key] = filteredArray;
        }
      } else if (value !== '') {
        if (typeof value === 'object') {
          const nestedObj = removeEmptyValues(value);
          if (Object.keys(nestedObj).length > 0) {
            newObj[key] = nestedObj;
          }
        } else {
          newObj[key] = value;
        }
      }
    }
    return newObj;
  }

  return Embed;
};
