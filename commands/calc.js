const Discord = require("discord.js");
const math = require("mathjs");

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  if (!args[0]) return message.channel.send(`${language["calc"].noInput}`);

  let resp;
  try {
    resp = math.eval(args.join(" "));
  } catch (e) {
    return message.channel.send(`${language["calc"].invalidInput}`);
  }

  const embed = new Discord.RichEmbed()
    .setColor(0xffffff)
    .setTitle("Math Calculation")
    .addField("Input", `\`\`\`js\n${args.join("")}\`\`\``)
    .addField("Output", `\`\`\`js\n${resp}\`\`\``);

  message.channel.send(embed);
};

module.exports.help = {
  name: "calc"
};