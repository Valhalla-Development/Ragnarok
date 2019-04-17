const Discord = require("discord.js");
const fs = require("fs");
const moment = require("moment");
const client = new Discord.Client();
const config = require("./Storage/config.json");
const prefixgen = config.prefix;
const logging = config.logging;
const color = config.color;
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/db/db.sqlite');
let coinCooldown = new Set();
const coinCooldownSeconds = 5;

client.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
  if (err) console.log(err);
  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if (jsfile.length <= 0) {
    console.log(
      new Error(
        "[Ragnarok] An error occurred! Please contact Ragnar Lothbrok#1948"
      )
    );
    process.exit(1);
    return;
  }

  jsfile.forEach(f => {
    let props = require(`./commands/${f}`);
    console.log(`[Ragnarok] Loaded ${f}.`);
    client.commands.set(props.help.name, props);
  });
});

if (process.version.slice(1).split(".")[0] < 8) {
  console.log(
    new Error(
      `[Ragnarok] You must have NodeJS 8 or higher installed on your PC.`
    )
  );
  process.exit(1);
}

if (logging !== true && logging !== false) {
  console.log(
    new TypeError(`[Ragnarok] The 'logging' value must be true or false.`)
  );
  process.exit(1);
}

if (logging === true) {
  console.log(
    `[Ragnarok] Logging enabled! When someone will execute a command, I will log that in here.`
  );
}

client.login(config.token);

// error notifiers
client.on("error", e => {
  console.error(e);
});

client.on("warn", e => {
  console.warn(e);
});

process.on("unhandledRejection", error => {
  console.error(`Error: \n${error.stack}`);
});

