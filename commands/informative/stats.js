const { MessageEmbed } = require('discord.js');
const si = require('systeminformation');

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
            let d, h, m, s;
            s = Math.floor(ms / 1000);
            m = Math.floor(s / 60);
            s = s % 60;
            h = Math.floor(m / 60);
            m = m % 60;
            d = Math.floor(h / 24);
            h = h % 24;
            return {
                d: d,
                h: h,
                m: m,
                s: s,
            };
        }

        const u = convertMS(bot.uptime);
        const uptime =
            u.d +
            ' days, ' +
            u.h +
            ' hours, ' +
            u.m +
            ' minutes, ' +
            u.s +
            ' seconds';

        let ping = Math.round(bot.ws.ping);
        si.mem().then(data => totalMemory  = Math.floor(data.total / 1024 / 1024));
        si.mem().then(data => swapMem = Math.floor(data.swapused / 1024 / 1024));
        si.mem().then(data => cachedMem = Math.floor(data.cached / 1024 / 1024));
        si.mem().then(data => memoryUsed = Math.floor(data.used / 1024 / 1024));
        let realMemUsed = Math.floor(memoryUsed - cachedMem - swapMem);
        let memPercent = Math.floor(realMemUsed / totalMemory * 100);
        si.currentLoad().then(data => cpuUsage = Math.floor(data.currentload_user));
        si.osInfo().then(data => osVersion = data.distro);
        si.versions().then(data => nodeVersion = data.node);

            const serverembed = new MessageEmbed()
                .setAuthor('Ragnarok Info', bot.user.avatarURL())
                .setFooter(`Bot Created • November 4, 2018`)
                .setColor('#7289DA')
                .setThumbnail(bot.user.avatarURL())
                .addFields({
                    name: 'Owner',
                    value: 'Ragnar Lothbrok#1948',
                    inline: true
                }, {
                    name: 'Uptime',
                    value: uptime
                }, {
                    name: 'Memory Usage',
                    value: `${realMemUsed} / ${totalMemory} - ${memPercent}%`,
                    inline: true
                }, {
                    name: 'CPU Usage',
                    value: `${cpuUsage}%`,
                    inline: true
                }, {
                    name: 'Ping',
                    value: `${ping}ms`,
                    inline: true
                }, {
                    name: 'Users',
                    value: bot.users.cache.size,
                    inline: true
                }, {
                    name: 'Versions',
                    value: `OS: ${osVersion}\nNode.js: ${nodeVersion}\nDiscord.js: v12`,
                    inline: true
                }, {
                    name: 'Guilds',
                    value: bot.guilds.cache.size,
                    inline: true
                }, {
                    name: 'Announcements',
                    value: '```Port to Discord.js v12 is complete, if you find any bugs please report them to my owner.```',
                });
            message.channel.send(serverembed);
    },
};