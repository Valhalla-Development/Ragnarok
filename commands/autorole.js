const Discord = require("discord.js");
const SQLite = require('better-sqlite3')
const db = new SQLite('./Storage/db/db.sqlite');
const fs = require("fs");
let prefixes = JSON.parse(fs.readFileSync("./Storage/prefixes.json", "utf8"));
const config = JSON.parse(
  fs.readFileSync("./Storage/config.json", "utf8")
);

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  if((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID)))
    return message.channel.send(`${language["autorole"].noPermission}`);

  client.getTable = db.prepare("SELECT * FROM autorole WHERE guildid = ?");
  let role;
  if (message.guild.id) {
    role = client.getTable.get(message.guild.id);

  if (!args[0]) {
    let incorrectUsageMessage = language["autorole"].incorrectUsage;
    const incorrectUsage = incorrectUsageMessage.replace(
      "${prefix}",
      prefixes[message.guild.id].prefixes
    );
    message.channel.send(`${incorrectUsage}`);
    return;
  } else if (args[0] === 'off') {
    db.prepare("DELETE FROM autorole WHERE guildid = ?").run(message.guild.id);
    message.channel.send(':white_check_mark: | **Autorole disabled!**')
    return;
  } 
  if (!message.guild.roles.some(r => [`${args[0]}`].includes(r.name))) return message.channel.send(`:x: | **That role does not exist! Roles are case sensitive.**`); {
  } if (role) {
    const update = db.prepare("UPDATE autorole SET role = (@role) WHERE guildid = (@guildid);");
    update.run({
        guildid: `${message.guild.id}`,
        role: `${args[0]}`
    });
    message.channel.send(':white_check_mark: | **Autorole updated!**');
    return;
  } else {
    const insert = db.prepare("INSERT INTO autorole (guildid, role) VALUES (@guildid, @role);");
    insert.run({
      guildid: `${message.guild.id}`,
      role: `${args[0]}`
    });
    let autoroleSetMessage = language["autorole"].roleSet;
    const roleSet = autoroleSetMessage.replace("${autorole}", args[0]);
    message.channel.send(`${roleSet}`);
    return;
  };
};
};

module.exports.help = {
  name: "autorole"
};