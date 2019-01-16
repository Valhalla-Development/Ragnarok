const Discord = require("discord.js");
const fs = require("fs");
const moment = require("moment");
const client = new Discord.Client();
const config = require("./Storage/config.json");
const prefixgen = config.prefix;
const logging = config.logging;
const color = config.color;
const SQLite = require('better-sqlite3')
const sql = new SQLite('./Storage/db/db.sqlite');

client.commands = new Discord.Collection();

function clean(text) {
  if (typeof (text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
    return text;
}

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

  client.user.setActivity(`${client.guilds.size} Guilds | ${prefixgen}help`, {
    type: "WATCHING"
  });

  client.on("guildCreate", guild => {
    //  when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`${client.guilds.size} Guilds | ${prefixgen}help`);
  });

  client.on("guildDelete", guild => {
    // when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`${client.guilds.size} Guilds | ${prefixgen}help`);
    // setprefix table
    const delpre = sql.prepare("SELECT count(*) FROM setprefix WHERE guildid = ?;").get(guild.id);
    if (delpre['count(*)']) {
      sql.prepare("DELETE FROM setprefix WHERE guildid = ?").run(guild.id);
    };
    // setwelcome table
    const delwel = sql.prepare("SELECT count(*) FROM setwelcome WHERE guildid = ?;").get(guild.id);
    if (delwel['count(*)']) {
      sql.prepare("DELETE FROM setwelcome WHERE guildid = ?").run(guild.id);
    };
    // profanity table
    const delpro = sql.prepare("SELECT count(*) FROM profanity WHERE guildid = ?;").get(guild.id);
    if (delpro['count(*)']) {
      sql.prepare("DELETE FROM profanity WHERE guildid = ?").run(guild.id);
    };
    // autorole table
    const delaut = sql.prepare("SELECT count(*) FROM autorole WHERE guildid = ?;").get(guild.id);
    if (delaut['count(*)']) {
      sql.prepare("DELETE FROM autorole WHERE guildid = ?").run(guild.id);
    };
    // scores table
    const delsco = sql.prepare("SELECT count(*) FROM scores WHERE guildid = ?;").get(guild.id);
    if (delsco['count(*)']) {
      sql.prepare("DELETE FROM scores WHERE guildid = ?").run(guild.id);
    };
    // adsprot table
    const delads = sql.prepare("SELECT count(*) FROM adsprot WHERE guildid = ?;").get(guild.id);
    if (delads['count(*)']) {
      sql.prepare("DELETE FROM adsprot WHERE guildid = ?").run(guild.id);
    };
    // logging table
    const dellog = sql.prepare("SELECT count(*) FROM logging WHERE guildid = ?;").get(guild.id);
    if (dellog['count(*)']) {
      sql.prepare("DELETE FROM logging WHERE guildid = ?").run(guild.id);
    };
  });


  // setprefix table
  const setprefix = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'setprefix';").get();
  if (!setprefix['count(*)']) {
    console.log('setprefix table created!')
    sql.prepare("CREATE TABLE setprefix (guildid TEXT PRIMARY KEY, prefix TEXT);").run();
    sql.prepare("CREATE UNIQUE INDEX idx_setprefix_id ON setprefix (guildid);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  };
  // setwelcome table
  const setwelcome = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'setwelcome';").get();
  if (!setwelcome['count(*)']) {
    console.log('setwelcome table created!')
    sql.prepare("CREATE TABLE setwelcome (guildid TEXT PRIMARY KEY, channel TEXT, title TEXT, author TEXT, description TEXT);").run();
    sql.prepare("CREATE UNIQUE INDEX idx_setwelcome_id ON setwelcome (guildid);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  };
  // profanity table
  const profanity = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'profanity';").get();
  if (!profanity['count(*)']) {
    console.log('profanity table created!')
    sql.prepare("CREATE TABLE profanity (guildid TEXT PRIMARY KEY, status TEXT);").run();
    sql.prepare("CREATE UNIQUE INDEX idx_profanity_id ON profanity (guildid);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  };
  // autorole table
  const autorole = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'autorole';").get();
  if (!autorole['count(*)']) {
    console.log('autorole table created!')
    sql.prepare("CREATE TABLE autorole (guildid TEXT PRIMARY KEY, role TEXT);").run();
    sql.prepare("CREATE UNIQUE INDEX idx_autorole_id ON autorole (guildid);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  };
  // scores table
  const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
  if (!table['count(*)']) {
    console.log('scores table created!')
    sql.prepare("CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER, level INTEGER);").run();
    sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON scores (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  };
  client.getScore = sql.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
  client.setScore = sql.prepare("INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);");
  // adsprot table
  const adsprottable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'adsprot';").get();
  if (!adsprottable['count(*)']) {
    console.log('adsprot table created!')
    sql.prepare("CREATE TABLE adsprot (guildid TEXT PRIMARY KEY, status TEXT);").run();
    sql.prepare("CREATE UNIQUE INDEX idx_adsprot_id ON adsprot (guildid);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  };
  // logging table
  const loggingtable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'logging';").get();
  if (!loggingtable['count(*)']) {
    console.log('logging table created!')
    sql.prepare("CREATE TABLE logging (guildid TEXT PRIMARY KEY, channel TEXT);").run();
    sql.prepare("CREATE UNIQUE INDEX idx_logging_id ON logging (guildid);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  };

  // logging
  client.on('messageDelete', async (message) => {
    const id = sql.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
    if (!id) return;
    const logs = id.channel
    if (!logs) return;
    const entry = await message.guild.fetchAuditLogs({
      type: 'MESSAGE_DELETE'
    }).then(audit => audit.entries.first())
    let user = ""
    if (entry.extra.channel.id === message.channel.id &&
      (entry.target.id === message.author.id) &&
      (entry.createdTimestamp > (Date.now() - 5000)) &&
      (entry.extra.count >= 1)) {
      user = entry.executor.username
    } else {
      user = message.author.username
    }
    const logembed = new Discord.RichEmbed()
      .setAuthor(user, message.author.displayAvatarURL)
      .setDescription(`**Message sent by <@${message.author.id}> deleted in <#${message.channel.id}>** \n ${message.content}`)
      .setColor(message.guild.member(client.user).displayHexColor)
      .setFooter(`ID: ${message.channel.id}`)
      .setTimestamp()
    client.channels.get(logs).send(logembed);
  });

});

// welcome

client.on("guildMemberAdd", member => {
  const Discord = require("discord.js");
  const setwelcome = sql.prepare(`SELECT * FROM setwelcome WHERE guildid = ${member.guild.id};`).get();
  if (!setwelcome) {
    return;
  } else {
    var title = setwelcome.title;
    var author = setwelcome.author;
    var description = setwelcome.description;
    var sendchannel = setwelcome.channel;
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
  const autoroletable = sql.prepare(`SELECT role FROM autorole WHERE guildid = ${member.guild.id};`).get();
  if (!autoroletable) return;
  const autorole = autoroletable.role
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
    const adsprot = sql.prepare("SELECT count(*) FROM adsprot WHERE guildid = ?").get(newMessage.guild.id);
    if (!adsprot['count(*)']) {
      return;
    } else if (newMessage.member.hasPermission("MANAGE_GUILD")) return;
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
  // profanity filter
  let swearwords = JSON.parse(
    fs.readFileSync("./Storage/swearwords.json", "utf8")
  );
  if (
    swearwords.words.some(word => newMessage.content.toLowerCase().includes(word))
  ) {
    const profanity = sql.prepare("SELECT count(*) FROM profanity WHERE guildid = ?").get(newMessage.guild.id);
    if (!profanity['count(*)']) {
      return;
    } else if (newMessage.member.hasPermission("MANAGE_GUILD")) return;
    newMessage.delete();
    newMessage.channel
      .send(
        `**Your message contained a blocked word and it was deleted, <@${
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
  })
  let embed = new Discord.RichEmbed()
    .setTitle(`Hello, I'm **Ragnarok**! Thanks for inviting me!`)
    .setDescription(`The prefix for all my commands is \`-\`, e.g: \`-help\`.`)
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


  // ads protection checks

  if (
    message.content.includes("https://") ||
    message.content.includes("http://") ||
    message.content.includes("discord.gg") ||
    message.content.includes("discord.me") ||
    message.content.includes("discord.io")
  ) {
    const adsprot = sql.prepare("SELECT count(*) FROM adsprot WHERE guildid = ?").get(message.guild.id);
    if (!adsprot['count(*)']) {
      return;
    } else if (message.member.hasPermission("MANAGE_GUILD")) return;
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

  // profanity filter
  let swearwords = JSON.parse(
    fs.readFileSync("./Storage/swearwords.json", "utf8")
  );
  if (
    swearwords.words.some(word => message.content.toLowerCase().includes(word))
  ) {
    const profanity = sql.prepare("SELECT count(*) FROM profanity WHERE guildid = ?").get(message.guild.id);
    if (!profanity['count(*)']) {
      return;
    } else if (message.member.hasPermission("MANAGE_GUILD")) return;
    message.delete();
    message.channel
      .send(
        `**Your message contained a blocked word and it was deleted, <@${
              message.author.id
            }>**`
      )
      .then(msg => {
        msg.delete(10000);
      });
  }

  // points

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
      }
    }
    score.points++;
    const curLevel = Math.floor(0.1 * Math.sqrt(score.points));
    if (score.level < curLevel) {
      score.level++;
      message.reply(`you just advanced to level **${curLevel}**! Ain't that dandy?`);
    }
    client.setScore.run(score);
  };

  // custom prefixes
  const prefixes = sql.prepare("SELECT count(*) FROM setprefix WHERE guildid = ?").get(message.guild.id);
  if (!prefixes['count(*)']) {
    const insert = sql.prepare("INSERT INTO setprefix (guildid, prefix) VALUES (@guildid, @prefix);");
    insert.run({
      guildid: `${message.guild.id}`,
      prefix: '-'
    });
    return;
  }

  const prefixgrab = sql.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);

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
});