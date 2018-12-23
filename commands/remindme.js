const Discord = require("discord.js");
const ms = require("ms");

module.exports.run = async (client, message, args, color) => {
  let reminderTime = args[0];
  if (!reminderTime)
    return message.channel.send(
      ":x: **Specify a time for me to remind you. | Example: /remindme 15min example**"
    );

  let reminder = args.slice(1).join(" ");

  message.channel.send(
    ":white_check_mark: ** I will remind you in " +
      `${reminderTime}` +
      " :heart:**"
  );

  setTimeout(function() {
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