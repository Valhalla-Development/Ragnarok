/* jshint -W069 */
const { MessageEmbed } = require("discord.js");
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const { stripIndents } = require("common-tags");
const fortnite = require("simple-fortnite-api"),
    client = new fortnite("d973f882-c449-4f8d-b2b5-07bf34ec1292");

module.exports = {
    config: {
        name: "fortnite",
        usage: "<user> <gametype>",
        category: "miscellaneous",
        description: "Displays a user's fortnite stats!",
        accessableby: "Everyone",
    },
    run: async (bot, message, args) => {
        const prefixgrab = db
            .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
            .get(message.guild.id);
        const prefix = prefixgrab.prefix;

        const language = require('../../storage/messages.json');

        const incorrectUsageMessage = language['fortnite'].incorrectUsage;
        const incorrectUsage = incorrectUsageMessage.replace('${prefix}', prefix);

        const noUser = new MessageEmbed()
            .setColor('36393E')
            .setDescription('Unable to find a user with that username!');
            
        if (!args[0]) return message.channel.send(incorrectUsage);

        if (args[1] && !["lifetime", "solo", "duo", "squad"].includes(args[1])) return message.channel.send(incorrectUsage);

        let gametype = args[1] ? args[1].toLowerCase() : "lifetime";

        let data = await client.find(args[0]);
        if (data && data.code === 404) return message.channel.send(noUser);
        const {
            image,
            url,
            username
        } = data;
        const {
            scorePerMin,
            winPercent,
            kills,
            score,
            wins,
            kd,
            matches
        } = data[gametype];

        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setAuthor(`${username}`, image)
            .setThumbnail(image)
            .setDescription(stripIndents `**Gamemode:** ${gametype.slice(0, 1).toUpperCase() + gametype.slice(1)}
                    **Kills:** ${kills || 0}
                    **Score:** ${score || 0}
                    **Score Per Min:** ${scorePerMin || 0}
                    **Wins:** ${wins || 0}
                    **Win Ratio:** ${winPercent || "0%"}
                    **Kill/Death Ratio:** ${kd || 0}
                    **Matches Played:** ${matches || 0}
                    **Link:** [Link to profile](${url})`);

        message.channel.send(embed);
    }
};