// client ready event
client.on("ready", () => {
  // console logs

  console.log(
    `\n \n \n \nSuccessfully connected into discord's gateway(v6)\nScanning for guilds...\n\x1b[36m[-]\x1b[0m ${client.guilds
      .map(n => n.name + ` (ID: \x1b[36m${n.id}\x1b[0m)`)
      .join(`\x1b[36m\n[-]\x1b[0m `)}`
  );

  setTimeout(() => {
    console.log(
      `Scan completed!\nAll commands are loaded. We are ready to go!\nInvite link: https://discordapp.com/oauth2/authorize?client_id=${
        client.user.id
      }&scope=bot&permissions=8\nType ${prefixgen}help to get a list of commands to use!`
    );
  }, 1000);

  // activity

  client.user.setActivity(`${prefixgen}help | ${client.guilds.size} Guilds ${client.users.size} Users`, {
    type: "WATCHING"
  });

  // RoleMenu Table 
  const rolemenu = db.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'rolemenu';").get();
  if (!rolemenu['count(*)']) {
    console.log('rolemenu table created!');
    db.prepare("CREATE TABLE rolemenu (guildid TEXT PRIMARY KEY, activeRoleMenuID TEXT, roleList BLOB);").run();
    db.prepare("CREATE UNIQUE INDEX idx_rolemenu_id ON rolemenu (guildid);").run();
    db.pragma("synchronous = 1");
    db.pragma("journal_mode = wal");
  }
  // setprefix table
  const setprefix = db.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'setprefix';").get();
  if (!setprefix['count(*)']) {
    console.log('setprefix table created!');
    db.prepare("CREATE TABLE setprefix (guildid TEXT PRIMARY KEY, prefix TEXT);").run();
    db.prepare("CREATE UNIQUE INDEX idx_setprefix_id ON setprefix (guildid);").run();
    db.pragma("synchronous = 1");
    db.pragma("journal_mode = wal");
  }
  // setwelcome table
  const setwelcome = db.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'setwelcome';").get();
  if (!setwelcome['count(*)']) {
    console.log('setwelcome table created!');
    db.prepare("CREATE TABLE setwelcome (guildid TEXT PRIMARY KEY, channel TEXT, title TEXT, author TEXT, description TEXT);").run();
    db.prepare("CREATE UNIQUE INDEX idx_setwelcome_id ON setwelcome (guildid);").run();
    db.pragma("synchronous = 1");
    db.pragma("journal_mode = wal");
  }
  // autorole table
  const autorole = db.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'autorole';").get();
  if (!autorole['count(*)']) {
    console.log('autorole table created!');
    db.prepare("CREATE TABLE autorole (guildid TEXT PRIMARY KEY, role TEXT);").run();
    db.prepare("CREATE UNIQUE INDEX idx_autorole_id ON autorole (guildid);").run();
    db.pragma("synchronous = 1");
    db.pragma("journal_mode = wal");
  }
  // balance table
  const balancetable = db.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'balance';").get();
  if (!balancetable['count(*)']) {
    console.log('balance table created!');
    db.prepare("CREATE TABLE balance (id TEXT PRIMARY KEY, user TEXT, guild TEXT, balance INTEGER);").run();
    db.prepare("CREATE UNIQUE INDEX idx_balance_id ON balance (id);").run();
    db.pragma("synchronous = 1");
    db.pragma("journal_mode = wal");
  }
  client.getBalance = db.prepare("SELECT * FROM balance WHERE user = ? AND guild = ?");
  client.setBalance = db.prepare("INSERT OR REPLACE INTO balance (id, user, guild, balance) VALUES (@id, @user, @guild, @balance);");
  // scores table
  const table = db.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
  if (!table['count(*)']) {
    console.log('scores table created!');
    db.prepare("CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER, level INTEGER);").run();
    db.prepare("CREATE UNIQUE INDEX idx_scores_id ON scores (id);").run();
    db.pragma("synchronous = 1");
    db.pragma("journal_mode = wal");
  }
  client.getScore = db.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
  client.setScore = db.prepare("INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);");
  // adsprot table
  const adsprottable = db.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'adsprot';").get();
  if (!adsprottable['count(*)']) {
    console.log('adsprot table created!');
    db.prepare("CREATE TABLE adsprot (guildid TEXT PRIMARY KEY, status TEXT);").run();
    db.prepare("CREATE UNIQUE INDEX idx_adsprot_id ON adsprot (guildid);").run();
    db.pragma("synchronous = 1");
    db.pragma("journal_mode = wal");
  }
  // logging table
  const loggingtable = db.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'logging';").get();
  if (!loggingtable['count(*)']) {
    console.log('logging table created!');
    db.prepare("CREATE TABLE logging (guildid TEXT PRIMARY KEY, channel TEXT);").run();
    db.prepare("CREATE UNIQUE INDEX idx_logging_id ON logging (guildid);").run();
    db.pragma("synchronous = 1");
    db.pragma("journal_mode = wal");
  }
  // ticket table
  const tickettable = db.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'ticket';").get();
  if (!tickettable['count(*)']) {
    console.log('ticket table created!');
    db.prepare("CREATE TABLE ticket (guildid TEXT PRIMARY KEY, category TEXT);").run();
    db.prepare("CREATE UNIQUE INDEX idx_ticket_id ON ticket (guildid);").run();
    db.pragma("synchronous = 1");
    db.pragma("journal_mode = wal");
  }
  // ticket log table
  const ticketlogtable = db.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'ticketlog';").get();
  if (!ticketlogtable['count(*)']) {
    console.log('ticket log table created!');
    db.prepare("CREATE TABLE ticketlog (guildid TEXT PRIMARY KEY, channel TEXT);").run();
    db.prepare("CREATE UNIQUE INDEX idx_ticketlog_id ON ticketlog (guildid);").run();
    db.pragma("synchronous = 1");
    db.pragma("journal_mode = wal");
  }
});

// RAW EVENT LISTENER
client.on('raw', event => {
  const eventType = event.t;
  const data = event.d;
  if (eventType == 'MESSAGE_DELETE') {
    if (data.user_id == client.user.id) return;
    const getRoleMenu = db.prepare(`SELECT * FROM rolemenu WHERE guildid=${data.guild_id}`).get();
    if (!getRoleMenu || !getRoleMenu.activeRoleMenuID) {
      return;
    } else if (getRoleMenu.activeRoleMenuID === data.id) {
      db.prepare(`UPDATE rolemenu SET activeRoleMenuID = '' WHERE guildid = ${data.guild_id}`).run();
    }
  }
  if (eventType === 'MESSAGE_REACTION_ADD') {
    let alphaEmoji = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿'];
    if (data.user_id == client.user.id) return;
    let guild = client.guilds.find(guild => guild.id === data.guild_id);
    let member = guild.members.find(member => member.id === data.user_id);
    const foundRoleMenu = db.prepare(`SELECT * FROM rolemenu WHERE guildid=${data.guild_id}`).get();
    if (!foundRoleMenu) {
      return;
    } else if (foundRoleMenu.activeRoleMenuID === data.message_id) {
      let channel = guild.channels.find(channel => channel.id === data.channel_id);
      channel.fetchMessage(foundRoleMenu.activeRoleMenuID).then(msg => {
        let roleArray = JSON.parse(foundRoleMenu.roleList);
        let reaction = msg.reactions.get(data.emoji.name) || msg.reactions.get(data.emoji.name + ':' + data.emoji.id);
        if (member.id !== client.user.id) {
          if (alphaEmoji.includes(data.emoji.name)) {
            let roleIndex = alphaEmoji.indexOf(data.emoji.name);
            let addedRole = msg.guild.roles.find(r => r.id === roleArray[roleIndex]);
            let memberRole = member.roles.map(role => role.id);

            if (!member.hasPermission('MANAGE_MESSAGES') && addedRole.hasPermission('MANAGE_MESSAGES')) {
              let getReactUser = reaction.users.map(react => react.id);
              if (getReactUser.includes(member.id)) {
                reaction.remove(member.id);
              }
              return;
            } else if (eventType === 'MESSAGE_REACTION_ADD') {
              if (memberRole.includes(roleArray[roleIndex])) {
                member.removeRole(roleArray[roleIndex]);
                reaction.remove(member.id);
              } else {
                member.addRole(roleArray[roleIndex]);
                reaction.remove(member.id);
              }
            }
          } else {
            reaction.remove(member.id);
          }
        }
      });
    }
  }
});

// logging
client.on('messageDelete', async (message) => {
  if (message.author.bot) return;
  const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  const entry = await message.guild.fetchAuditLogs({
    type: 'MESSAGE_DELETE'
  }).then(audit => audit.entries.first());
  let user = "";
  if (entry.extra.channel.id === message.channel.id &&
    (entry.target.id === message.author.id) &&
    (entry.createdTimestamp > (Date.now() - 5000)) &&
    (entry.extra.count >= 1)) {
    user = entry.executor.username;
  } else {
    user = message.author.username;
  }
  const logembed = new Discord.RichEmbed()
    .setAuthor(user, message.author.displayAvatarURL)
    .setDescription(`**Message sent by <@${message.author.id}> deleted in <#${message.channel.id}>** \n ${message.content}`)
    .setColor(message.guild.member(client.user).displayHexColor)
    .setFooter(`ID: ${message.channel.id}`)
    .setTimestamp();
  client.channels.get(logs).send(logembed);
});

client.on('guildBanAdd', async (guild, user) => {
  const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${guild.id};`).get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  const entry = await guild.fetchAuditLogs({
    type: 'MEMBER_BAN_ADD'
  }).then(audit => audit.entries.first());
  let mod = entry.executor.id;
  const logembed = new Discord.RichEmbed()
    .setAuthor(guild, guild.iconURL)
    .setDescription(`**User Banned: \`${user.tag}\`.**\nModerator: <@${mod}>`)
    .setColor(color)
    .setFooter(`ID: ${mod}`)
    .setTimestamp();
  client.channels.get(logs).send(logembed);
});

client.on('guildBanRemove', async (guild, user) => {
  const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${guild.id};`).get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  const entry = await guild.fetchAuditLogs({
    type: 'MEMBER_BAN_REMOVE'
  }).then(audit => audit.entries.first());
  let mod = entry.executor.id;
  const logembed = new Discord.RichEmbed()
    .setAuthor(guild, guild.iconURL)
    .setDescription(`**User Unbanned: \`${user.tag}\`.**\nModerator: <@${mod}>`)
    .setColor(color)
    .setFooter(`ID: ${mod}`)
    .setTimestamp();
  client.channels.get(logs).send(logembed);
});

client.on('roleDelete', role => {
  const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${role.guild.id};`).get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  const logembed = new Discord.RichEmbed()
    .setAuthor(role.guild, role.guild.iconURL)
    .setDescription(`**Role Deleted: \`${role.name}\`.**`)
    .setColor(color)
    .setTimestamp();
  client.channels.get(logs).send(logembed);
});

client.on('roleCreate', role => {
  const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${role.guild.id};`).get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  const logembed = new Discord.RichEmbed()
    .setAuthor(role.guild, role.guild.iconURL)
    .setDescription(`**Role Created: \`${role.name}\`.**`)
    .setColor(color)
    .setTimestamp();
  client.channels.get(logs).send(logembed);
});

