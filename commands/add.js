const Discord = require("discord.js");
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  const suppRole = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${message.guild.id}`).get();
  const modRole = message.guild.roles.find(x => x.name === "Support Team") || message.guild.roles.find(r => r.id === suppRole.role);
  if (!modRole) {
    let nomodRole = new Discord.RichEmbed()
      .setColor(`36393F`)
      .setDescription(`${language.tickets.nomodRole}`);
    message.channel.send(nomodRole);
    return;
  }

  if (!message.member.roles.has(modRole.id) && message.author.id !== message.guild.ownerID) {
    let donthaveroleMessage = language.tickets.donthaveRole;
    const role = donthaveroleMessage.replace(
      "${role}",
      modRole
    );
    let donthaveRole = new Discord.RichEmbed()
      .setColor(`36393F`)
      .setDescription(`${role}`);
    message.channel.send(donthaveRole);
    return;
  }

  let rUser = message.mentions.users.first();
  if (!rUser) {
    let nouser = new Discord.RichEmbed()
      .setColor(`36393F`)
      .setDescription(`${language.tickets.cantfindUser}`);
    message.channel.send(nouser);
    return;
  }

  let channelArgs = message.channel.name.split('-');
  let foundTicket = db.prepare(`SELECT * FROM tickets WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`).get({ticketid: args[1] || channelArgs[channelArgs.length - 1]});
  if (foundTicket) {
    const getChan = message.guild.channels.find(chan => chan.id === foundTicket.chanid);
    getChan.overwritePermissions(rUser, {
      READ_MESSAGES: true,
      SEND_MESSAGES: true
    });
    let addedMessage = language.tickets.added;
    const theuser = addedMessage.replace(
      "${user}",
      rUser.tag
    );
    getChan.send(`${theuser}`);
    const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
    const logchan = message.guild.channels.find(chan => chan.id === logget.log);
    if (!logchan) return;
    let loggingembed = new Discord.RichEmbed()
      .setColor(color)
      .setDescription(`<@${message.author.id}> added ${rUser} to ticket <#${getChan.id}>`);
    logchan.send(loggingembed);
  } else {
    let errEmbed = new Discord.RichEmbed()
      .setColor(`#36393F`)
      .setDescription('This ticket could not be found.');
    message.channel.send(errEmbed);
  }
};

module.exports.help = {
  name: "add"
};