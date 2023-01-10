/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-nested-ternary */
import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import abbreviate from 'number-abbreviate';
import { parse } from 'twemoji-parser';
import countryList from 'countries-list';
import fetch from 'node-fetch';
import Canvas from 'canvas';
import mongoose from 'mongoose';
import converter from 'number-to-words-en';
import SlashCommand from '../../Structures/SlashCommand.js';
import LevelConfig from '../../Mongo/Schemas/LevelConfig.js';
import Level from '../../Mongo/Schemas/Level.js';

Canvas.registerFont('./Storage/Canvas/Fonts/Shapirit.otf', {
  family: 'Shapirit'
});

const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Display command list / command usage.')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('user')
      .setDescription('The user you wish to lookup')
      .addUserOption((option) => option.setName('user').setDescription('The user you wish to lookup').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('image')
      .setDescription('Set custom image')
      .addStringOption((option) => option.setName('image').setDescription('Set custom image').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('country')
      .setDescription('Sets your country')
      .addStringOption((option) => option.setName('country').setDescription('Set custom country').setRequired(true))
  );

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Displays level of a user',
      category: 'Fun',
      botPerms: ['AttachFiles'],
      options: data
    });
  }

  async run(interaction) {
    await interaction.deferReply();

    const args = interaction.options.getSubcommand();

    const levelDb = await LevelConfig.findOne({ guildId: interaction.guild.id });

    if (levelDb) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Level**`, value: '**◎ Error:** Level system is disabled for this guild!' });
      interaction.editReply({ ephemeral: true, embeds: [embed] });
      return;
    }

    if (args === 'country') {
      const option = interaction.options.getString('country');

      let score;
      if (interaction.guild) {
        score = await Level.findOne({ idJoined: `${interaction.guild.id}-${interaction.user.id}` });
      }

      if (!score) {
        const xpAdd = Math.floor(Math.random() * (25 - 15 + 1) + 15);

        await new Level({
          _id: mongoose.Types.ObjectId(),
          idJoined: `${interaction.guild.id}-${interaction.user.id}`,
          userId: interaction.user.id,
          guildId: interaction.guild.id,
          xp: xpAdd,
          level: 0,
          country: null,
          image: null
        }).save();
      }

      if (option === 'off') {
        if (score && !score.country) {
          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Level**`, value: '**◎ Error:** You do not have a country set.' });
          interaction.editReply({ ephemeral: true, embeds: [embed] });
          return;
        }
        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Level**`, value: '**◎ Success:** I have disabled your country flag!' });
        interaction.editReply({ ephemeral: true, embeds: [embed] });

        score.country = null;
        await score.save();
        return;
      }

      try {
        const fetchCountry = countryList.countries[option.toUpperCase()];
        const url = await parse(fetchCountry.emoji);

        url[0].url = url[0].url.replace('twemoji.maxcdn.com/v/latest/', 'cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/');
        // temporary fix because maxcdn has stopped supporting twemoji
        score.country = url[0].url;
        await score.save();

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Level**`, value: `**◎ Success:** You selected \`${fetchCountry.name}\`` });
        interaction.editReply({ ephemeral: true, embeds: [embed] });
        return;
      } catch {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Config**`,
          value: `**◎ Error:** Did you input a valid country code? Your input was: \`${option.toUpperCase()}\`\nYou can find your country code here: https://www.countrycode.org/\nPlease input the '2 DIGIT ISO' within your country page.`
        });
        interaction.editReply({ ephemeral: true, embeds: [embed] });
        return;
      }
    }

    if (args === 'image') {
      const option = interaction.options.getString('image');

      let score;
      if (interaction.guild) {
        score = await Level.findOne({ idJoined: `${interaction.guild.id}-${interaction.user.id}` });
      }

      if (!score) {
        //! test because the next code may error because !score
        const xpAdd = Math.floor(Math.random() * (25 - 15 + 1) + 15);

        await new Level({
          _id: mongoose.Types.ObjectId(),
          idJoined: `${interaction.guild.id}-${interaction.user.id}`,
          userId: interaction.user.id,
          guildId: interaction.guild.id,
          xp: xpAdd,
          level: 0,
          country: null,
          image: null
        }).save();
      }

      if (interaction.guild.id) {
        if (option === 'off') {
          if (!score.image) {
            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Level**`, value: '**◎ Error:** You have no custom image enabled!' });
            interaction.editReply({ ephemeral: true, embeds: [embed] });
            return;
          }

          await Level.findOneAndUpdate(
            {
              idJoined: `${interaction.guild.id}-${interaction.user.id}`
            },
            {
              image: null
            }
          );

          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Level**`, value: '**◎ Success:** Custom image has been disabled!' });
          interaction.editReply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (!option) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Level**`,
            value:
              '**◎ Error:** Incorrect Usage! An example of this command would be: `/level image <url-to-image>` or to disable: `/level image off`'
          });
          interaction.editReply({ ephemeral: true, embeds: [embed] });
          return;
        }

        const urlExtension = option.substring(option.lastIndexOf('.') + 1);
        const validExtensions = ['jpg', 'jpeg', 'png'];

        if (!validExtensions.includes(urlExtension)) {
          const invalidExt = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Level**`,
            value: `**◎ Error:** \`.${urlExtension}\` is not a valid image type!\n\n**Acceptable files:**\n\`${validExtensions.join(', ')}\``
          });
          interaction.editReply({ ephemeral: true, embeds: [invalidExt] });
          return;
        }

        const urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;

        if (!urlRegex.test(option)) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Level**`,
            value: '**◎ Error:** Please enter a valid URL, the URL must be absolute! An example of an absolute URL would be: https://www.google.com'
          });
          interaction.editReply({ ephemeral: true, embeds: [embed] });
          return;
        }

        await fetch(option).then(async (res) => {
          if (res.ok) {
            try {
              await Canvas.loadImage(option);
            } catch {
              const invalidExt = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Level**`,
                value: `**◎ Error:** I was unable to process \`${option}\`\nIs it a valid image?`
              });
              interaction.editReply({ ephemeral: true, embeds: [invalidExt] });
              return;
            }

            await Level.findOneAndUpdate(
              {
                idJoined: `${interaction.guild.id}-${interaction.user.id}`
              },
              {
                image: option
              }
            );

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
              .setImage(option)
              .addFields({ name: `**${this.client.user.username} - Level**`, value: '**◎ Success:** Image has been updated to the following.' });
            interaction.editReply({ ephemeral: true, embeds: [embed] });
          } else {
            const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Level**`,
              value:
                '**◎ Error:** Please enter a valid image URL! The end of the URL must end with one of the supported extensions. (`.jpg, .jpeg, .png`)'
            });
            interaction.editReply({ ephemeral: true, embeds: [embed] });
          }
        });

        return;
      }
    }

    let user;
    try {
      user = interaction.options.getMember('user') || interaction.member;
    } catch {
      user = null;
    }

    if (user === null) {
      const limitE = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Level**`, value: '**◎ Error:** I could not find the specified user!' });
      interaction.editReply({ ephemeral: true, embeds: [limitE] });
      return;
    }

    if (user.bot) return;

    const colorGrab = this.client.utils.color(interaction.guild.members.cache.find((grabUser) => grabUser.id === user.id).displayHexColor);

    let score = await Level.findOne({ idJoined: `${interaction.guild.id}-${user.id}` });

    if (!score) {
      // Random amount between 15 - 25
      const xpAdd = Math.floor(Math.random() * (25 - 15 + 1) + 15);

      await new Level({
        _id: mongoose.Types.ObjectId(),
        idJoined: `${interaction.guild.id}-${user.id}`,
        userId: user.id,
        guildId: interaction.guild.id,
        xp: xpAdd,
        level: 0,
        country: null,
        image: null
      }).save();

      score = await Level.findOne({ idJoined: `${interaction.guild.id}-${user.id}` });
    }

    let levelImg;
    if (score.image) {
      await fetch(score.image).then((res) => {
        if (res.ok) {
          levelImg = score.image;
        } else {
          levelImg = './Storage/Canvas/Images/level.png';
        }
      });
    } else {
      levelImg = './Storage/Canvas/Images/level.png';
    }

    let level;
    let points;
    let levelNoMinus;
    let nxtLvlXp;
    let currentxpLvl;
    let currentLvl;
    let toLevel;
    let inLevel;
    let xpLevel;
    let xpPercent;
    if (!score) {
      level = '0';
      points = '0';
      toLevel = '100';
      inLevel = '0';
      xpLevel = '0/100 XP';
      xpPercent = 0;
    } else {
      level = score.level;
      points = score.xp;
      levelNoMinus = score.level + 1;
      currentLvl = score.level;
      nxtLvlXp = (5 / 6) * levelNoMinus * (2 * levelNoMinus * levelNoMinus + 27 * levelNoMinus + 91);
      currentxpLvl = (5 / 6) * currentLvl * (2 * currentLvl * currentLvl + 27 * currentLvl + 91);
      toLevel = Math.floor(nxtLvlXp - currentxpLvl);
      inLevel = Math.floor(points - currentxpLvl);
      xpLevel = `${abbreviate(inLevel, 2)}/${abbreviate(toLevel, 2)} XP`;
      xpPercent = (inLevel / toLevel) * 100;
    }

    const getRank = await Level.find({ guildId: interaction.guild.id }).sort({ xp: -1 });
    const filterRank = getRank.find((b) => b.idJoined === `${interaction.guild.id}-${interaction.user.id}`);
    const rankPos = converter.toOrdinal(getRank.indexOf(filterRank) + 1);

    const canvas = Canvas.createCanvas(934, 282);
    const ctx = canvas.getContext('2d');

    // Presence colors
    let userStatusColor;

    const fetchUser = await interaction.guild.members.fetch(user.id);

    if (!fetchUser.presence) {
      userStatusColor = '#737F8D';
    } else if (fetchUser.presence.status === 'online') {
      userStatusColor = '#43B581';
    } else if (fetchUser.presence.status === 'idle') {
      userStatusColor = '#FAA61A';
    } else if (fetchUser.presence.status === 'dnd') {
      userStatusColor = '#F04747';
    } else if (fetchUser.presence.status === 'offline') {
      userStatusColor = '#737F8D';
    }
    const background = await Canvas.loadImage(levelImg);

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, 934, 282);
    ctx.save();

    // Function to create rounded rectangles
    function roundRect(x, y, w, h, radius) {
      ctx.save();
      const r = x + w;
      const b = y + h;
      ctx.beginPath();
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = 'black';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = '0.75';
      ctx.moveTo(x + radius, y);
      ctx.lineTo(r - radius, y);
      ctx.quadraticCurveTo(r, y, r, y + radius);
      ctx.lineTo(r, y + h - radius);
      ctx.quadraticCurveTo(r, b, r - radius, b);
      ctx.lineTo(x + radius, b);
      ctx.quadraticCurveTo(x, b, x, b - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.restore();
    }

    // rectangle around rank and level
    roundRect(511.5, 48.6, 376, 59, 10);

    // rectangle around username and xp
    roundRect(259.8, 133, 628.4, 42, 10);

    // reactangle around progress bar
    roundRect(259.8, 182.62, 628.4, 36.5, 20);

    // Levels / Ranks
    const levelNumber = level;
    const levelText = 'LEVEL';
    const rankNumber = `#${rankPos}`;
    const rankText = 'RANK';
    const usergrab = user.user.username;
    const discrim = `#${user.user.discriminator}`;
    const avatarGrab = user.displayAvatarURL({ extension: 'png' });

    class ProgressBar {
      constructor(dimension, color, percentage) {
        this.dim = dimension;
        this.color = color;
        this.percentage = percentage / 100;
      }

      draw() {
        const p = this.percentage * this.dim.width;
        ctx.fillStyle = this.color;

        if (p <= this.dim.height) {
          // draw left arc
          ctx.beginPath();
          ctx.arc(
            this.dim.height / 2 + this.dim.x,
            this.dim.height / 2 + this.dim.y,
            this.dim.height / 2,
            Math.PI - Math.acos((this.dim.height - p) / this.dim.height),
            Math.PI + Math.acos((this.dim.height - p) / this.dim.height)
          );
          ctx.save();

          // draw right arc
          ctx.scale(-1, 1);
          ctx.arc(
            this.dim.height / 2 - p - this.dim.x,
            this.dim.height / 2 + this.dim.y,
            this.dim.height / 2,
            Math.PI - Math.acos((this.dim.height - p) / this.dim.height),
            Math.PI + Math.acos((this.dim.height - p) / this.dim.height)
          );
          ctx.restore();
          ctx.closePath();
        } else {
          // draw left arc
          ctx.beginPath();
          ctx.arc(this.dim.height / 2 + this.dim.x, this.dim.height / 2 + this.dim.y, this.dim.height / 2, Math.PI / 2, (3 / 2) * Math.PI);

          // draw rectangle
          ctx.lineTo(p - this.dim.height + this.dim.x, 0 + this.dim.y);

          // draw right arc
          ctx.arc(p - this.dim.height / 2 + this.dim.x, this.dim.height / 2 + this.dim.y, this.dim.height / 2, (3 / 2) * Math.PI, Math.PI / 2);

          // close path
          ctx.lineTo(this.dim.height / 2 + this.dim.x, this.dim.height + this.dim.y);
          ctx.closePath();
        }

        ctx.fill();
      }
    }

    const progressbar = new ProgressBar(
      {
        x: 259.8,
        y: 182.62,
        width: 628.4,
        height: 36.5
      },
      colorGrab,
      xpPercent
    );
    progressbar.draw();

    // Draw XP
    function drawXP(x, y, xp) {
      ctx.font = '22px Shapirit';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'right';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 0.25;
      ctx.fillText(xp, x, y);
      ctx.strokeText(xp, x, y);
      ctx.save();
    }
    drawXP(880, 165.4, xpLevel);

    function drawEmote(x, y, img) {
      ctx.drawImage(img, x, y, 50, 50);
    }

    if (score && score.country) {
      // it broke:
      score.country = score.country.replace('twemoji.maxcdn.com/v/latest/', 'cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/');

      try {
        const img = await Canvas.loadImage(score.country);
        // Draw Contry Emoji
        drawEmote(450, 54.3, img);
      } catch {
        // do nothing
      }
    }

    // Draw Percentage
    function drawPercent(x, y, input) {
      ctx.font = '34px Shapirit';
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 0.5;
      ctx.fillText(input, x, y);
      ctx.strokeText(input, x, y);
    }

    drawPercent(570, 212, `${xpPercent.toFixed(1)}%`);

    // Draw level
    function drawLevel(x, y, txt, num, style) {
      ctx.font = '48px Shapirit';
      ctx.fillStyle = style;
      ctx.textAlign = 'right';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 0.5;
      ctx.fillText(num, x, y);
      ctx.strokeText(num, x, y);
      const w = ctx.measureText(num).width;

      ctx.font = '22px Shapirit';
      ctx.fillStyle = style;
      ctx.textAlign = 'right';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 0.25;
      ctx.fillText(txt, x - w - 4, y);
      ctx.strokeText(txt, x - w - 4, y);
      ctx.save();
    }

    drawLevel(880, 96.8, levelText, levelNumber, '#FF1700');

    // Draw rank
    ctx.font = '22px Shapirit';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 0.25;
    ctx.fillText(rankText, 522.5, 96.8);
    ctx.strokeText(rankText, 522.5, 96.8);

    ctx.font = '48px Shapirit';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 0.5;
    ctx.fillText(rankNumber, 522.5 + 64.5, 96.8);
    ctx.strokeText(rankNumber, 522.5 + 64.5, 96.8);
    ctx.save();

    // Draw Username
    function drawUsername(x, y, max, use, dis) {
      ctx.font = '34px Shapirit';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 0.5;
      while (ctx.measureText(use).width > max) {
        use = use.substring(0, use.length - 1);
      }
      ctx.fillText(use, x, y);
      ctx.strokeText(use, x, y);
      const w = ctx.measureText(use).width;

      ctx.font = '22px Shapirit';
      ctx.fillStyle = '#7F8384';
      ctx.textAlign = 'left';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 0.25;
      ctx.fillText(dis, x + w + 4, y);
      ctx.strokeText(dis, x + w + 4, y);
      ctx.save();
    }

    drawUsername(270, 165.4, 364, usergrab, discrim);

    // circle around avatar
    ctx.beginPath();
    ctx.arc(122.5, 141.8, 81, 0, Math.PI * 2, true);
    ctx.strokeStyle = colorGrab;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.save();
    ctx.closePath();
    ctx.clip();
    const avatar = await Canvas.loadImage(avatarGrab);
    ctx.strokeStyle = colorGrab;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(avatar, 41.5, 60.5, 162, 162);

    // presence circle
    ctx.restore();
    ctx.beginPath();
    ctx.arc(184.5, 193.5, 19, 0, Math.PI * 2, true);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillStyle = userStatusColor;
    ctx.fill();
    ctx.save();

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'level.jpg' });
    interaction.editReply({ files: [attachment] }).catch((err) => console.error(err));
  }
};

export default SlashCommandF;