client.on('messageDeleteBulk', messages => {
  const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${messages.first().guild.id};`).get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  const logembed = new Discord.RichEmbed()
    .setAuthor(messages.first().guild, messages.first().guild.iconURL)
    .setDescription(`**Bulk delete in: <#${messages.first().channel.id}>, ${messages.size} deleted.**`)
    .setColor(color)
    .setTimestamp();
  client.channels.get(logs).send(logembed);
});

client.on('channelCreate', channel => {
  const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${channel.guild.id};`).get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  if (channel.type === "voice" || channel.type === "category") return;
  const logembed = new Discord.RichEmbed()
    .setAuthor(channel.guild, channel.guild.iconURL)
    .setDescription(`**Channel Created: <#${channel.id}>**`)
    .setColor(color)
    .setFooter(`ID: ${channel.id}`)
    .setTimestamp();
  client.channels.get(logs).send(logembed);
});

client.on('channelDelete', channel => {
  const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${channel.guild.id};`).get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  if (channel.type === "voice" || channel.type === "category") return;
  const logembed = new Discord.RichEmbed()
    .setAuthor(channel.guild, channel.guild.iconURL)
    .setDescription(`**Channel Deleted:** #${channel.name}`)
    .setColor(color)
    .setFooter(`ID: ${channel.id}`)
    .setTimestamp();
  client.channels.get(logs).send(logembed);
});

