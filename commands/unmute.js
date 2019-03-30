const Discord = require("discord.js");
const fs = require("fs");
const config = JSON.parse(
    fs.readFileSync("./Storage/config.json", "utf8")
);
const SQLite = require('better-sqlite3');
const db= new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
    let language = require(`../messages/messages_en-US.json`);

    if ((!message.member.hasPermission("KICK_MEMBERS") && (message.author.id !== config.ownerID))) {
        message.channel.send(`${language.unmute.noAuthorPermission}`).then(message => message.delete(5000));
        return;
    }

    let cnt = message.content;
    if (cnt !== " ") {
        message.delete(10); // ?
    }


    const mod = message.author;
    let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!user) return message.reply(`${language.unmute.noMention}`).then(message => message.delete(5000));
    let muterole = message.guild.roles.find(x => x.name === "Muted");
    if (!user.roles.find(x => x.id === muterole.id)) return message.channel.send(`${language.unmute.noRoleAsigned}`);

    const dbid = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
    if (!dbid) {
    await (user.removeRole(muterole.id));
    const unmuteembed = new Discord.RichEmbed()
        .setAuthor(' Action | Un-Mute', `http://odinrepo.tk/speaker.png`)
        .addField('User', `<@${user.id}>`)
        .addField('Staff Member', `${mod}`)
        .setColor("#ff0000");
    message.channel.send(unmuteembed);
    } else {
        const dblogs = dbid.channel;
        await (user.removeRole(muterole.id));
        const unmuteembed = new Discord.RichEmbed()
            .setAuthor(' Action | Un-Mute', `http://odinrepo.tk/speaker.png`)
            .addField('User', `<@${user.id}>`)
            .addField('Staff Member', `${mod}`)
            .setColor("#ff0000");
        client.channels.get(dblogs).send(unmuteembed);
    }
};


module.exports.help = {
    name: "unmute"
};