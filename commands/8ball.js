const Discord = require("discord.js");
const fs = require("fs");
let prefixes = JSON.parse(fs.readFileSync("./Storage/prefixes.json", "utf8"));

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  // if no args

  if (!args[0]) {
    let noArgumentsMessage = language["8ball"].noArguments;
    const noArguments = noArgumentsMessage.replace(
      "${prefix}",
      prefixes[message.guild.id].prefixes
    );

    message.channel.send(`${noArguments}`);
    return;
  }

  // responses

  let responses = [
    `${language["8ball"].yes}`,
    `${language["8ball"].no}`,
    `${language["8ball"].probably}`,
    `${language["8ball"].i_dont_know}`,
    `${language["8ball"].most_likely}`,
    `${language["8ball"].not_really}`,
    `${language["8ball"].ask_again}`,
    `${language["8ball"].no_response}`
  ];

  // perms checking

  if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) {
    message.channel.send(
      `:8ball: **| ${
        responses[Math.floor(Math.random() * responses.length)]
      }, ${message.author.username}**`
    );
    return;
  }

  // embed
  const embed = new Discord.RichEmbed()
    .setColor(color)
    .setTitle(
      `:8ball: | ${responses[Math.floor(Math.random() * responses.length)]}, ${
        message.author.username
      }`
    );
  message.channel.send({ embed: embed });
};

module.exports.help = {
  name: "8ball"
};