client.on("guildDelete", guild => {
  // when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`${prefixgen}help | ${client.guilds.size} Guilds ${client.users.size} Users`, {
    type: "WATCHING"
  });
  // setprefix table
  const delpre = db.prepare("SELECT count(*) FROM setprefix WHERE guildid = ?;").get(guild.id);
  if (delpre['count(*)']) {
    db.prepare("DELETE FROM setprefix WHERE guildid = ?").run(guild.id);
  }
  // setwelcome table
  const delwel = db.prepare("SELECT count(*) FROM setwelcome WHERE guildid = ?;").get(guild.id);
  if (delwel['count(*)']) {
    db.prepare("DELETE FROM setwelcome WHERE guildid = ?").run(guild.id);
  }
  // autorole table
  const delaut = db.prepare("SELECT count(*) FROM autorole WHERE guildid = ?;").get(guild.id);
  if (delaut['count(*)']) {
    db.prepare("DELETE FROM autorole WHERE guildid = ?").run(guild.id);
  }
  // adsprot table
  const delads = db.prepare("SELECT count(*) FROM adsprot WHERE guildid = ?;").get(guild.id);
  if (delads['count(*)']) {
    db.prepare("DELETE FROM adsprot WHERE guildid = ?").run(guild.id);
  }
  // logging table
  const dellog = db.prepare("SELECT count(*) FROM logging WHERE guildid = ?;").get(guild.id);
  if (dellog['count(*)']) {
    db.prepare("DELETE FROM logging WHERE guildid = ?").run(guild.id);
  } // ticket table
  const deltic = db.prepare("SELECT count(*) FROM ticket WHERE guildid = ?;").get(guild.id);
  if (deltic['count(*)']) {
    db.prepare("DELETE FROM ticket WHERE guildid = ?").run(guild.id);
  }
  // ticket log table
  const delticlog = db.prepare("SELECT count(*) FROM ticketlog WHERE guildid = ?;").get(guild.id);
  if (delticlog['count(*)']) {
    db.prepare("DELETE FROM ticketlog WHERE guildid = ?").run(guild.id);
  }
});

