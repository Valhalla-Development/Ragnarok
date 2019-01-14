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
                db.prepare("DELETE FROM logging WHERE guildid = ?").run(message.guild.id);
                return;
            };
        } else if (!lchan) {
            message.channel.send(`${language["logging"].invalidChannel}`);
            return;
        } else if (lchan.type === "voice" || lchan.type === "category") {
            message.channel.send(`${language["logging"].invalidTextChannel}`);
            return;
        } else if (!status) {
            const insert = db.prepare("INSERT INTO logging (guildid, channel) VALUES (@guildid, @channel);");
            insert.run({
                guildid: `${message.guild.id}`,
                channel: `${lchan.id}`
            });
            message.channel.send(`:white_check_mark: | **Logging set to ${lchan}**`);
            return;
        } else {
            const update = db.prepare("UPDATE logging SET channel = (@channel) WHERE guildid = (@guildid);");
            update.run({
                guildid: `${message.guild.id}`,
                channel: `${lchan.id}`
            });
            message.channel.send(`:white_check_mark: | ** Logging updated to ${lchan}**`);
            return;
        };
    };
};
        
module.exports.help = {
    name: "logging"
};