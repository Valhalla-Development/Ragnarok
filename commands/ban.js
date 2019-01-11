const Discord = require("discord.js");
const fs = require("fs");
const config = JSON.parse(
  fs.readFileSync("./Storage/config.json", "utf8")
);

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  if ((!message.member.hasPermission("BAN_MEMBERS") && (message.author.id !== config.ownerID))) {
    message.channel.send(`${language["ban"].noAuthorPermission}`).then(msg => {
      msg.delete(10000);
    });
    return;
  }

  let cnt = message.content
  if (cnt !== " ") {
    message.delete(10) // ?
  };

  let logs = message.guild.channels.find(x => x.name === "logs");
  if (!logs) return message.guild.createChannel("logs").then(channel => {
    channel.setTopic(`Log channel`).then(message.channel.send(`${language["ban"].channelcreated}`).then(message => message.delete(5000)));
  });

  let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
  if (!user) return message.reply(`${language["ban"].notarget}`).then(message => message.delete(5000));

  let reason = args.slice(1).join(' ');
  if (!reason) reason = "No reason given";

  message.guild.member(user).ban(reason);

  let logsEmbed = new Discord.RichEmbed()
    .setTitle("User Banned")
    .setFooter("User Ban Logs")
    .setColor("#ff0000")
    .setTimestamp()
    .addField("Banned User:", `${user}, ID: ${user.id}`)
    .addField("Reason:", reason)
    .addField("Moderator:", `${message.author}, ID: ${message.author.id}`)
    .addField("Time:", message.createdAt)

  logs.send(logsEmbed);
};

module.exports.help = {
  name: "ban"
};