client.on("guildCreate", guild => {
  //  when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`${prefixgen}help | ${client.guilds.size} Guilds ${client.users.size} Users`, {
    type: "WATCHING"
  });
});

client.on("guildMemberRemove", member => {
  const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${member.guild.id};`).get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  const logembed = new Discord.RichEmbed()
    .setAuthor('Member Left', member.user.avatarURL)
    .setDescription(`<@${member.user.id}> - ${member.user.tag}`)
    .setColor(color)
    .setFooter(`ID: ${member.user.id}`)
    .setTimestamp();
  client.channels.get(logs).send(logembed);
});

// update status
client.on("guildMemberRemove", member => {
  client.user.setActivity(`${prefixgen}help | ${client.guilds.size} Guilds ${client.users.size} Users`, {
    type: "WATCHING"
  });
});

client.on("guildMemberAdd", member => {
  client.user.setActivity(`${prefixgen}help | ${client.guilds.size} Guilds ${client.users.size} Users`, {
    type: "WATCHING"
  });
});

// logging join
client.on("guildMemberAdd", member => {
  const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${member.guild.id};`).get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  const logembed = new Discord.RichEmbed()
    .setAuthor('Member Joined', member.user.avatarURL)
    .setDescription(`<@${member.user.id}> - ${member.user.tag}`)
    .setColor(color)
    .setFooter(`ID: ${member.user.id}`)
    .setTimestamp();
  client.channels.get(logs).send(logembed);
});

// welcome
client.on("guildMemberAdd", member => {
  const setwelcome = db.prepare(`SELECT * FROM setwelcome WHERE guildid = ${member.guild.id};`).get();
  if (!setwelcome) return;
  var title = setwelcome.title;
  var author = setwelcome.author;
  var description = setwelcome.description;
  if (!description) {
    db.prepare("DELETE FROM setwelcome WHERE guildid = ?").run(member.guild.id);
    return;
  } else {
    var sendchannel = setwelcome.channel;
    var chnsen = member.guild.channels.find(channel => channel.id === sendchannel);
    if (!chnsen) {
      db.prepare("DELETE FROM setwelcome WHERE guildid = ?").run(member.guild.id);
      return;
    }
    let embed = new Discord.RichEmbed()
      .setTitle(`${title}`)
      .setAuthor(`${author}`, member.user.avatarURL)
      .setColor(3447003)
      .setDescription(`${description} ${member.user}`)
      .setThumbnail(member.user.avatarURL);
    client.channels.get(sendchannel).send({
      embed
    });
  }
});

// autorole
client.on("guildMemberAdd", member => {
  const autoroletable = db.prepare(`SELECT role FROM autorole WHERE guildid = ${member.guild.id};`).get();
  if (!autoroletable) return;
  const autorole = autoroletable.role;
  if (!autorole) {
    return;
  } else {
    let myRole = member.guild.roles.find(role => role.name === autorole);
    member.addRole(myRole);
  }
});

