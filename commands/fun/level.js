/* eslint-disable no-undef */
/* eslint-disable no-mixed-operators */
const { MessageAttachment } = require('discord.js');
const abbreviate = require('number-abbreviate');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const Canvas = require('canvas');
Canvas.registerFont('./storage/canvas/fonts/Shapirit.otf', {
  family: 'Shapirit',
});


module.exports = {
  config: {
    name: 'level',
    usage: '${prefix}level',
    category: 'fun',
    description: 'Displays current level',
    accessableby: 'Everyone',
    aliases: ['rank'],
  },
  run: async (bot, message) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    bot.getScore = db.prepare(
      'SELECT * FROM scores WHERE user = ? AND guild = ?',
    );
    bot.setScore = db.prepare(
      'INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);',
    );

    const user = message.mentions.users.first() || message.author;
    if (user.bot) return;

    let score;
    if (message.guild) {
      score = bot.getScore.get(user.id, message.guild.id);
    }
    let level;
    let points;
    let levelNoMinus;
    let nxtLvlXp;
    let currentxpLvl;
    let currentLvl;
    let toLevel;
    let inlevel;
    let xplevel;
    if (!score) {
      level = '0';
      points = '0';
      toLevel = '100';
      inLevel = '0';
      xplevel = '0/100 XP';
    } else {
      level = score.level;
      points = score.points;
      levelNoMinus = score.level + 1;
      currentLvl = score.level;
      nxtLvlXp = (5 / 6 * levelNoMinus * (2 * levelNoMinus * levelNoMinus + 27 * levelNoMinus + 91));
      currentxpLvl = (5 / 6 * currentLvl * (2 * currentLvl * currentLvl + 27 * currentLvl + 91));
      toLevel = Math.floor(nxtLvlXp - currentxpLvl);
      inlevel = Math.floor(points - currentxpLvl);
      xplevel = `${abbreviate(inlevel, 2)}/${abbreviate(toLevel, 2)} XP`;
    }

    const userRank = db.prepare('SELECT count(*) FROM scores WHERE points >= ? AND guild = ? AND user ORDER BY points DESC').all(points, message.guild.id);
    const canvas = Canvas.createCanvas(934, 282);
    const ctx = canvas.getContext('2d');

    // Presence colors
    let userStatusColor;
    if (user.presence.status === 'online') {
      userStatusColor = '#43B581';
    } else if (user.presence.status === 'idle') {
      userStatusColor = '#FAA61A';
    } else if (user.presence.status === 'dnd') {
      userStatusColor = '#F04747';
    } else if (user.presence.status === 'offline') {
      userStatusColor = '#737F8D';
    }
    const background = await Canvas.loadImage(
      './storage/canvas/images/level.png',
    );

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Levels / Ranks
    const levelNumber = level;
    const levelText = 'LEVEL';
    const rankNumber = `#${userRank[0]['count(*)']}`;
    const rankText = 'RANK';
    const usergrab = user.username;
    const discrim = `#${user.discriminator}`;
    const avatarGrab = user.displayAvatarURL({ format: 'png' });

    const xpPercent = inlevel / toLevel * 100;

    function drawProgress(x, y, length) {
      const cornerRadius = 37;
      let innerLength = length - cornerRadius * 2;

      if (innerLength < 0) innerLength = 0;

      let actualCornerRadius = cornerRadius;
      if (length < cornerRadius * 2) {
        actualCornerRadius = length / 2;
      }

      ctx.lineCap = 'round';
      ctx.lineWidth = actualCornerRadius;
      ctx.strokeStyle = '#FF1700';

      const leftX = x + actualCornerRadius / 2;
      const rightX = leftX + innerLength;

      ctx.beginPath();
      ctx.moveTo(leftX, y);
      ctx.lineTo(rightX, y);
      ctx.stroke();
    }

    drawProgress(259.4, 201, 666.4 * xpPercent / 100);

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
    drawXP(880, 165.4, xplevel);

    // Draw level
    function drawLevel(x, y, txt, num, style) {
      ctx.font = '48px Shapirit';
      ctx.fillStyle = style;
      ctx.textAlign = 'right';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 0.5;
      ctx.fillText(num, x, y);
      ctx.strokeText(num, x, y);
      w = ctx.measureText(num).width;

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
      w = ctx.measureText(use).width;

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
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.save();
    ctx.closePath();
    ctx.clip();
    const avatar = await Canvas.loadImage(
      avatarGrab,
    );
    ctx.strokeStyle = '#ffffff';
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

    const attachment = await new MessageAttachment(canvas.toBuffer(), 'level.jpg');
    message.channel.send(attachment).catch((err) => console.log(err));
  },
};
