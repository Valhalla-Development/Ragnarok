/*jshint -W083 */
const {
    MessageEmbed
} = require("discord.js");
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
    config: {
        name: "help",
        aliases: ["commands"],
        usage: "${prefix}help <command>",
        category: "informative",
        description: "Shows a list of commands",
        accessableby: "Everyone"
    },
    run: async (bot, message, args, color) => {
        const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);
        const prefix = prefixgrab.prefix;

        let arr = [];
        let types = ["Moderation", "Miscellaneous", "Fun"];
        let embed = new MessageEmbed();

        if (!args[0]) {
            for (let i = 0; i < types.length; i++) {
                arr.push(bot.commands.filter(c => c.config.category == types[i].toLowerCase()).map(c => `\`${c.config.name}\``).join(" "));
                try {
                    embed.addField(types[i], arr[i]);
                } catch (e) {
                    embed.addBlankField();
                }
            }

            embed.setColor(`RANDOM`)
                .setAuthor(bot.user.username, bot.user.avatarURL)
                .setTimestamp()
                .setDescription(`Hey, I'm [**__Ragnarok__**]! A multi-purpose bot!\nRun \`${prefix}help <command>\` to see command specific instructions!\n'Administration Commands' must be preceded by \`${prefix}config\` e.g. \`${prefix}config adsprot\``)
                .setFooter(`This guild's prefix is ${prefix}`, bot.user.avatarURL);
            message.channel.send(embed);
        } else {
            let command = bot.commands.get(args[0].toLowerCase()) ? bot.commands.get(args[0].toLowerCase()).config : bot.commands.get(bot.aliases.get(args[0].toLowerCase())).config;
            let cUsagePrefix = command.usage.replace(
                "${prefix}",
                prefix
            );

            embed.setColor(`RANDOM`)
                .setAuthor(bot.user.username, bot.user.avatarURL)
                .setDescription(`The bot prefix is: ${prefix}\n\n**Command:** \`${command.name}\`\n**Description:** \`${command.description || "No Description"}\`\n**Usage:** \`${cUsagePrefix || "No Usage"}\`\n**Accessable by:** \`${command.accessableby || "Members"}\`\n**Aliases:** \`${command.aliases ? command.aliases.join(", ") : "None"}\``);
            message.channel.send(embed);
        }
    }
};