// on message edit (ads protection)
client.on("messageUpdate", (oldMessage, newMessage) => {
  if (
    newMessage.content.includes("https://") ||
    newMessage.content.includes("http://") ||
    newMessage.content.includes("discord.gg") ||
    newMessage.content.includes("discord.me") ||
    newMessage.content.includes("discord.io")
  ) {
    const adsprot = db.prepare("SELECT count(*) FROM adsprot WHERE guildid = ?").get(newMessage.guild.id);
    if (!adsprot['count(*)']) {
      return;
    } else if (newMessage.member.hasPermission("MANAGE_GUILD")) {
      return;
    } else if (newMessage.channel.name.includes("ticket-")) return;
    newMessage.delete();
    newMessage.channel
      .send(
        `**Your message contained a link and it was deleted, <@${
              newMessage.author.id
            }>**`
      )
      .then(msg => {
        msg.delete(10000);
      });
  }
});

// guild join event
client.on('guildCreate', guild => {
  let defaultChannel = "";
  guild.channels.forEach((channel) => {
    if (channel.type == "text" && defaultChannel == "") {
      if (channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
        defaultChannel = channel;
      }
    }
  });
  let embed = new Discord.RichEmbed()
    .setTitle(`Hello, I'm **Ragnarok**! Thanks for inviting me!`)
    .setDescription(`The prefix for all my commands is \`-\`, e.g: \`-help\`.`);
  defaultChannel.send({
    embed
  });
});

