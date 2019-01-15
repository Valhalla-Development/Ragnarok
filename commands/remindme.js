const Discord = require("discord.js");
const ms = require("ms");
const SQLite = require('better-sqlite3')
const db = new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);

  let prefix = prefixgrab.prefix;


  let incorrectUsageMessage = language["remindme"].incorrectUsage;
  const incorrectUsage = incorrectUsageMessage.replace(
    "${prefix}",
    prefix
  );

  let reminderTime = args[0];
  if (!reminderTime)
    return message.channel.send(`${incorrectUsage}`);

  let reminder = args.slice(1).join(" ");

  message.channel.send(
    ":white_check_mark: ** I will remind you in " +
    `${reminderTime}` +
    " :heart:**"
  );

  setTimeout(function () {
    let remindEmbed = new Discord.RichEmbed()
      .setColor(`RANDOM`)
      .setAuthor(`${message.author.username}`, message.author.displayAvatarURL)
      .addField("Reminder", `\`\`\`${reminder}\`\`\``);

    message.channel.send(remindEmbed);
  }, ms(reminderTime));
};

module.exports.help = {
  name: "remindme"
};