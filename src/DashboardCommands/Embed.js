/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-restricted-syntax */
import { EmbedBuilder, ChannelType, codeBlock } from 'discord.js';
import DBD from 'discord-dashboard';
import validator from 'discord-embed-validator';

const Handler = new DBD.Handler();

export default (client) => {
  const embedEmbed = new Handler.Option()
    .setId('embedCreator')
    .setName('Embed Creator')
    .setDescription('Build your own Welcome Embed, and send it to a specified channel!')
    .setType(
      DBD.formTypes.embedBuilder({
        username: 'Ragnarok#1948',
        avatarURL: 'https://cdn.discordapp.com/avatars/508756879564865539/cf3b93aaee0351708a4f65593e6fe6b4.webp',
        defaultJson: {}
      })
    );

  const embedChan = new Handler.Option()
    .setId('embedChannel')
    .setName('Embed Channel')
    .setDescription('Pick a channel to send the embed to.')
    .setType(DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], false, false));

  let newDataValues = {
    str: null,
    channel: null,
    guild: null
  };

  const sendEmbed = (channel, str) => {
    const c = client.channels.cache.get(newDataValues.channel);
    c.send(getOutput(str));
  };

  embedEmbed.setNew = async ({ guild, user, newData }) => {
    try {
      if (newDataValues.guild !== guild.id) {
        newDataValues = {
          str: null,
          channel: null,
          guild: null
        };
      }

      const modifiedData = { ...newData };

      if (!modifiedData || Object.keys(modifiedData).length === 0) {
        return { error: 'Please save a valid Embed' };
      }
      if (modifiedData.embed) {
        const result = validator.validate(removeEmptyValues(modifiedData.embed));
        if (result.error) {
          console.log(removeEmptyValues(modifiedData.embed));
          return { error: result.error.details[0]?.message };
        }
        modifiedData.embed = removeEmptyValues(modifiedData.embed);
      }

      newDataValues.str = modifiedData;
      newDataValues.guild = guild.id;

      if (newDataValues.channel && newDataValues.str) {
        sendEmbed(newDataValues.str); // THIS IS SENDING TO 2 DIFFERENT CHANNELS BECAUSE BOTH EVENTS HAVE SENDEMBED
      }
    } catch (e) {
      console.log(e);
      sendError(client, e.stack);
      return { error: 'You found a bug! Please contact an Administrator.' };
    }
  };

  embedChan.setNew = async ({ guild, user, newData }) => {
    try {
      if (newDataValues.guild !== guild.id) {
        newDataValues = {
          str: null,
          channel: null,
          guild: null
        };
      }
      newDataValues.channel = newData;
      newDataValues.guild = guild.id;

      if (newDataValues.channel && newDataValues.str) {
        sendEmbed(newDataValues.str);
      }
    } catch (e) {
      console.log(e);
      sendError(client, e.stack);
      return { error: 'You found a bug! Please contact an Administrator.' };
    }
  };

  const embedCat = new Handler.Category()
    .setId('embed')
    .setName('Embed Creation')
    .setDescription('Easily create an embed and send it to a specified channel!')
    .addOptions(embedEmbed, embedChan);

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

  // Error function for notifiers
  function sendError(cl, message) {
    try {
      const channel = cl.channels.cache.get('685973401772621843');
      if (!channel) return;

      const typeOfError = message.split(':')[0];
      const fullError = message.replace(/^[^:]+:/, '').trimStart();
      const timeOfError = `<t:${Math.floor(new Date().getTime() / 1000)}>`;
      const fullString = `From: \`${typeOfError}\`\nTime: ${timeOfError}\n\nError:\n${codeBlock('js', fullError)}`;

      function truncateDescription(description) {
        const maxLength = 2048;
        if (description.length > maxLength) {
          const numTruncatedChars = description.length - maxLength;
          return `${description.slice(0, maxLength)}... ${numTruncatedChars} more`;
        }
        return description;
      }

      const embed = new EmbedBuilder().setTitle('Dashboard Error').setDescription(truncateDescription(fullString));
      channel.send({ embeds: [embed] });
    } catch (e) {
      console.log(e.stack);
    }
  }

  return embedCat;
};
