const Discord = require("discord.js");
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  const modRole = message.guild.roles.find(r => ["Support Team"].includes(r.name));
  if (!modRole) {
    let nomodRole = new Discord.RichEmbed()
      .setColor(`36393F`)
      .setDescription(`${language.tickets.nomodRole}`);
    message.channel.send(nomodRole);
    return;
  }

  if (!message.member.roles.has(modRole.id)) {
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



  let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
  if (!rUser) {
    let nouser = new Discord.RichEmbed()
      .setColor(`36393F`)
      .setDescription(`${language.tickets.cantfindUser}`);
    message.channel.send(nouser);
    return;
  }
  let rreason = args.join(" ").slice(22);

  if (!message.channel.name.startsWith(`ticket-`)) {
    let badChannel = new Discord.RichEmbed()
      .setColor(`36393F`)
      .setDescription(`${language.tickets.wrongChannel}`);
    message.channel.send(badChannel);
    return;
  }
  message.delete().catch(O_o => {});


  message.channel.overwritePermissions(rUser, {
    READ_MESSAGES: false,
    SEND_MESSAGES: false
  });

  let removedMessage = language.tickets.removed;
  const theuser = removedMessage.replace(
    "${user}",
    rUser
  );
  message.channel.send(`${theuser}`);
  const logget = db.prepare(`SELECT channel FROM ticketlog WHERE guildid = ${message.guild.id};`).get();
  if (!logget) {
      return;
  } else {
      const logchan = logget.channel;
      let loggingembed = new Discord.RichEmbed()
          .setColor(color)
          .setDescription(`<@${message.author.id}> removed ${rUser} from ticket <#${message.channel.id}>`);
      client.channels.get(logchan).send(loggingembed);
      }

};

module.exports.help = {
  name: "remove"
};