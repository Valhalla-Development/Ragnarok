/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import { ChannelType, PermissionsBitField } from 'discord.js';
import fetch from 'node-fetch';
import Canvas from 'canvas';
import WelcomeSchema from '../../Mongo/Schemas/Welcome.js';

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

  const Welcome = {
    categoryId: 'Welcome',
    categoryName: 'Welcome',
    categoryDescription: 'Configure the Welcome module.',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    refreshOnSave: true,
    getActualSet: async ({ guild }) => {
      const result = await WelcomeSchema.findOne({ GuildId: guild.id });
      const channelStatus = result ? result.ChannelId : null;
      const imageStatus = result ? result.Image : null;
      const status = !!result;

      return [
        {
          optionId: 'welcomeChannel',
          data: channelStatus
        },
        {
          optionId: 'welcomeImage',
          data: imageStatus
        },
        {
          optionId: 'welcomeToggle',
          data: status
        }
      ];
    },
    setNew: async ({ guild, user, data }) => {
      const result = await WelcomeSchema.findOne({ GuildId: guild.id });

      if (data.some((option) => option.optionId === 'welcomeToggle' && option.data === false)) {
        await WelcomeSchema.deleteOne({ GuildId: guild.id });
        return;
      }

      if (data.some((option) => option.optionId === 'welcomeImage') && !data.some((option) => option.optionId === 'welcomeChannel')) {
        if (!result?.ChannelId) {
          return { error: 'Please set a channel before setting the image!' };
        }
      }

      if (!data.some((option) => option.optionId === 'welcomeChannel')) {
        if (!result?.ChannelId) {
          return { error: 'Please set a channel.' };
        }
      }

      const welcomeImgObject = data.find((obj) => obj.optionId === 'welcomeImage');
      if (welcomeImgObject?.data) {
        const urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
        if (!urlRegex.test(welcomeImgObject.data)) {
          return { error: 'Please provide an absolute URL.' };
        }

        await fetch(welcomeImgObject.data).then(async (res) => {
          if (res.ok) {
            try {
              await Canvas.loadImage(welcomeImgObject.data); //! same code as welcome system, found bug for my site where it redirects, it will still load the image for some reason, but then says unsupported image when it try to send, so find a fix!
            } catch {
              return { error: 'Please provide a valid image.' };
            }
          } else {
            return { error: 'Please provide a valid image.' };
          }
        });
      }

      console.log('6');
      let welcomeImg = result?.Image || null;
      let welcomeChan = result?.ChannelId || null;
      const welcomeChannelObject = data.find((obj) => obj.optionId === 'welcomeChannel');
      welcomeImg = welcomeImgObject?.data || welcomeImg;
      welcomeChan = welcomeChannelObject?.data || welcomeChan;

      if (!result) {
        await new WelcomeSchema({
          GuildId: guild.id,
          ChannelId: welcomeChan,
          Image: welcomeImg
        }).save();
      } else {
        await WelcomeSchema.findOneAndUpdate(
          {
            GuildId: guild.id
          },
          {
            ChannelId: welcomeChan,
            Image: welcomeImg
          }
        );
      }
    },
    categoryOptionsList: [
      {
        optionId: 'welcomeChannel',
        optionName: 'Channel',
        optionDescription: 'Select the channel to set.',
        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], false, false),
        allowedCheck
      },
      {
        optionId: 'welcomeImage',
        optionName: 'Image',
        optionDescription:
          'Select the (optional) image. An absolute URL must be provided to the image you wish to be displayed. Allowed extensions are: jpg, jpeg, png',
        optionType: DBD.formTypes.textarea(),
        allowedCheck
      },
      {
        optionId: 'welcomeToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the Welcome module.',
        optionType: DBD.formTypes.switch(),
        allowedCheck
      }
    ]
  };

  return Welcome;
};
