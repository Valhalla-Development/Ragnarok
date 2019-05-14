const {
    MessageEmbed
} = require('discord.js');
const {
    ownerID
} = require('../../storage/config.json');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
    config: {
        name: "poll",
        usage: "${prefix}poll <question>",
        category: "informative",
        description: "Mutes a user in the guild",
        accessableby: "Staff"
    },
    run: async (bot, message, args, color) => {
        const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);
        const prefix = prefixgrab.prefix;

        let language = require('../../storage/messages.json');

        if ((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== ownerID))) {
            message.channel.send(`${language.poll.noPermission}`);
            return;
        }

        // Check for input
        if (!args[0]) {
            let incorrectUsageMessage = language.poll.incorrectUsage;
            const incorrectUsage = incorrectUsageMessage.replace(
                "${prefix}",
                prefix
            );

            message.channel.send(`${incorrectUsage}`);
            return;
        }

        // Create Embed
        const embed = new MessageEmbed()
            .setColor("#ffffff") //To change color do .setcolor("#fffff")
            .setFooter("React to Vote.")
            .setDescription(args.join(" "))
            .setTitle(`Poll Created By ${message.author.username}`);

        let msg = await message.channel
            .send(embed)
            .then(function (msg) {
                msg.react("✅");
                msg.react("❌"); // You can only add two reacts
                message.delete({
                    timeout: 1000
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    }
};