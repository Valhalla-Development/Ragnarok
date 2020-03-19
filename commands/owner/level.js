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
const { ownerID } = require('../../storage/config.json');


module.exports = {
  config: {
    name: 'level',
    usage: '${prefix}level',
    category: 'owner',
    description: 'Displays current level',
    accessableby: 'Owner',
    aliases: ['rank'],
  },
  run: async (bot, message) => {
    if (message.author.id !== ownerID) return;

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
    let difference;
    let levelNoMinus;
    let nxtLvlXp;
    let currentxpLvl;
    let currentLvl;
    let toLevel;
    let inlevel;
    if (!score) {
      level = '0';
      points = '0';
      difference = '100';
    } else {
      level = score.level;
      points = score.points;
      levelNoMinus = score.level + 1;
      currentLvl = score.level;
      nxtLvlXp = (5 / 6 * levelNoMinus * (2 * levelNoMinus * levelNoMinus + 27 * levelNoMinus + 91));
      difference = nxtLvlXp - points;
      currentxpLvl = (5 / 6 * currentLvl * (2 * currentLvl * currentLvl + 27 * currentLvl + 91));
      toLevel = nxtLvlXp - currentxpLvl;
      inlevel = points - currentxpLvl;
    }

    const userRank = db.prepare('SELECT count(*) FROM scores WHERE points >= ? AND guild = ? AND user ORDER BY points DESC').all(points, message.guild.id);
    const canvas = Canvas.createCanvas(934, 282);
    const ctx = canvas.getContext('2d');

    // Presence colors
    // this only has presence of author idiot not user
    let userStatusColor;
    if (message.author.presence.status === 'online') {
      userStatusColor = '#43B581';
    } else if (message.author.presence.status === 'idle') {
      userStatusColor = '#FAA61A';
    } else if (message.author.presence.status === 'dnd') {
      userStatusColor = '#F04747';
    } else if (message.author.presence.status === 'offline') {
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
    let usergrab;
    let discrim;
    let avatarGrab;
    if (user) {
      // idiot user is defined as mention OR not mention boi you fucktard
      usergrab = user.username;
      discrim = `#${user.discriminator}`;
      avatarGrab = user.displayAvatarURL({ format: 'png' });
    } else {
      usergrab = message.author.username;
      discrim = `#${message.author.discriminator}`;
      avatarGrab = message.author.displayAvatarURL({ format: 'png' });
    }
    const xplevel = `${abbreviate(inlevel, 2)}/${abbreviate(toLevel, 2)} XP`;
    const xpPercent = await difference / nxtLvlXp * 100;
    // difference is wrong so this code is wrong. difference currently says how much xp needed until next level, not how much you have in current level

    // Progress Bar

    const rectX = 259;
    const rectY = 182;
    // there is a minimum thickness, if it's 0 it does not dissapear causing it to instead go the other way :()
    const rectWidth = 630 * xpPercent / 100;
    const rectHeight = 38;
    const cornerRadius = 37;

    ctx.lineJoin = 'round';
    ctx.lineWidth = cornerRadius;
    ctx.strokeStyle = '#FF1700';
    ctx.fillStyle = '#FF1700';

    ctx.strokeRect(rectX + (cornerRadius / 2), rectY + (cornerRadius / 2), rectWidth - cornerRadius, rectHeight - cornerRadius);
    ctx.fillRect(rectX + (cornerRadius / 2), rectY + (cornerRadius / 2), rectWidth - cornerRadius, rectHeight - cornerRadius);
    ctx.save();

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
