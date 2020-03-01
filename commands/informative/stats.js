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

        console.time();
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

        const msg = await message.channel.send('Generating...');
        message.channel.startTyping();
        let ping = Math.round(bot.ws.ping);
        const memory = await si.mem();
        const totalMemory = Math.floor(memory.total / 1024 / 1024);
        const swapMem = Math.floor(memory.swapused / 1024 / 1024);
        const cachedMem = Math.floor(memory.cached / 1024 / 1024);
        const memoryUsed = Math.floor(memory.used / 1024 / 1024);
        let realMemUsed = Math.floor(cachedMem - swapMem + memoryUsed);
        let memPercent = Math.floor(realMemUsed / totalMemory * 100);
        await si.currentLoad().then(data => cpuUsage = Math.floor(data.currentload_user));
        await si.osInfo().then(data => osVersion = data.distro);
        await si.versions().then(data => nodeVersion = data.node);

        msg.delete();
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
                value: `${(bot.users.cache.size).toLocaleString('en')}`,
                inline: true
            }, {
                name: 'Versions',
                value: `OS: ${osVersion}\nNode.js: ${nodeVersion}\nDiscord.js: v12`,
                inline: true
            }, {
                name: 'Guilds',
                value: `${(bot.guilds.cache.size).toLocaleString('en')}`,
                inline: true
            }, {
                name: 'Announcements',
                value: '```Port to Discord.js v12 is complete, if you find any bugs please report them to my owner.```',
            });
        message.channel.send(serverembed);
        message.channel.stopTyping();
        // currently takes 6 seconds to send the embed, no idea how to fix lmao
        console.timeEnd();

    },
};