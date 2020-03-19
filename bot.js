/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-return-assign */
const { Client, Collection, MessageAttachment } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const bot = new Client();
const Canvas = require('canvas');
const { token, logging } = require('./storage/config.json');
Canvas.registerFont('./storage/canvas/fonts/Notethis.ttf', {
  family: 'Note',
});

['aliases', 'commands'].forEach((x) => (bot[x] = new Collection()));
['console', 'command', 'event'].forEach((x) => require(`./handlers/${x}`)(bot));

// welcome
bot.on('guildMemberAdd', async (member) => {
  const setwelcome = db
    .prepare(`SELECT * FROM setwelcome WHERE guildid = ${member.guild.id};`)
    .get();
  if (!setwelcome) {
    return;
  }

  const sendchannel = setwelcome.channel;
  const chnsen = member.guild.channels.cache.find(
    (channel) => channel.id === sendchannel,
  );
  if (!chnsen) {
    db.prepare('DELETE FROM setwelcome WHERE guildid = ?').run(
      member.guild.id,
    );
    return;
  }

  const canvas = Canvas.createCanvas(700, 300);
  const ctx = canvas.getContext('2d');

  const background = await Canvas.loadImage(
    './storage/canvas/images/welcome.jpg',
  );

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.font = '42px Note';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('Welcome to the server', canvas.width / 2, 45);

  ctx.font = '42px Note';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`${member.user.username}`, canvas.width / 2, 280);

  ctx.beginPath();
  ctx.arc(350, 150, 85, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const avatar = await Canvas.loadImage(
    member.user.displayAvatarURL({ format: 'png' }),
  );
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(avatar, 257.5, 57.5, 180, 180);

  const attachment = new MessageAttachment(canvas.toBuffer(), 'welcome.jpg');

  bot.channels.cache.get(sendchannel).send(`Welcome, ${member}!`, attachment).catch((err) => console.log(err));
});

// autorole
bot.on('guildMemberAdd', (member) => {
  const autoroletable = db
    .prepare(`SELECT role FROM autorole WHERE guildid = ${member.guild.id};`)
    .get();
  if (!autoroletable) return;
  const autorole = autoroletable.role;
  if (!autorole) {
    return;
  }
  const myRole = member.guild.roles.cache.find((role) => role.name === autorole);
  member.roles.add(myRole);
});

if (process.version.slice(1).split('.')[0] < 12) {
  console.log(
    new Error(
      '[Ragnarok] You must have NodeJS 12 or higher installed on your PC.',
    ),
  );
  process.exit(1);
}

if (logging !== true && logging !== false) {
  console.log(
    new TypeError('[Ragnarok] The \'logging\' value must be true or false.'),
  );
  process.exit(1);
}

if (logging === true) {
  console.log(
    '[Ragnarok] Logging enabled! When someone executes a command, I will log that here.',
  );
}

// error notifiers
bot.on('error', (e) => {
  console.error(e);
});

bot.on('warn', (e) => {
  console.warn(e);
});

process.on('unhandledRejection', (error) => {
  bot.channels.cache.get('685973401772621843').send(`${error.stack}`, { code: 'js' });
  console.error(`Error: \n${error.stack}`);
});

bot.login(token);
