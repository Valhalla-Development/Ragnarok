const {
    prefix,
    color,
    logging
} = require("../../storage/config.json");
const moment = require("moment");
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const {
    MessageEmbed
} = require("discord.js");
let coinCooldown = new Set();
const coinCooldownSeconds = 5;

module.exports = async (bot, message) => {
    if (message.author.bot || message.channel.type === "dm") return;

    const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);
    let prefixcommand = prefixgrab.prefix;
    let args = message.content.slice(prefixcommand.length).trim().split(/ +/g);
    let messageArray = message.content.split(" ");
    let dadArgs = messageArray.slice(1);
    let oargresult = dadArgs.join(" ");
    let command = messageArray[0].toLowerCase();
    let cmd = args.shift().toLowerCase();
    if (!message.content.startsWith(prefixcommand)) return;
    let commandfile = bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd));
    if (commandfile) commandfile.run(bot, message, args, color);

    //Dad Bot
    if (message.content.toLowerCase().startsWith('im ') || message.content.toLowerCase().startsWith('i\'m ')) {
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
            message.channel.send(`Hi ${oargresult}, I\'m Dad!`);
        }
    }

    //Custom prefixes
    const prefixes = db.prepare("SELECT count(*) FROM setprefix WHERE guildid = ?").get(message.guild.id);
    if (!prefixes['count(*)']) {
        const insert = db.prepare("INSERT INTO setprefix (guildid, prefix) VALUES (@guildid, @prefix);");
        insert.run({
            guildid: `${message.guild.id}`,
            prefix: '-'
        });
        return;
    }

    //Prefix command

    if (command === prefix + 'prefix') {
        let embed = new MessageEmbed()
            .setColor(color)
            .setDescription(`This server's prefix is: \`${prefixcommand}\``);
        message.channel.send(embed);
    }

    //Ads protection checks
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

    //Balance
    if (message.author.bot) return;
    let balance;
    if (message.guild) {
        balance = bot.getBalance.get(message.author.id, message.guild.id);
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
                bot.setBalance.run(balance);
                coinCooldown.add(message.author.id);
                setTimeout(function () {
                    coinCooldown.delete(message.author.id);
                }, coinCooldownSeconds * 1000);
            }
        }
    }

    //Scores
    if (message.author.bot) return;
    let score;
    if (message.guild) {
        score = bot.getScore.get(message.author.id, message.guild.id);
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
            let lvlup = new MessageEmbed()
                .setAuthor(`Congrats ${message.author.username}`, message.author.displayAvatarURL)
                .setTitle("You have leveled up!")
                .setThumbnail("https://i.imgur.com/lXeBiMs.png")
                .setColor(color)
                .addField("New Level", curlvl + 1);
            message.channel.send(lvlup).then(msg => {
                msg.delete(10000);
            });
        }
        bot.setScore.run(score);
    }


    //Logging
    if (logging === true) {
        if (!oargresult || oargresult === "") {
            const LoggingNoArgs = `[\x1b[36m${moment().format(
            "LLLL"
          )}\x1b[0m] Command ${prefix}${cmd} was executed by \x1b[36m${
            message.author.tag
          }\x1b[0m (ID: \x1b[36m${message.author.id}\x1b[0m)`;
            console.log(LoggingNoArgs);
        } else {
            const LoggingArgs = `[\x1b[36m${moment().format(
            "LLLL"
          )}\x1b[0m] Command ${prefix}${cmd} ${oargresult} was executed by \x1b[36m${
            message.author.tag
          }\x1b[0m (ID: \x1b[36m${message.author.id}\x1b[0m)`;
            console.log(LoggingArgs);
        }
    }
    //Logging command exectuion
    const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
    if (!id) return;
    const logs = id.channel;
    if (!logs) return;
    const logembed = new MessageEmbed()
        .setAuthor(message.author.tag, message.guild.iconURL)
        .setDescription(`**Used** ${cmd} **command in ${message.channel}**\n${cmd} ${oargresult}`)
        .setColor(color)
        .setFooter(`ID: ${message.channel.id}`)
        .setTimestamp();
    bot.channels.get(logs).send(logembed);

};