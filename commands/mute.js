const Discord = require("discord.js");
const ms = require("ms");
const fs = require("fs");
const config = JSON.parse(
    fs.readFileSync("./Storage/config.json", "utf8")
);
const SQLite = require('better-sqlite3')
const db= new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
    let language = require(`../messages/messages_en-US.json`);

    if ((!message.member.hasPermission("KICK_MEMBERS") && (message.author.id !== config.ownerID))) {
        message.channel.send(`${language["mute"].noAuthorPermission}`).then(message => message.delete(5000));;
        return;
    }

    let cnt = message.content
    if (cnt !== " ") {
        message.delete(10) // ?
    };


    const mod = message.author;
    let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!user) return message.reply(`${language["mute"].noUser}`).then(message => message.delete(5000));
    let reason = message.content.split(' ').splice(3).join(' ')
    if (!reason) return message.channel.send(`${language["mute"].noReason}`).then(message => message.delete(5000));
    let muterole = message.guild.roles.find(x => x.name === "Muted");
    if (!muterole) {
        try {
            muterole = await message.guild.createRole({
                name: "Muted",
                color: "#000000",
                permissions: []
            })
            message.guild.channels.forEach(async (channel, id) => {
                await channel.overwritePermissions(muterole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                });
            });
        } catch (e) {
            console.log(e.stack);
        }
    }

    let mutetime = args[1];
    if (!mutetime) return message.channel.send(`${language["mute"].noTime}`).then(message => message.delete(5000));


    const dbid = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
    if (!dbid) {
    await (user.addRole(muterole.id));
    const muteembed = new Discord.RichEmbed()
        .setAuthor(' Action | Mute', `https://images-ext-2.discordapp.net/external/Wms63jAyNOxNHtfUpS1EpRAQer2UT0nOsFaWlnDdR3M/https/image.flaticon.com/icons/png/128/148/148757.png`)
        .addField('User', `<@${user.id}>`)
        .addField('Reason', `${reason}`)
        .addField('Time', `${mutetime}`)
        .addField('Moderator', `${mod}`)
        .setColor("#ff0000")
    message.channel.send(muteembed)

    setTimeout(function () {
        (user.removeRole(muterole.id));
        let unmuteembed = new Discord.RichEmbed()
            .setAuthor(' Action | Un-Mute', `http://odinrepo.tk/speaker.png`)
            .addField('User', `<@${user.id}>`)
            .addField('Reason', 'Mute time ended')
            .setColor("#ff0000")

        message.channel.send(unmuteembed);
    }, ms(mutetime));
} else {
    const dblogs = dbid.channel
    await (user.addRole(muterole.id));
    const muteembed = new Discord.RichEmbed()
        .setAuthor(' Action | Mute', `https://images-ext-2.discordapp.net/external/Wms63jAyNOxNHtfUpS1EpRAQer2UT0nOsFaWlnDdR3M/https/image.flaticon.com/icons/png/128/148/148757.png`)
        .addField('User', `<@${user.id}>`)
        .addField('Reason', `${reason}`)
        .addField('Time', `${mutetime}`)
        .addField('Moderator', `${mod}`)
        .setColor("#ff0000")
    client.channels.get(dblogs).send(muteembed);

    setTimeout(function () {
        (user.removeRole(muterole.id));
        let unmuteembed = new Discord.RichEmbed()
            .setAuthor(' Action | Un-Mute', `http://odinrepo.tk/speaker.png`)
            .addField('User', `<@${user.id}>`)
            .addField('Reason', 'Mute time ended')
            .setColor("#ff0000")
            
        client.channels.get(dblogs).send(unmuteembed);
    }, ms(mutetime));
}
};


module.exports.help = {
    name: "mute"
};