const Discord = require("discord.js");
const ms = require("ms");
const fs = require("fs");
const config = JSON.parse(
  fs.readFileSync("./Storage/config.json", "utf8")
);

module.exports.run = async (client, message, args, color) => {
    let language = require(`../messages/messages_en-US.json`);

    if((!message.member.hasPermission("KICK_MEMBERS") && (message.author.id !== config.ownerID))) {
        message.channel.send(`${language["unmute"].noAuthorPermission}`).then(message => message.delete(5000));;
        return;
      }
    
      let cnt = message.content
      if (cnt !== " ") {
          message.delete(10) // ?
      };
      

    const log = message.guild.channels.find(x => x.name === "logs");
    const mod = message.author;
    let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!user) return message.reply(`${language["unmute"].noMention}`).then(message => message.delete(5000));
    let muterole = message.guild.roles.find(x => x.name === "Muted");
    let muteChannel = message.guild.channels.find(x => x.name === "logs");
    if (!muteChannel) return message.guild.createChannel("logs").then(channel => {
        channel.setTopic(`Log channel`).then(message.channel.send(`${language["unmute"].createdChannel}`).then(message => message.delete(5000)));
      });

    await (user.removeRole(muterole.id));
    const unmuteembed = new Discord.RichEmbed()
        .setAuthor(' Action | Un-Mute', `http://odinrepo.tk/speaker.png`)
        .addField('User', `<@${user.id}>`)
        .addField('Staff Member', `${mod}`)
        .setColor("#ff0000")
    log.send(unmuteembed)

};


module.exports.help = {
    name: "unmute"
};