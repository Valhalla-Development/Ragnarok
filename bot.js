const Discord = require("discord.js");
const fs = require("fs");
const moment = require("moment");
const client = new Discord.Client();
const config = require("./Storage/config.json");
const prefixgen = config.prefix;
const logging = config.logging;
const color = config.color;

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

  client.user.setActivity(`${prefixgen}help`, { type: "LISTENING" });
});

setInterval(() => {
  console.log(`[Ragnarok] Bot's ping: ${Math.round(client.ping)}`);
}, 30000);

// welcome
var welcomePath = "./Storage/welcome.json";
var welcomeRead = fs.readFileSync(welcomePath);
var welcomeFile = JSON.parse(welcomeRead);

client.on("guildMemberAdd", member => {
  const Discord = require("discord.js");
  var guildId = member.guild.id;
  if (!welcomeFile[guildId]) {
    return;
  } else {
    let welcome = welcomeFile[guildId];
    var title = welcome.title;
    var author = welcome.author;
    var description = welcome.description;
    var sendchannel = welcome.channel;
    let embed = new Discord.RichEmbed()
      .setTitle(`${title}`)
      .setAuthor(`${author}`, member.user.avatarURL)
      .setColor(3447003)
      .setDescription(`${description} ${member.user}`)
      .setThumbnail(member.user.avatarURL);
    client.channels.get(sendchannel).send({ embed });
  }
});

// autorole
var jsonPath = "./Storage/autorole.json";
var jsonRead = fs.readFileSync(jsonPath);
var jsonFile = JSON.parse(jsonRead);

client.on("guildMemberAdd", member => {
  var guildId = member.guild.id;
  if (!jsonFile[guildId]) {
    return;
  } else {
    let autoRole = jsonFile[guildId];
    let myRole = member.guild.roles.find(role => role.name === autoRole);
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
    // reading the file

    fs.readFile("./Storage/ads.json", "utf8", (err, data) => {
      // if err
      if (err) throw err;
      const db = JSON.parse(data);
      if (db[newMessage.guild.id]) {
        if (newMessage.member.hasPermission("MANAGE_GUILD")) return;
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
  }
});

// client message event

client.on("message", message => {
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
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
    // reading the file

    fs.readFile("./Storage/ads.json", "utf8", (err, data) => {
      // if err
      if (err) throw err;
      const db = JSON.parse(data);
      if (db[message.guild.id]) {
        if (message.member.hasPermission("MANAGE_GUILD")) return;
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
    });
  }

  // profanity filter
  let swearwords = JSON.parse(
    fs.readFileSync("./Storage/swearwords.json", "utf8")
  );
  if (
    swearwords.words.some(word => message.content.toLowerCase().includes(word))
  ) {
    fs.readFile("./Storage/profanity.json", "utf8", (err, data) => {
      if (err) throw err;
      const db = JSON.parse(data);
      if (db[message.guild.id]) {
        if (message.member.hasPermission("MANAGE_GUILD")) return;
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
    });
  }

  // custom prefixes
  let prefixes = JSON.parse(fs.readFileSync("./Storage/prefixes.json", "utf8"));
  if (!prefixes[message.guild.id] || prefixes[message.guild.id] === undefined) {
    prefixes[message.guild.id] = {
      prefixes: ">"
    };
    fs.writeFile(
      "./Storage/prefixes.json",
      JSON.stringify(prefixes, null, 2),
      err => {
        if (err) console.log(err);
      }
    );
  }

  let prefix = prefixes[message.guild.id].prefixes;

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