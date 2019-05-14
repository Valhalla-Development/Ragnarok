const {
    MessageEmbed
} = require("discord.js");
const {
    ownerID
} = require('../../storage/config.json');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
let alphaEmoji = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿'];

module.exports = {
    config: {
        name: "rolemenu",
        usage: "${prefix}rolemenu",
        category: "moderation",
        description: "Displays the rolemenu",
        accessableby: "Staff"
    },
    run: async (bot, message, args, color) => {

        message.delete();
        if ((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== ownerID))) {
            let errEmbed = new MessageEmbed()
                .setColor('#ff4757')
                .setDescription('\:x: You do not have permission to run this command.');

            message.channel.send(errEmbed);
        } else {
            const foundRoleMenu = db.prepare(`SELECT * FROM rolemenu WHERE guildid=${message.guild.id}`).get();
            if (!foundRoleMenu || JSON.parse(foundRoleMenu.roleList).length <= 0) {
                let errEmbed = new MessageEmbed()
                    .setColor('#ff4757')
                    .setDescription('\:x: The roles for the menu have not been set yet. Please try again later.');

                message.channel.send(errEmbed);
            } else {
                let roleArray = JSON.parse(foundRoleMenu.roleList);
                let embedRoleList = '';

                for (i = 0; i < roleArray.length; i++) {
                    embedRoleList += `${alphaEmoji[i]} - <@&${roleArray[i]}>\n\n`;
                }

                const roleMenuEmbed = new MessageEmbed()
                    .setColor('#ff6b6b')
                    .setTitle('Assign a Role')
                    .setDescription(`React below to assign one of the following roles:\n\n${embedRoleList}`);

                message.channel.send(roleMenuEmbed).then(async reactEmbed => {
                    db.prepare(`UPDATE rolemenu SET activeRoleMenuID = ${reactEmbed.id} WHERE guildid = ${message.guild.id}`).run();
                    for (i = 0; i < roleArray.length; i++) {
                        await reactEmbed.react(alphaEmoji[i]);
                    }
                });
            }
        }
    }
};