// client message event
client.on("message", message => {
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let command = messageArray[0].toLowerCase();
  let args = messageArray.slice(1);
  let argresult = args.join(" ");

  // custom prefixes
  const prefixes = db.prepare("SELECT count(*) FROM setprefix WHERE guildid = ?").get(message.guild.id);
  if (!prefixes['count(*)']) {
    const insert = db.prepare("INSERT INTO setprefix (guildid, prefix) VALUES (@guildid, @prefix);");
    insert.run({
      guildid: `${message.guild.id}`,
      prefix: '-'
    });
    return;
  }

  // prefix command
  let prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);

  let prefixcommand = prefixgrab.prefix;

  if (command === prefixgen + 'prefix') {
    let embed = new Discord.RichEmbed()
      .setColor(color)
      .setDescription(`This server's prefix is: \`${prefixcommand}\``);
    message.channel.send(embed);
  }

  // dad bot

  if (message.content.toLowerCase().startsWith('im') || message.content.toLowerCase().startsWith('i\'m')) {
    if (args.length > 5) {
      return;
    }
    if (args[0] === undefined) {
      return;
    } else if (message.content.includes("https://")) {
      message.channel.send(`Hi unloved virgin, I\'m Dad!`);
    } else if (message.content.includes("http://")) {
      message.channel.send(`Hi unloved virgin, I\'m Dad!`);
    } else if (message.content.includes("discord.gg")) {
      message.channel.send(`Hi unloved virgin, I\'m Dad!`);
    } else if (message.content.includes("discord.me")) {
      message.channel.send(`Hi unloved virgin, I\'m Dad!`);
    } else if (message.content.includes("discord.io")) {
      message.channel.send(`Hi unloved virgin, I\'m Dad!`);
    } else if (message.content.includes('@everyone')) {
      message.channel.send(`Hi unloved virgin, I\'m Dad!`);
    } else if (message.content.includes('@here')) {
      message.channel.send(`Hi unloved virgin, I\'m Dad!`);
    } else if (message.content.toLowerCase().includes('`')) {
      message.channel.send(`Hi unloved virgin, I\'m Dad!`);
    } else if (message.content.toLowerCase().startsWith('im dad') || message.content.toLowerCase().startsWith('i\'m dad')) {
      message.channel.send(`No, I\'m Dad!`);
    } else {
      message.channel.send(`Hi ${argresult}, I\'m Dad!`);
    }
  }

  // shrek

  if (message.content.toLowerCase().includes('shrek')) {
    message.reply("What are you doing in mah SWAMP!", {
      file: "https://media1.tenor.com/images/7d3f352b46140c04db37c92f71d4e157/tenor.gif"
    });
  }

  // ads protection checks

  if (
    message.content.includes("https://") ||
    message.content.includes("http://") ||
    message.content.includes("discord.gg") ||
    message.content.includes("discord.me") ||
    message.content.includes("discord.io")
  ) {
    const adsprot = db.prepare("SELECT count(*) FROM adsprot WHERE guildid = ?").get(message.guild.id);
    if (!adsprot['count(*)']) {
      return;
    } else if (message.member.hasPermission("MANAGE_GUILD")) {
      return;
    } else if (message.channel.name.includes("ticket-")) return;
    message.delete();
    message.channel
      .send(
        `**Your message contained a link and it was deleted, <@${
              message.author.id
            }>**`
      )
      .then(msg => {
        msg.delete(10000);
      });
  }

  //balance
  if (message.author.bot) return;
  let balance;
  if (message.guild) {
    balance = client.getBalance.get(message.author.id, message.guild.id);
    if (!balance) {
      balance = {
        id: `${message.guild.id}-${message.author.id}`,
        user: message.author.id,
        guild: message.guild.id,
        balance: 100,
      };
    }
    let curBal = balance.balance;
    let coinAmt = Math.floor(Math.random() * 1) + 10;
    let baseAmt = Math.floor(Math.random() * 1) + 10;
    if (coinAmt === baseAmt) {
      if (!coinCooldown.has(message.author.id)) {
        balance.balance = curBal + coinAmt;
        client.setBalance.run(balance);
        coinCooldown.add(message.author.id);
        setTimeout(function () {
          coinCooldown.delete(message.author.id);
        }, coinCooldownSeconds * 1000);
      }
    }
  }


  //scores
  if (message.author.bot) return;
  let score;
  if (message.guild) {
    score = client.getScore.get(message.author.id, message.guild.id);
    if (!score) {
      score = {
        id: `${message.guild.id}-${message.author.id}`,
        user: message.author.id,
        guild: message.guild.id,
        points: 0,
        level: 1
      };
    }
    let xpAdd = Math.floor(Math.random() * 10) + 50;
    let curxp = score.points;
    let curlvl = score.level;
    let nxtLvl = score.level * 5000;
    score.points = curxp + xpAdd;
    if (nxtLvl <= score.points) {
      score.level = curlvl + 1;
      let lvlup = new Discord.RichEmbed()
        .setAuthor(`Congrats ${message.author.username}`, message.author.displayAvatarURL)
        .setTitle("You have leveled up!")
        .setThumbnail("https://i.imgur.com/lXeBiMs.png")
        .setColor(color)
        .addField("New Level", curlvl + 1);
      message.channel.send(lvlup).then(msg => {msg.delete(10000);});
    }
    client.setScore.run(score);
  }

  let prefix = prefixgrab.prefix;

  if (!message.content.startsWith(prefix)) return;

  // command hanler

  let commandfile = client.commands.get(cmd.slice(prefix.length));
  if (commandfile) commandfile.run(client, message, args, color);

  // logging

  if (logging === true) {
    if (!argresult || argresult === "") {
      const LoggingNoArgs = `[\x1b[36m${moment().format(
        "LLLL"
      )}\x1b[0m] Command ${cmd} was executed by \x1b[36m${
        message.author.tag
      }\x1b[0m (ID: \x1b[36m${message.author.id}\x1b[0m)`;
      console.log(LoggingNoArgs);
    } else {
      const LoggingArgs = `[\x1b[36m${moment().format(
        "LLLL"
      )}\x1b[0m] Command ${cmd} ${argresult} was executed by \x1b[36m${
        message.author.tag
      }\x1b[0m (ID: \x1b[36m${message.author.id}\x1b[0m)`;
      console.log(LoggingArgs);
    }
  }
  // logging command exectuion
  const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  const logembed = new Discord.RichEmbed()
    .setAuthor(message.author.tag, message.guild.iconURL)
    .setDescription(`**Used** ${cmd} **command in ${message.channel}**\n${cmd} ${argresult}`)
    .setColor(color)
    .setFooter(`ID: ${message.channel.id}`)
    .setTimestamp();
  client.channels.get(logs).send(logembed);
});