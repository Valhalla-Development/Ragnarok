const Discord = require("discord.js");
const SQLite = require('better-sqlite3')
const db = new SQLite('./Storage/db/db.sqlite');
const fs = require("fs");
const config = JSON.parse(
  fs.readFileSync("./Storage/config.json", "utf8")
);

module.exports.run = async (client, message, args, color) => {
  let prefixes = JSON.parse(fs.readFileSync("./Storage/prefixes.json", "utf8"));
  let language = require(`../messages/messages_en-US.json`);
  let step1 = language["setwelcome"].step1;
  const step1r = step1.replace(
    "${prefix}",
    prefixes[message.guild.id].prefixes
  );

  if ((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID)))
    return message.channel.send(`${language["setwelcome"].noPermission}`);

  client.getTable = db.prepare("SELECT * FROM setwelcome WHERE guildid = ?");
  let status;
  if (message.guild.id) {
    status = client.getTable.get(message.guild.id);


    if (args[0] === 'off') {
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

              const wchan = message.guild.channels.find("name",collected.first().content);
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

                const chid = message.guild.channels.find("name", collected.first().content).id
                const insertch = db.prepare("INSERT INTO setwelcome (guildid, channel) VALUES (@guildid, @channel);");
                insertch.run({
                  guildid: `${message.guild.id}`,
                  channel: `${chid}`
                });

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
        message.channel.send("**:x: | Setup canceled.**");
      });
  };
};

module.exports.help = {
  name: "setwelcome"
};