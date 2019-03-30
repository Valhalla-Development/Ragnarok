const { RichEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/db/db.sqlite');
const fs = require("fs");
const config = JSON.parse(
    fs.readFileSync("./Storage/config.json", "utf8")
);
let alphaEmoji = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿'];

module.exports.run = (client, message, args) => {
    message.delete();
    if((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID))) {
        let errEmbed = new RichEmbed()
            .setColor('#ff4757')
            .setDescription('\:x: You do not have permission to run this command.');

        message.channel.send(errEmbed);
    } else {
        const foundRoleMenu = db.prepare(`SELECT * FROM rolemenu WHERE guildid=${message.guild.id}`).get();
        if (!foundRoleMenu || JSON.parse(foundRoleMenu.roleList).length <= 0) {
            let errEmbed = new RichEmbed()
                .setColor('#ff4757')
                .setDescription('\:x: The roles for the menu have not been set yet. Please try again later.');

            message.channel.send(errEmbed);
        } else {
            let roleArray = JSON.parse(foundRoleMenu.roleList);
            let embedRoleList = '';

            for (i = 0; i < roleArray.length; i++) {
                embedRoleList += `${alphaEmoji[i]} - <@&${roleArray[i]}>\n\n`;
            }

            const roleMenuEmbed = new RichEmbed()
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
};
module.exports.help = {
    name: "rolemenu"
  };