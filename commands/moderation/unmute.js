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
        name: "unmute",
        usage: "${prefix}unmute <@user>",
        category: "informative",
        description: "Unutes a user in the guild",
        accessableby: "Staff"
    },
    run: async (bot, message, args, color) => {
        const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);
        const prefix = prefixgrab.prefix;

        let language = require('../../storage/messages.json');

        message.delete();

        if ((!message.member.hasPermission("KICK_MEMBERS") && (message.author.id !== ownerID))) {
            message.channel.send(`${language.unmute.noAuthorPermission}`).then(message => message.delete({
                timeout: 5000
            }));
            return;
        }

        const mod = message.author;
        let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        if (!user) return message.reply(`${language.unmute.noMention}`).then(message => message.delete({
            timeout: 5000
        }));
        let muterole = message.guild.roles.find(x => x.name === "Muted");
        if (!user.roles.find(x => x.id === muterole.id)) return message.channel.send(`${language.unmute.noRoleAsigned}`);

        const dbid = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
        if (!dbid) {
            await (user.roles.remove(muterole.id));
            const unmuteembed = new MessageEmbed()
                .setAuthor(' Action | Un-Mute', `http://odinrepo.tk/speaker.png`)
                .addField('User', `<@${user.id}>`)
                .addField('Staff Member', `${mod}`)
                .setColor("#ff0000");
            message.channel.send(unmuteembed);
        } else {
            const dblogs = dbid.channel;
            await (user.roles.remove(muterole.id));
            const unmuteembed = new MessageEmbedEmbed()
                .setAuthor(' Action | Un-Mute', `http://odinrepo.tk/speaker.png`)
                .addField('User', `<@${user.id}>`)
                .addField('Staff Member', `${mod}`)
                .setColor("#ff0000");
            bot.channels.get(dblogs).send(unmuteembed);
        }
    }
};