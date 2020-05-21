/* eslint-disable prefer-const */
const { MessageEmbed } = require('discord.js');
const si = require('systeminformation');
const { version } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
  config: {
    name: 'stats',
    usage: '${prefix}stats',
    category: 'informative',
    description: 'Displays stats about the bot',
    accessableby: 'Everyone',
  },
  run: async (bot, message) => {
    function convertMS(ms) {
      let d; let h; let m; let
        s;
      s = Math.floor(ms / 1000);
      m = Math.floor(s / 60);
      s %= 60;
      h = Math.floor(m / 60);
      m %= 60;
      d = Math.floor(h / 24);
      h %= 24;
      return {
        d,
        h,
        m,
        s,
      };
    }

    const u = convertMS(bot.uptime);
    const uptime = `${u.d
    } days, ${
      u.h
    } hours, ${
      u.m
    } minutes, ${
      u.s
    } seconds`;

    const dbGrab = db.prepare('SELECT msg FROM announcement').get();
    const dbMessage = dbGrab.msg;
    const msg = await message.channel.send('Generating...');
    message.channel.startTyping();
    const ping = Math.round(bot.ws.ping);
    const memory = await si.mem();
    const totalMemory = Math.floor(memory.total / 1024 / 1024);
    const cachedMem = Math.floor(memory.buffcache / 1024 / 1024);
    const memoryUsed = Math.floor(memory.used / 1024 / 1024);
    const realMemUsed = Math.floor(memoryUsed - cachedMem);
    const memPercent = Math.floor((realMemUsed / totalMemory) * 100);
    const load = await si.currentLoad();
    const cpuUsage = Math.floor(load.currentload_user);
    const os = await si.osInfo();
    const osVersion = os.distro;
    const vers = await si.versions();
    const nodeVersion = vers.node;

    msg.delete();
    const serverembed = new MessageEmbed()
      .setAuthor('Ragnarok Info', bot.user.avatarURL())
      .setFooter('Bot Created • November 4, 2018')
      .setColor('36393F')
      .setThumbnail(bot.user.avatarURL())
      .addFields({
        name: 'Owner',
        value: 'Ragnar Lothbrok#1948',
        inline: true,
      }, {
        name: 'Uptime',
        value: uptime,
      }, {
        name: 'Memory Usage',
        value: `${realMemUsed} / ${totalMemory} - ${memPercent}%`,
        inline: true,
      }, {
        name: 'CPU Usage',
        value: `${cpuUsage}%`,
        inline: true,
      }, {
        name: 'Ping',
        value: `${ping}ms`,
        inline: true,
      }, {
        name: 'Users',
        value: `${(bot.users.cache.size).toLocaleString('en')}`,
        inline: true,
      }, {
        name: 'Versions',
        value: `OS: ${osVersion}\nNode.js: ${nodeVersion}\nDiscord.js: ${version}`,
        inline: true,
      }, {
        name: 'Guilds',
        value: `${(bot.guilds.cache.size).toLocaleString('en')}`,
        inline: true,
      }, {
        name: 'Announcements',
        value: `\`\`\`${dbMessage}\`\`\``,
      });
    message.channel.send(serverembed);
    message.channel.stopTyping();
  },
};
