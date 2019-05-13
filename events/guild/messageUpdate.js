const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, oldMessage, newMessage) => {

    if (
        newMessage.content.includes("https://") ||
        newMessage.content.includes("http://") ||
        newMessage.content.includes("discord.gg") ||
        newMessage.content.includes("discord.me") ||
        newMessage.content.includes("discord.io")
    ) {
        const adsprot = db.prepare("SELECT count(*) FROM adsprot WHERE guildid = ?").get(newMessage.guild.id);
        if (!adsprot['count(*)']) {
            return;
        } else if (newMessage.member.hasPermission("MANAGE_GUILD")) return;
        newMessage.delete();
        newMessage.channel
            .send(
                `**Your message contained a link and it was deleted, <@${
              newMessage.author.id
            }>**`
            )
            .then(msg => {
                msg.delete(10000);
            });
    }
};