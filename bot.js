/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-return-assign */
const { Client, Collection } = require('discord.js');
const bot = new Client();
const Canvas = require('canvas');
const { token, logging } = require('./storage/config.json');
Canvas.registerFont('./storage/canvas/fonts/Notethis.ttf', {
  family: 'Note',
});

['aliases', 'commands'].forEach((x) => (bot[x] = new Collection()));
['console', 'command', 'event'].forEach((x) => require(`./handlers/${x}`)(bot));

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

/* bot.on('debug', (info) => { // Debug event, only for testing!
  console.log(`debug -> ${info}`);
}); */

process.on('unhandledRejection', (error) => {
  if (bot.user.id === '508756879564865539') {
    bot.channels.cache.get('685973401772621843').send(`${error.stack}`, { code: 'js' });
  }
  console.error(`Error: \n${error.stack}`);
});

bot.login(token);
