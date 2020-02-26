/* jshint -W069 */
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const token = "3D70ADF8179C2C89E32F56EE00954B43";
const fetch = require("node-fetch");
const { stripIndents } = require("common-tags");
const dateFormat = require("dateformat");

module.exports = {
    config: {
        name: 'steam',
        usage: '${prefix}steam <username>',
        category: 'fun',
        description: 'Fetches Steam profile for specified username',
        accessableby: 'Everyone',
    },
    run: async (bot, message, args, color) => {
        const prefixgrab = db
            .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
            .get(message.guild.id);
        const prefix = prefixgrab.prefix;

        const language = require('../../storage/messages.json');


        // if no args

        if (!args[0]) {
            const noArgumentsMessage = language['steam'].noArguments;
            const noArguments = noArgumentsMessage.replace('${prefix}', prefix);

            message.channel.send(`${noArguments}`);
            return;
        }

        const url = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${token}&vanityurl=${args.join(" ")}`;

        const noProfile = new MessageEmbed()
            .setColor('36393E')
            .setDescription('I was unable to find a steam profile with that username!');

        fetch(url).then(res => res.json()).then(body => {
            if (body.response.success === 42) return message.channel.send(noProfile);

            const id = body.response.steamid;
            const summaries = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${token}&steamids=${id}`;
            const bans = `http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${token}&steamids=${id}`;
            const state = ["Offline", "Online", "Busy", "Away", "Snooze", "Looking to trade", "Looking to Play"];

            fetch(summaries).then(res => res.json()).then(body => {
                if (!body.response) return message.channel.send(noProfile);
                const {
                    personaname,
                    avatarfull,
                    realname,
                    personastate,
                    loccountrycode,
                    profileurl,
                    timecreated
                } = body.response.players[0];

                fetch(bans).then(res => res.json()).then(body => {
                    if (!body.players) return message.channel.send(noProfile);
                    const {
                        NumberOfVACBans,
                        NumberOfGameBans
                    } = body.players[0];

                    const embed = new MessageEmbed()
                        .setColor('RANDOM')
                        .setAuthor(`${personaname}`, avatarfull)
                        .setThumbnail(avatarfull)
                        .setDescription(stripIndents `**Real Name:** ${realname || "Unknown"}
            **Status:** ${state[personastate]}
            **Country:** :flag_${loccountrycode ? loccountrycode.toLowerCase() : "white"}:
            **Account Created:** ${dateFormat(timecreated * 1000, "d/mm/yyyy (h:MM:ss TT)")}
            **Bans:** Vac: ${NumberOfVACBans}, Game: ${NumberOfGameBans}
            **Link:** [Link to profile](${profileurl})`);

                    message.channel.send(embed);
                });
            });
        });

        // perms checking

        if (!message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')) return;

    },
};