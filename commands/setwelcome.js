const Discord = require("discord.js");
const fs = require("fs");
let prefixes = JSON.parse(fs.readFileSync("./Storage/prefixes.json", "utf8"));

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);
  let step1 = language["setwelcome"].step1;
  const step1r = step1.replace(
    "${prefix}",
    prefixes[message.guild.id].prefixes
  );

  if((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== '151516555757223936')))
    return message.channel.send(`${language["setwelcome"].noPermission}`);

  message.channel
    .send(`${step1r}`)
    .then(() => {
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

          const wchan = message.guild.channels.find(
            "name",
            collected.first().content
          );
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

          const thing = JSON.parse(
            fs.readFileSync("./Storage/welcome.json", "utf8")
          );

          thing[message.guild.id] = {
            channel: message.guild.channels.find(
              "name",
              collected.first().content
            ).id
          };

          fs.writeFile(
            "./Storage/welcome.json",
            JSON.stringify(thing, null, 2),
            err => {
              if (err) throw err;
            }
          );

          setTimeout(() => {
            const chan = JSON.parse(
              fs.readFileSync("./Storage/welcome.json", "utf8")
            );

            message.channel
              .send(`${language["setwelcome"].step2}`)
              .then(() => {
                message.channel
                  .awaitMessages(
                    response => response.author.id === message.author.id,
                    {
                      max: 1,
                      time: 30000,
                      errors: ["time"]
                    }
                  )

                  .then(collected => {
                    if (collected.first().content === "cancel") {
                      message.channel.send(
                        `${language["setwelcome"].canceled}`
                      );
                      return;
                    }

                    const thing = JSON.parse(
                      fs.readFileSync("./Storage/welcome.json", "utf8")
                    );

                    thing[message.guild.id].title = collected.first().content;

                    fs.writeFile(
                      "./Storage/welcome.json",
                      JSON.stringify(thing, null, 2),
                      err => {
                        if (err) throw err;
                      }
                    );

                    message.channel
                      .send(`${language["setwelcome"].step3}`)
                      .then(() => {
                        message.channel
                        .awaitMessages(
                          response => response.author.id === message.author.id,
                          {
                            max: 1,
                            time: 30000,
                            errors: ["time"]
                          }
                        )

                        .then(collected => {
                          if (collected.first().content === "cancel") {
                            message.channel.send(
                              `${language["setwelcome"].canceled}`
                            );
                            return;
                          }

                          const thing = JSON.parse(
                            fs.readFileSync("./Storage/welcome.json", "utf8")
                          );

                          thing[message.guild.id].author = collected.first().content;

                          fs.writeFile(
                            "./Storage/welcome.json",
                            JSON.stringify(thing, null, 2),
                            err => {
                              if (err) throw err;
                            }
                          );
                          
                          message.channel
                            .send(`${language["setwelcome"].step4}`)
                            .then(() => {
                              message.channel
                              .awaitMessages(
                                response => response.author.id === message.author.id,
                                {
                                  max: 1,
                                  time: 30000,
                                  errors: ["time"]
                                }
                              )

                              .then(collected => {
                                if (collected.first().content === "cancel") {
                                  message.channel.send(
                                    `${language["setwelcome"].canceled}`
                                  );
                                  return;
                                }

                                const thing = JSON.parse(
                                  fs.readFileSync("./Storage/welcome.json", "utf8")
                                );

                                thing[message.guild.id].description = collected.first().content;

                                message.channel.send(`${language["setwelcome"].finished}`);

                                fs.writeFile(
                                  "./Storage/welcome.json",
                                  JSON.stringify(thing, null, 2),
                                  err => {
                                    if (err) throw err;
                                  }
                                );


                              })
                            })





                        })
                      })
                  });
              })
              .catch(() => {
                message.channel.send(`${language["setwelcome"].canceled}`);
              });
          }, 1000);
        });
    })
    .catch(e => {
      console.log(e);
      message.channel.send("**:x: | Setup canceled.**");
    });
};

module.exports.help = {
  name: "setwelcome"
};
