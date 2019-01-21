const SQLite = require('better-sqlite3')
const db = new SQLite('./Storage/db/db.sqlite');
const fs = require("fs");
const config = JSON.parse(
  fs.readFileSync("./Storage/config.json", "utf8")
);
const Discord = require("discord.js");

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);

  let prefix = prefixgrab.prefix;

  if ((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID))) {
    let invalidpermsembed = new Discord.RichEmbed()
    .setColor(`36393F`)
    .setDescription(`${language["autorole"].noPermission}`)
    message.channel.send(invalidpermsembed);
    return;
  };

  client.getTable = db.prepare("SELECT * FROM autorole WHERE guildid = ?");
  let role;
  if (message.guild.id) {
    role = client.getTable.get(message.guild.id);

  if (!args[0]) {
    let incorrectUsageMessage = language["autorole"].incorrectUsage;
    const incorrectUsage = incorrectUsageMessage.replace(
      "${prefix}",
      prefix
    );
    let incorrectUsageembed = new Discord.RichEmbed()
    .setColor(`36393F`)
    .setDescription(`${incorrectUsage}`)
    message.channel.send(incorrectUsageembed);
    return;
  } else if (args[0] === 'off') {
    db.prepare("DELETE FROM autorole WHERE guildid = ?").run(message.guild.id);
    let turnoffembed = new Discord.RichEmbed()
    .setColor(`36393F`)
    .setDescription(`${language["autorole"].turnedOff}`)
    message.channel.send(turnoffembed);
    return;
  } 
  if (!message.guild.roles.some(r => [`${args[0]}`].includes(r.name))) return message.channel.send(`:x: **That role does not exist! Roles are case sensitive.**`); {
  } if (role) {
    const update = db.prepare("UPDATE autorole SET role = (@role) WHERE guildid = (@guildid);");
    update.run({
        guildid: `${message.guild.id}`,
        role: `${args[0]}`
    });
    let autoroleUpdateMessage = language["autorole"].updateRole;
    const roleupdate = autoroleUpdateMessage.replace("${autorole}", args[0]);
    let updatedembed = new Discord.RichEmbed()
    .setColor(`36393F`)
    .setDescription(`${roleupdate}`)
    message.channel.send(updatedembed);
    return;
  } else {
    const insert = db.prepare("INSERT INTO autorole (guildid, role) VALUES (@guildid, @role);");
    insert.run({
      guildid: `${message.guild.id}`,
      role: `${args[0]}`
    });
    let autoroleSetMessage = language["autorole"].roleSet;
    const roleSet = autoroleSetMessage.replace("${autorole}", args[0]);
    let setembed = new Discord.RichEmbed()
    .setColor(`36393F`)
    .setDescription(`${roleSet}`)
    message.channel.send(setembed);
    return;
  };
};
};

module.exports.help = {
  name: "autorole"
};