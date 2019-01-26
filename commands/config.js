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


    // config help

    if (args[0] === undefined) {
        message.channel.send("available commands etc.: boi do it you lazy fuck")
    };
    
    // profanity

    if (args[0] === "profanity") {
        // perms checking

        if ((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID))) {
            message.channel.send(`${language["profanity"].noPermission}`);
            return;
        };

        // preparing count

        client.getTable = db.prepare("SELECT * FROM profanity WHERE guildid = ?");
        let status;
        if (message.guild.id) {
            status = client.getTable.get(message.guild.id);

            if (args[1] === "on") {
                // if already on
                if (status) {
                    let alreadyOnMessage = language["profanity"].alreadyOn;
                    const alreadyOn = alreadyOnMessage.replace(
                        "${prefix}",
                        prefix
                    );
                    message.channel.send(`${alreadyOn}`);
                    return;
                } else {
                    const insert = db.prepare("INSERT INTO profanity (guildid, status) VALUES (@guildid, @status);");
                    insert.run({
                        guildid: `${message.guild.id}`,
                        status: 'on'
                    });
                    message.channel.send(`${language["profanity"].turnedOn}`);
                };

                // if args = off
            } else if (args[1] === "off") {
                // if already off
                if (!status) {
                    let alreadyOffMessage = language["profanity"].alreadyOff;
                    const alreadyOff = alreadyOffMessage.replace(
                        "${prefix}",
                        prefix
                    );
                    message.channel.send(`${alreadyOff}`);
                    return;
                } else {
                    db.prepare("DELETE FROM profanity WHERE guildid = ?").run(message.guild.id);
                    message.channel.send(`${language["profanity"].turnedOff}`);
                    return;
                }

            } else if (args[1] !== "off" || args[1] !== "on") {
                let incorrectUsageMessage = language["profanity"].incorrectUsage;
                const incorrectUsage = incorrectUsageMessage.replace(
                    "${prefix}",
                    prefix
                );

                message.channel.send(`${incorrectUsage}`);
                return;
            }
        };
    };

    // adsprot
    if (args[0] === "adsprot") {
        // perms checking

        if ((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID))) {
            let invalidpermsembed = new Discord.RichEmbed()
                .setColor(`36393F`)
                .setDescription(`${language["adsprot"].noPermission}`)
            message.channel.send(invalidpermsembed);
            return;
        };

        // preparing count

        client.getTable = db.prepare("SELECT * FROM adsprot WHERE guildid = ?");
        let status;
        if (message.guild.id) {
            status = client.getTable.get(message.guild.id);

            if (args[1] === "on") {
                // if already on
                if (status) {
                    let alreadyOnMessage = language["adsprot"].alreadyOn;
                    const alreadyOn = alreadyOnMessage.replace(
                        "${prefix}",
                        prefix
                    );
                    let alreadyonembed = new Discord.RichEmbed()
                        .setColor(`36393F`)
                        .setDescription(`${alreadyOn}`)
                    message.channel.send(alreadyonembed);
                    return;
                } else {
                    const insert = db.prepare("INSERT INTO adsprot (guildid, status) VALUES (@guildid, @status);");
                    insert.run({
                        guildid: `${message.guild.id}`,
                        status: 'on'
                    });
                    let turnonembed = new Discord.RichEmbed()
                        .setColor(`36393F`)
                        .setDescription(`${language["adsprot"].turnedOn}`);
                    message.channel.send(turnonembed);
                };

                // if args = off
            } else if (args[1] === "off") {
                // if already off
                if (!status) {
                    let alreadyOffMessage = language["adsprot"].alreadyOff;
                    const alreadyOff = alreadyOffMessage.replace(
                        "${prefix}",
                        prefix
                    );
                    let alreadyoffembed = new Discord.RichEmbed()
                        .setColor(`36393F`)
                        .setDescription(`${alreadyOff}`)
                    message.channel.send(alreadyoffembed);
                    return;
                } else {
                    db.prepare("DELETE FROM adsprot WHERE guildid = ?").run(message.guild.id);
                    let turnedoffembed = new Discord.RichEmbed()
                        .setColor(`36393F`)
                        .setDescription(`${language["adsprot"].turnedOff}`)
                    message.channel.send(turnedoffembed);
                    return;
                }

            } else if (args[1] !== "off" || args[1] !== "on") {
                let incorrectUsageMessage = language["adsprot"].incorrectUsage;
                const incorrectUsage = incorrectUsageMessage.replace(
                    "${prefix}",
                    prefix
                );
                let incorrectembed = new Discord.RichEmbed()
                    .setColor(`36393F`)
                    .setDescription(`${incorrectUsage}`)
                message.channel.send(incorrectembed);
                return;
            }
        };
    };

    // autorole
    if (args[0] === "autorole") {

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

            if (!args[1]) {
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
            } else if (args[1] === 'off') {
                db.prepare("DELETE FROM autorole WHERE guildid = ?").run(message.guild.id);
                let turnoffembed = new Discord.RichEmbed()
                    .setColor(`36393F`)
                    .setDescription(`${language["autorole"].turnedOff}`)
                message.channel.send(turnoffembed);
                return;
            }
            if (!message.guild.roles.some(r => [`${args[1]}`].includes(r.name))) return message.channel.send(`:x: **That role does not exist! Roles are case sensitive.**`); {}
            if (role) {
                const update = db.prepare("UPDATE autorole SET role = (@role) WHERE guildid = (@guildid);");
                update.run({
                    guildid: `${message.guild.id}`,
                    role: `${args[1]}`
                });
                let autoroleUpdateMessage = language["autorole"].updateRole;
                const roleupdate = autoroleUpdateMessage.replace("${autorole}", args[1]);
                let updatedembed = new Discord.RichEmbed()
                    .setColor(`36393F`)
                    .setDescription(`${roleupdate}`)
                message.channel.send(updatedembed);
                return;
            } else {
                const insert = db.prepare("INSERT INTO autorole (guildid, role) VALUES (@guildid, @role);");
                insert.run({
                    guildid: `${message.guild.id}`,
                    role: `${args[1]}`
                });
                let autoroleSetMessage = language["autorole"].roleSet;
                const roleSet = autoroleSetMessage.replace("${autorole}", args[1]);
                let setembed = new Discord.RichEmbed()
                    .setColor(`36393F`)
                    .setDescription(`${roleSet}`)
                message.channel.send(setembed);
                return;
            };
        };
    };

    // logging

    if (args[0] === "logging") {

        if ((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID)))
            return message.channel.send(`${language["logging"].noPermission}`);

        client.getTable = db.prepare("SELECT * FROM logging WHERE guildid = ?");

        const lchan = message.mentions.channels.first();

        let status;
        if (message.guild.id) {
            status = client.getTable.get(message.guild.id);


            if (args[1] === undefined) {
                message.channel.send(":x: | **Please mention a channel!**");
                return;
            };

            if (args[1] === 'off') { // to turn logging off
                if (!status) {
                    message.channel.send(":x: | **Logging is already disabled!**");
                    return;
                } else {
                    message.channel.send(":white_check_mark: | **Logging disabled!**");
                    db.prepare("DELETE FROM logging WHERE guildid = ?").run(message.guild.id);
                    return;
                };
            } else if (!lchan) {
                message.channel.send(`${language["logging"].invalidChannel}`);
                return;
            } else if (lchan.type === "voice" || lchan.type === "category") {
                message.channel.send(`${language["logging"].invalidTextChannel}`);
                return;
            } else if (!status) {
                const insert = db.prepare("INSERT INTO logging (guildid, channel) VALUES (@guildid, @channel);");
                insert.run({
                    guildid: `${message.guild.id}`,
                    channel: `${lchan.id}`
                });
                message.channel.send(`:white_check_mark: | **Logging set to ${lchan}**`);
                return;
            } else {
                const update = db.prepare("UPDATE logging SET channel = (@channel) WHERE guildid = (@guildid);");
                update.run({
                    guildid: `${message.guild.id}`,
                    channel: `${lchan.id}`
                });
                message.channel.send(`:white_check_mark: | ** Logging updated to ${lchan}**`);
                return;
            };
        };
    };

    // setprefix

    if (args[0] === "prefix") {

        const talkedRecently = new Set();

        if (talkedRecently.has(message.author.id)) {
            message.channel.send(
                ":x: | **Wait 1 minute before changing the prefix again.**"
            );
        } else {
            talkedRecently.add(message.author.id);
            setTimeout(() => {
                talkedRecently.delete(message.author.id);
            }, 60000);
        }

        let language = require(`../messages/messages_en-US.json`);

        if ((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID)))
            return message.channel.send(`${language["setprefix"].noPermission}`);

        client.getTable = db.prepare("SELECT * FROM setprefix WHERE guildid = ?");
        let prefix;
        if (message.guild.id) {
            prefix = client.getTable.get(message.guild.id);
        };

        if (args[1] === "off") {
            const off = db.prepare("UPDATE setprefix SET prefix = ('-') WHERE guildid = (@guildid);")
            off.run({
                guildid: `${message.guild.id}`,
            });
            message.channel.send(':white_check_mark: | **Custom prefix disabled!**')
            return;
        }
        if (
            args[1] === "[" ||
            args[1] === "{" ||
            args[1] === "]" ||
            args[1] === "}" ||
            args[1] === ":"
        ) {
            message.channel.send(`${language["setprefix"].blacklistedPrefix}`);
            return;
        }

        if (!args[1])
            return message.channel.send(`${language["setprefix"].incorrectUsage}`);

        if (prefix) {
            const update = db.prepare("UPDATE setprefix SET prefix = (@prefix) WHERE guildid = (@guildid);");
            update.run({
                guildid: `${message.guild.id}`,
                prefix: `${args[1]}`
            });
            message.channel.send(':white_check_mark: | **Prefix updated!**');
            return;
        } else {
            const insert = db.prepare("INSERT INTO setprefix (guildid, prefix) VALUES (@guildid, @prefix);");
            insert.run({
                guildid: `${message.guild.id}`,
                prefix: `${args[1]}`
            });
            message.channel.send(':white_check_mark: | **Prefix set!**');
            return;
        };
    };

    // setwelcome

    if (args[0] === "welcome") {

        const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);

        let prefix = prefixgrab.prefix;

        let language = require(`../messages/messages_en-US.json`);
        let step1 = language["setwelcome"].step1;
        const step1r = step1.replace(
            "${prefix}",
            prefix
        );

        if ((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID)))
            return message.channel.send(`${language["setwelcome"].noPermission}`);

        client.getTable = db.prepare("SELECT * FROM setwelcome WHERE guildid = ?");
        let status;
        if (message.guild.id) {
            status = client.getTable.get(message.guild.id);


            if (args[1] === 'off') {
                db.prepare("DELETE FROM setwelcome WHERE guildid = ?").run(message.guild.id);
                message.channel.send(':white_check_mark: | **Welcome message disabled!**');
                return;
            };
            message.channel.send(`${step1r}`).then(() => {
                    message.channel
                        .awaitMessages(response => response.author.id === message.author.id, {
                            max: 1,
                            time: 30000,
                            errors: ["time"]
                        })

                        .then(collected => {
                            if (collected.first().content === "cancel") {
                                message.channel.send(`${language["setwelcome"].canceled}`);
                                return;
                            }

                            const wchan = message.guild.channels.find("name", collected.first().content);
                            if (!wchan || wchan === undefined) {
                                message.channel.send(`${language["setwelcome"].invalidChannel}`);
                                return;
                            }

                            if (wchan.type === "voice" || wchan.type === "category") {
                                message.channel.send(
                                    `${language["setwelcome"].invalidTextChannel}`
                                );
                                return;
                            }

                            if (!wchan.permissionsFor(message.guild.me).has("SEND_MESSAGES")) {
                                message.channel.send(
                                    `${language["setwelcome"].noMessagePermission}`
                                );
                                return;
                            }

                            client.getTable = db.prepare("SELECT * FROM setwelcome WHERE guildid = ?");
                            let status;
                            if (message.guild.id) {
                                status = client.getTable.get(message.guild.id);

                                if (!status) {
                                    const chid = message.guild.channels.find("name", collected.first().content).id
                                    const insertch = db.prepare("INSERT INTO setwelcome (guildid, channel) VALUES (@guildid, @channel);");
                                    insertch.run({
                                        guildid: `${message.guild.id}`,
                                        channel: `${chid}`
                                    });
                                } else {
                                    const chid = message.guild.channels.find("name", collected.first().content).id
                                    const updatech = db.prepare("UPDATE setwelcome SET channel = (@channel) WHERE guildid = (@guildid);");
                                    updatech.run({
                                        guildid: `${message.guild.id}`,
                                        channel: `${chid}`
                                    });
                                }
                            }

                            setTimeout(() => {

                                message.channel
                                    .send(`${language["setwelcome"].step2}`)
                                    .then(() => {
                                        message.channel
                                            .awaitMessages(
                                                response => response.author.id === message.author.id, {
                                                    max: 1,
                                                    time: 30000,
                                                    errors: ["time"]
                                                }
                                            )

                                            .then(collected => {
                                                if (collected.first().content === "cancel") {
                                                    db.prepare("DELETE FROM setwelcome WHERE guildid = ?").run(message.guild.id);
                                                    message.channel.send(
                                                        `${language["setwelcome"].canceled}`
                                                    );
                                                    return;
                                                }

                                                const title = collected.first().content;
                                                const updateit = db.prepare("UPDATE setwelcome SET title = (@title) WHERE guildid = (@guildid);");
                                                updateit.run({
                                                    guildid: `${message.guild.id}`,
                                                    title: `${title}`
                                                });

                                                message.channel
                                                    .send(`${language["setwelcome"].step3}`)
                                                    .then(() => {
                                                        message.channel
                                                            .awaitMessages(
                                                                response => response.author.id === message.author.id, {
                                                                    max: 1,
                                                                    time: 30000,
                                                                    errors: ["time"]
                                                                }
                                                            )

                                                            .then(collected => {
                                                                if (collected.first().content === "cancel") {
                                                                    db.prepare("DELETE FROM setwelcome WHERE guildid = ?").run(message.guild.id);
                                                                    message.channel.send(
                                                                        `${language["setwelcome"].canceled}`
                                                                    );
                                                                    return;
                                                                }

                                                                const author = collected.first().content;
                                                                const updateaut = db.prepare("UPDATE setwelcome SET author = (@author) WHERE guildid = (@guildid);");
                                                                updateaut.run({
                                                                    guildid: `${message.guild.id}`,
                                                                    author: `${author}`
                                                                });

                                                                message.channel
                                                                    .send(`${language["setwelcome"].step4}`)
                                                                    .then(() => {
                                                                        message.channel
                                                                            .awaitMessages(
                                                                                response => response.author.id === message.author.id, {
                                                                                    max: 1,
                                                                                    time: 30000,
                                                                                    errors: ["time"]
                                                                                }
                                                                            )

                                                                            .then(collected => {
                                                                                if (collected.first().content === "cancel") {
                                                                                    db.prepare("DELETE FROM setwelcome WHERE guildid = ?").run(message.guild.id);
                                                                                    message.channel.send(
                                                                                        `${language["setwelcome"].canceled}`
                                                                                    );
                                                                                    return;
                                                                                }

                                                                                const description = collected.first().content;
                                                                                const updatedes = db.prepare("UPDATE setwelcome SET description = (@description) WHERE guildid = (@guildid);");
                                                                                updatedes.run({
                                                                                    guildid: `${message.guild.id}`,
                                                                                    description: `${description}`
                                                                                });

                                                                                message.channel.send(`${language["setwelcome"].finished}`);

                                                                            })
                                                                    })
                                                            })
                                                    })
                                            });
                                    })
                                    .catch(() => {
                                        message.channel.send(`${language["setwelcome"].canceled}`);
                                        db.prepare("DELETE FROM setwelcome WHERE guildid = ?").run(message.guild.id);
                                    });
                            }, 1000);
                        });
                })
                .catch(e => {
                    console.log(e);
                    db.prepare("DELETE FROM setwelcome WHERE guildid = ?").run(message.guild.id);
                    message.channel.send("**:x: | Setup canceled.**");
                });
        };
    };
};

module.exports.help = {
    name: "config"
};