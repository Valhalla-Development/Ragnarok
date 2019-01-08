const Discord = require("discord.js");
const SQLite = require('better-sqlite3')
const db = new SQLite('./Storage/db/db.sqlite');
const client = new Discord.Client();

module.exports.run = async (client, message, args, color) => {
    let language = require(`../messages/messages_en-US.json`);

    if ((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== '151516555757223936')))
        return message.channel.send(`${language["logging"].noPermission}`);

    const lchan = message.guild.channels.find(x => x.name === args[0]);
    const table = db.prepare(`SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'logging';`).get();
    
    if (args[0] === 'off') {
        message.channel.send('You need to set this up, but you don\'t know how to delete the records');
        return;
    } else if (!lchan === undefined) {
        message.channel.send(`${language["logging"].invalidChannel}`);
        return;
    };
    if (lchan.type === "voice" || lchan.type === "category") {
        message.channel.send(`${language["logging"].invalidTextChannel}`);
        return;
    }
    if (!table['count(*)']) {
        message.channel.send(`:white_check_mark: | **Logging channel set to ${lchan}**!`)
        db.prepare(`CREATE TABLE logging (guildid TEXT, channel TEXT);`).run();
        const create = db.prepare('INSERT OR REPLACE INTO logging (guildid, channel) VALUES (@guildid, @channel);');
        create.run({
            guildid: `${message.guild.id}`,
            channel: `${lchan}`
        });
    } else {
        message.channel.send(`:white_check_mark: | **Logging channel updated to ${lchan}**!`)
        const update = db.prepare(`UPDATE logging SET channel = @channel WHERE guildid = @guildid`);
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
