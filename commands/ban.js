const Discord = require("discord.js");
const fs = require("fs");
const config = JSON.parse(
  fs.readFileSync("./Storage/config.json", "utf8")
);
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  if ((!message.member.hasPermission("BAN_MEMBERS") && (message.author.id !== config.ownerID))) {
    message.channel.send(`${language.ban.noAuthorPermission}`).then(msg => {
      msg.delete(10000);
    });
    return;
  }

  let cnt = message.content;
  if (cnt !== " ") {
    message.delete(10); // ?
  }

  const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
  if (!id) {
    let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!user) return message.reply(`${language.ban.notarget}`).then(message => message.delete(5000));

    let reason = args.slice(1).join(' ');
    if (!reason) reason = "No reason given";

    message.guild.member(user).ban(reason);

    let logsEmbed = new Discord.RichEmbed()
      .setTitle("User Banned")
      .setFooter("User Ban Logs")
      .setColor(color)
      .setTimestamp()
      .addField("Banned User:", `${user}, ID: ${user.id}`)
      .addField("Reason:", reason)
      .addField("Moderator:", `${message.author}, ID: ${message.author.id}`)
      .addField("Time:", message.createdAt);

    message.channel.send(logsEmbed);

  } else {
    const logch = id.channel;

    let logsch = client.channels.get(logch);

    let chuser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!chuser) return message.reply(`${language.ban.notarget}`).then(message => message.delete(5000));

    let chreason = args.slice(1).join(' ');
    if (!chreason) reasonch = "No reason given";

    message.guild.member(chuser).ban(chreason);
    message.channel.send(`${chuser}, was banned by ${message.author}\nCheck <#${logsch}> for more information!`).then(message.delete(1000));

    let logsEmbedD = new Discord.RichEmbed()
      .setTitle("User Banned")
      .setFooter("User Ban Logs")
      .setColor("#ff0000")
      .setTimestamp()
      .addField("Banned User:", `${chuser}, ID: ${chuser.id}`)
      .addField("Reason:", chreason)
      .addField("Moderator:", `${message.author}, ID: ${message.author.id}`)
      .addField("Time:", message.createdAt);

    client.channels.get(logsch).send(logsEmbedD);
  }
};

module.exports.help = {
  name: "ban"
};