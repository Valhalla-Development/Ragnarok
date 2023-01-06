/* eslint-disable no-restricted-syntax */
import { EmbedBuilder, ChannelType } from 'discord.js';
import DBD from 'discord-dashboard';

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

  const newDataValues = {
    str: null,
    channel: null
  };

  embedEmbed.setNew = async ({ guild, user, newData }) => {
    newDataValues.str = newData;
    if (newDataValues.channel && newDataValues.str) {
      const c = client.channels.cache.get(newDataValues.channel);
      c.send(getOutput(newDataValues.str));
    } else {
      return { error: 'Please save both Embed, and Channel' };
    }
  };

  embedChan.setNew = async ({ guild, user, newData }) => {
    newDataValues.channel = newData;
    if (newDataValues.channel && newDataValues.str) {
      const c = client.channels.cache.get(newDataValues.channel);
      c.send(getOutput(newDataValues.str));
    } else {
      return { error: 'Please save both Embed, and Channel' };
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

  return embedCat;
};
