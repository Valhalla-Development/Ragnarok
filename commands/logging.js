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

    const lchan = message.mentions.channels.first();
    const table = db.prepare(`SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'logging';`).get();


    if (args[0] === 'off') { // to turn logging off
        try {
            db.prepare(`DELETE FROM logging WHERE guildid = ?`).run(message.guild.id);
        } catch {
            message.channel.send("There was an error. This channel's logging was likely already off.");
        }
    } else if (!lchan) { // if args[0] is not a channel send...
        message.channel.send(`${language["logging"].invalidChannel}`);
        return;
    } else if (lchan.type === "voice" || lchan.type === "category") { // if args[0] is not a text channel send...
        message.channel.send(`${language["logging"].invalidTextChannel}`);
        return;
    } else if (!table['count(*)']) {
        message.channel.send(`:white_check_mark: | **Logging channel set to ${lchan}**!`)
        db.prepare(`CREATE TABLE logging (guildid TEXT, channel TEXT);`).run(); // if there are no contents on the table, create the guildid and channel
        const create = db.prepare('INSERT OR REPLACE INTO logging (guildid, channel) VALUES (@guildid, @channel);'); // then write the guild and channel values
        create.run({
            guildid: `${message.guild.id}`,
            channel: `${lchan}`
        });
    } else {
        message.channel.send(`:white_check_mark: | **Logging channel updated to ${lchan}**!`)
        const update = db.prepare(`INSERT OR REPLACE INTO logging (guildid, channel) VALUES (@guildid, @channel);`); // replace the channel record where it matches with guildid
        update.run({
            guildid: `${message.guild.id}`,
            channel: `${lchan}`
        });
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