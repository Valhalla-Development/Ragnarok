const Discord = require("discord.js");
const SQLite = require('better-sqlite3')
const db = new SQLite('./Storage/db/db.sqlite');
const client = new Discord.Client();
const fs = require("fs");
const config = JSON.parse(
  fs.readFileSync("./Storage/config.json", "utf8")
);

module.exports.run = async (client, message, args, color) => {
    let language = require(`../messages/messages_en-US.json`);

    if ((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID)))
        return message.channel.send(`${language["logging"].noPermission}`);

    client.getTable = db.prepare("SELECT * FROM logging WHERE guildid = ?");

    const lchan = message.mentions.channels.first();

    let status;
    if (message.guild.id) {
        status = client.getTable.get(message.guild.id);
        
  
    if (args[0] === 'off') { // to turn logging off
            if (!status) {
                message.channel.send(":x: | **Logging is already disabled!**");
                return;
            } else {
                message.channel.send(":white_check_mark: | **Logging disabled!**");
                db.prepare(`DELETE FROM logging WHERE guildid='${message.guild.id}'`).run();
                return;
            };
        } else if (!lchan) {
            message.channel.send(`${language["logging"].invalidChannel}`);
            return;
        } else if (lchan.type === "voice" || lchan.type === "category") {
            message.channel.send(`${language["logging"].invalidTextChannel}`);
            return;
        } else if (!status) {
            db.prepare(`INSERT INTO logging (guildid, channel) VALUES ('${message.guild.id}', '${lchan.id}');`).run();
            message.channel.send(`:white_check_mark: | **Logging set to ${lchan}**`);
            return;
        } else {
            db.prepare(`UPDATE logging SET channel='${lchan.id}' WHERE guildid='${message.guild.id}';`).run();
            message.channel.send(`:white_check_mark: | ** Logging updated to ${lchan}**`);
            return;
        };
    };
};
        
module.exports.help = {
    name: "logging"
};

//  const logembed = new Discord.RichEmbed()
//    .setAuthor(user.tag, message.author.displayAvatarURL)
//    .setDescription(`**Message sent by <@${message.author.id}> deleted in <#${message.channel.id}>** \n ${message.content}`)
//    .setColor(message.guild.member(client.user).displayHexColor)
//    .setFooter(`ID: ${message.channel.id}`)
//    .setTimestamp()
//  logchannel.send(logembed);


//    if (args[0] === 'off') {
//        if (!table['count(*)']) {
//            message.channel.send(`:x: | **Logging is already turned off!**`)
//            return;
//        } else
//            db.prepare(`DELETE FROM logging WHERE guildid = @guildid`).run({
//                guildid: `${message.guild.id}`
//            });
//    } else if (!lchan) {
//        message.channel.send(`${language["logging"].invalidChannel}`);
//        return;
//    }