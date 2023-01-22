/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import DBD from 'discord-dashboard';
import { ChannelType } from 'discord.js';
import fetch from 'node-fetch';
import Canvas from 'canvas';
import WelcomeSchema from '../../Mongo/Schemas/Welcome.js';

export default (client) => {
  const Welcome = {
    categoryId: 'Welcome',
    categoryName: 'Welcome',
    categoryDescription: 'Configure the Welcome module.',
    categoryImageURL: 'https://ragnarokbot.com/assets/img/functions/moderation.png',
    refreshOnSave: true,
    getActualSet: async ({ guild }) => {
      const result = await WelcomeSchema.findOne({ guildId: guild.id });
      const channelStatus = result ? result.channel : null;
      const imageStatus = result ? result.image : null;
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
      const result = await WelcomeSchema.findOne({ guildId: guild.id });

      if (data.some((option) => option.optionId === 'welcomeToggle' && option.data === false)) {
        await WelcomeSchema.deleteOne({ guildId: guild.id });
        return;
      }

      if (data.some((option) => option.optionId === 'welcomeImage') && !data.some((option) => option.optionId === 'welcomeChannel')) {
        if (!result?.channel) {
          return { error: 'Please set a channel before setting the image!' };
        }
      }

      if (!data.some((option) => option.optionId === 'welcomeChannel')) {
        if (!result?.channel) {
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
      let welcomeImg = result?.image || null;
      let welcomeChan = result?.channel || null;
      const welcomeChannelObject = data.find((obj) => obj.optionId === 'welcomeChannel');
      welcomeImg = welcomeImgObject?.data || welcomeImg;
      welcomeChan = welcomeChannelObject?.data || welcomeChan;

      if (!result) {
        await new WelcomeSchema({
          guildId: guild.id,
          channel: welcomeChan,
          image: welcomeImg
        }).save();
      } else {
        await WelcomeSchema.findOneAndUpdate(
          {
            guildId: guild.id
          },
          {
            channel: welcomeChan,
            image: welcomeImg
          }
        );
      }
    },
    categoryOptionsList: [
      {
        optionId: 'welcomeChannel',
        optionName: 'Channel',
        optionDescription: 'Select the channel to set.',
        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], false, false)
      },
      {
        optionId: 'welcomeImage',
        optionName: 'Image',
        optionDescription:
          'Select the (optional) image. An absolute URL must be provided to the image you wish to be displayed. Allowed extensions are: jpg, jpeg, png',
        optionType: DBD.formTypes.textarea()
      },
      {
        optionId: 'welcomeToggle',
        optionName: 'Toggle',
        optionDescription: 'Toggle the Welcome module.',
        optionType: DBD.formTypes.switch()
      }
    ]
  };

  return Welcome;
};
