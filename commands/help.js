const Discord = require("discord.js");
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/db/db.sqlite');
const fs = require("fs");

module.exports.run = async (client, message, args, color) => {

  setTimeout(() => {
    const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);

    let prefix = prefixgrab.prefix;

    switch (args[0]) {
      case "8ball":
        const ballHelp = new Discord.RichEmbed()
          .setAuthor("8ball Command", client.user.avatarURL)
          .setDescription("Question the mighty 8Ball!")
          .addField(
            "Usage",
            `${prefix}8ball <question>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: ballHelp
          });
          return;
        }

        message.channel.send({
          embed: ballHelp
        });
        break;
      case "poll":
        const pollHelp = new Discord.RichEmbed()
          .setAuthor("Poll Command", client.user.avatarURL)
          .setDescription("Starts a poll")
          .addField(
            "Usage",
            `${prefix}poll <question>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: pollHelp
          });
          return;
        }

        message.channel.send({
          embed: pollHelp
        });
        break;
      case "level":
        const level = new Discord.RichEmbed()
          .setAuthor("Level Command", client.user.avatarURL)
          .setDescription("Display current level")
          .addField(
            "Usage",
            `${prefix}level`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: level
          });
          return;
        }

        message.channel.send({
          embed: level
        });
        break;
      case "remindme":
        const remindmeHelp = new Discord.RichEmbed()
          .setAuthor("Remindme Command", client.user.avatarURL)
          .setDescription("Reminds you with args given")
          .addField(
            "Usage",
            `${prefix}remindme <time> <message> [Example: /remindme 15min example]`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: remindmeHelp
          });
          return;
        }

        message.channel.send({
          embed: remindmeHelp
        });
        break;
      case "rolemenu":
        const rolemenu = new Discord.RichEmbed()
          .setAuthor("Rolemenu Command", client.user.avatarURL)
          .setDescription("Displays the rolemenu")
          .addField(
            "Usage",
            `${prefix}rolemenu`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: rolemenu
          });
          return;
        }

        message.channel.send({
          embed: rolemenu
        });
        break;
      case "avatar":
        const avatar = new Discord.RichEmbed()
          .setAuthor("Avatar Command", client.user.avatarURL)
          .setDescription("Displays avatar of specified user")
          .addField(
            "Usage",
            `${prefix}avatar <@user>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: avatar
          });
          return;
        }

        message.channel.send({
          embed: avatar
        });
        break;
      case "invite":
        const invite = new Discord.RichEmbed()
          .setAuthor("Invite Command", client.user.avatarURL)
          .setDescription("Sends a link to invite the bot to your own guild")
          .addField(
            "Usage",
            `${prefix}invite`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: invite
          });
          return;
        }

        message.channel.send({
          embed: invite
        });
        break;
      case "rename":
        const rename = new Discord.RichEmbed()
          .setAuthor("Rename Command", client.user.avatarURL)
          .setDescription("Renames a ticket")
          .addField(
            "Usage", `**-**From outside a ticket: ${prefix}rename [ticketid] [newname]\n**-**From inside a ticket: ${prefix}rename [newnamen]\n\n**ID is the last 7 characters of a ticket channel**`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: rename
          });
          return;
        }

        message.channel.send({
          embed: rename
        });
        break;
      case "new":
        const newTicket = new Discord.RichEmbed()
          .setAuthor("New Command", client.user.avatarURL)
          .setDescription("Creates a ticket")
          .addField(
            "Usage", `${prefix}new`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: newTicket
          });
          return;
        }

        message.channel.send({
          embed: newTicket
        });
        break;
      case "forceclose":
        const forceclose = new Discord.RichEmbed()
          .setAuthor("Forceclose Command", client.user.avatarURL)
          .setDescription("Forcecloses a ticket")
          .addField(
            "Usage", `**-**From outside a ticket: ${prefix}forceclose [ticketid]\n**-**From inside a ticket: ${prefix}forceclose\n\n**ID is the last 7 characters of a ticket channel**`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: forceclose
          });
          return;
        }

        message.channel.send({
          embed: forceclose
        });
        break;
      case "add":
        const add = new Discord.RichEmbed()
          .setAuthor("Add Command", client.user.avatarURL)
          .setDescription("Adds a user to the ticket")
          .addField(
            "Usage", `**-**From outside a ticket: ${prefix}add [@user] [ticketid]\n**-**From inside a ticket: ${prefix}add [@user]\n\n**ID is the last 7 characters of a ticket channel**`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: add
          });
          return;
        }

        message.channel.send({
          embed: add
        });
        break;
      case "ticket":
        const ticket = new Discord.RichEmbed()
          .setAuthor("Ticket Command", client.user.avatarURL)
          .setDescription("Displays all available ticket commands")
          .addField(
            "Usage", `${prefix}ticket`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: ticket
          });
          return;
        }

        message.channel.send({
          embed: ticket
        });
        break;
      case "close":
        const close = new Discord.RichEmbed()
          .setAuthor("Close Command", client.user.avatarURL)
          .setDescription("Closes a ticket")
          .addField(
            "Usage", `${prefix}close`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: close
          });
          return;
        }

        message.channel.send({
          embed: close
        });
        break;
      case "remove":
        const remove = new Discord.RichEmbed()
          .setAuthor("Remove Command", client.user.avatarURL)
          .setDescription("Remove a ticket")
          .addField(
            "Usage", `**-**From outside a ticket: ${prefix}remove [@user] [ticketid]\n**-**From inside a ticket: ${prefix}remove [@user]\n\n**ID is the last 7 characters of a ticket channel**`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: remove
          });
          return;
        }

        message.channel.send({
          embed: remove
        });
        break;
      case "report":
        const reportHelp = new Discord.RichEmbed()
          .setAuthor("Report Command", client.user.avatarURL)
          .setDescription("Reports the specified user")
          .addField(
            "Usage",
            `${prefix}report <@user> <reason>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: reportHelp
          });
          return;
        }

        message.channel.send({
          embed: reportHelp
        });
        break;
      case "ban":
        const banHelp = new Discord.RichEmbed()
          .setAuthor("Ban Command", client.user.avatarURL)
          .setDescription("Ban the mentioned user")
          .addField(
            "Usage",
            `${prefix}ban <@user> <reason>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: banHelp
          });
          return;
        }

        message.channel.send({
          embed: banHelp
        });
        break;
      case "balance":
        const balance = new Discord.RichEmbed()
          .setAuthor("Balance Command", client.user.avatarURL)
          .setDescription("Displays your balance")
          .addField(
            "Usage",
            `${prefix}balance`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: balance
          });
          return;
        }

        message.channel.send({
          embed: balance
        });
        break;
      case "website":
        const website = new Discord.RichEmbed()
          .setAuthor("Website Command", client.user.avatarURL)
          .setDescription("Links to the bots website")
          .addField(
            "Usage",
            `${prefix}website`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: website
          });
          return;
        }

        message.channel.send({
          embed: website
        });
        break;
      case "support":
        const support = new Discord.RichEmbed()
          .setAuthor("Support Command", client.user.avatarURL)
          .setDescription("Links to the bots support server")
          .addField(
            "Usage",
            `${prefix}support`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: support
          });
          return;
        }

        message.channel.send({
          embed: support
        });
        break;
      case "suggest":
        const suggest = new Discord.RichEmbed()
          .setAuthor("Suggest Command", client.user.avatarURL)
          .setDescription("Sends a message to the bot owner")
          .addField(
            "Usage",
            `${prefix}suggest <suggestion>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: suggest
          });
          return;
        }

        message.channel.send({
          embed: suggest
        });
        break;
      case "help":
        const helpHelp = new Discord.RichEmbed()
          .setAuthor("Help Command", client.user.avatarURL)
          .setDescription("Shows up a list of commands")
          .addField(
            "Usage",
            `${prefix}help [<command>]`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: helpEmbed
          });
          return;
        }

        message.channel.send({
          embed: helpHelp
        });
        break;
      case "kick":
        const kickHelp = new Discord.RichEmbed()
          .setAuthor("Kick Command", client.user.avatarURL)
          .setDescription("Kick the mentioned user")
          .addField(
            "Usage",
            `${prefix}kick <@user>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: kickHelp
          });
          return;
        }

        message.channel.send({
          embed: kickHelp
        });
        break;
      case "meme":
        const memeHelp = new Discord.RichEmbed()
          .setAuthor("Meme Command", client.user.avatarURL)
          .setDescription("Random meme!")
          .addField("Usage", `${prefix}meme`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: memeHelp
          });
          return;
        }

        message.channel.send({
          embed: memeHelp
        });
        break;
      case "hug":
        const hug = new Discord.RichEmbed()
          .setAuthor("Hug Command", client.user.avatarURL)
          .setDescription("Hugs a user!")
          .addField("Usage", `${prefix}hug <@user>`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: hug
          });
          return;
        }

        message.channel.send({
          embed: hug
        });
        break;
      case "gamble":
        const gamble = new Discord.RichEmbed()
          .setAuthor("Gamble Command", client.user.avatarURL)
          .setDescription("Gambles specified amount")
          .addField("Usage", `${prefix}gamble <amount>`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: gamble
          });
          return;
        }

        message.channel.send({
          embed: gamble
        });
        break;
      case "ginvite":
        const ginvite = new Discord.RichEmbed()
          .setAuthor("Ginvite Command", client.user.avatarURL)
          .setDescription("Creates an invite for the server")
          .addField("Usage", `${prefix}ginvite`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: ginvite
          });
          return;
        }

        message.channel.send({
          embed: ginvite
        });
        break;
      case "flip":
        const flip = new Discord.RichEmbed()
          .setAuthor("Flip Command", client.user.avatarURL)
          .setDescription("Flips text")
          .addField("Usage", `${prefix}flip <text>`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: flip
          });
          return;
        }

        message.channel.send({
          embed: flip
        });
        break;
      case "leader":
        const leader = new Discord.RichEmbed()
          .setAuthor("Leader Command", client.user.avatarURL)
          .setDescription("Displays level leaderboard")
          .addField("Usage", `${prefix}meme`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: leader
          });
          return;
        }

        message.channel.send({
          embed: leader
        });
        break;
      case "ping":
        const pingHelp = new Discord.RichEmbed()
          .setAuthor("Ping Command", client.user.avatarURL)
          .setDescription("Displays the bot's ping")
          .addField("Usage", `${prefix}ping`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: pingHelp
          });
          return;
        }

        message.channel.send({
          embed: pingHelp
        });
        break;
      case "purge":
        const purgeHelp = new Discord.RichEmbed()
          .setAuthor("Purge Command", client.user.avatarURL)
          .setDescription("Deletes a specified amount of messages")
          .addField(
            "Usage",
            `${prefix}purge <amount of messages>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: purgeHelp
          });
          return;
        }

        message.channel.send({
          embed: purgeHelp
        });
        break;
      case "calc":
        const calcHelp = new Discord.RichEmbed()
          .setAuthor("Calc Command", client.user.avatarURL)
          .setDescription("Calculates a mathematical equation")
          .addField(
            "Usage",
            `${prefix}calc <equation>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: calcHelp
          });
          return;
        }

        message.channel.send({
          embed: calcHelp
        });
        break;
      case "trakt":
        const traktHelp = new Discord.RichEmbed()
          .setAuthor("Trakt Command", client.user.avatarURL)
          .setDescription(
            "Embeds the result of given search"
          )
          .addField(
            "Usage",
            `${
              prefix
            }trakt <movie/show>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: traktHelp
          });
          return;
        }

        message.channel.send({
          embed: traktHelp
        });
        break;
      case "mute":
        const muteHelp = new Discord.RichEmbed()
          .setAuthor("Mute Command", client.user.avatarURL)
          .setDescription(
            "Mutes the mentioned user"
          )
          .addField(
            "Usage",
            `${
              prefix
            }mute <time> <reason>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: muteHelp
          });
          return;
        }

        message.channel.send({
          embed: muteHelp
        });
        break;
      case "unmute":
        const unmuteHelp = new Discord.RichEmbed()
          .setAuthor("Unmute Command", client.user.avatarURL)
          .setDescription("Unmutes the mentioned user")
          .addField(
            "Usage",
            `${prefix}unmute <@mention>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: unmuteHelp
          });
          return;
        }

        message.channel.send({
          embed: unmuteHelp
        });
        break;
      case "coinflip":
        const coinflipHelp = new Discord.RichEmbed()
          .setAuthor("Coinflip Command", client.user.avatarURL)
          .setDescription("Flips a coin")
          .addField("Usage", `${prefix}coinflip`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: coinflipHelp
          });
          return;
        }

        message.channel.send({
          embed: coinflipHelp
        });
        break;
      case "config":
        const config = new Discord.RichEmbed()
          .setAuthor("Config Command", client.user.avatarURL)
          .setDescription("Displays the config menu")
          .addField("Usage", `${prefix}config`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: config
          });
          return;
        }

        message.channel.send({
          embed: config
        });
        break;
      case "esay":
        const esayHelp = new Discord.RichEmbed()
          .setAuthor("Esay Command", client.user.avatarURL)
          .setDescription("Posts an embed of your choosing")
          .addField("Usage", `${prefix}esay <message>`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: esayHelp
          });
          return;
        }

        message.channel.send({
          embed: esayHelp
        });
        break;
      case "userinfo":
        const userinfoHelp = new Discord.RichEmbed()
          .setAuthor("Userinfo Command", client.user.avatarURL)
          .setDescription("Displays informations about the mentioned user")
          .addField(
            "Usage",
            `${prefix}userinfo [<@user>]`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: userinfoHelp
          });
          return;
        }

        message.channel.send({
          embed: userinfoHelp
        });
        break;
      case "serverinfo":
        const serverinfoHelp = new Discord.RichEmbed()
          .setAuthor("Serverinfo Command", client.user.avatarURL)
          .setDescription("Displays informations about the server")
          .addField("Usage", `${prefix}serverinfo`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: serverinfoHelp
          });
          return;
        }

        message.channel.send({
          embed: serverinfoHelp
        });
        break;
      case "uptime":
        const uptimeHelp = new Discord.RichEmbed()
          .setAuthor("Uptime Command", client.user.avatarURL)
          .setDescription("Displays how long the bot has been running")
          .addField("Usage", `${prefix}uptime`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: uptimeHelp
          });
          return;
        }

        message.channel.send({
          embed: uptimeHelp
        });
        break;
      case "lmgtfy":
        const lmgtfyHelp = new Discord.RichEmbed()
          .setAuthor("LMGTFY Command", client.user.avatarURL)
          .setDescription("Post a 'Let me Google that for you' link")
          .addField("Usage", `${prefix}lmgtfy <question>`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefix}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({
            embed: lmgtfyHelp
          });
          return;
        }

        message.channel.send({
          embed: lmgtfyHelp
        });
        break;

      default:
        const mhelpEmbed = new Discord.RichEmbed()
          .setAuthor(client.user.username, client.user.avatarURL)
          .setColor(color)
          .setDescription(`Hey, I'm [**__Ragnarok__**]! A multi-purpose bot!\nRun \`${prefix}help <command>\` to see command specific instructions!\n'Administration Commands' must be preceded by \`${prefix}config\` e.g. \`${prefix}config adsprot\``)
          .setFooter(`This guild's prefix is ${prefix}`, client.user.avatarURL)
          .setTimestamp()
          .addField(":gear: Administration Commands",
            `\`adsprot\` \`autorole\` \`logging\` \`prefix\`
        \`ticket\` \`welcome\` \`rolemenu\``, true)
          .addField("🔨 Moderation Commands",
            `\`${prefix}ban\` \`${prefix}esay\` \`${prefix}kick\` \`${prefix}mute\` 
        \`${prefix}poll\` \`${prefix}purge\` \`${prefix}unmute\``, true)
          .addField("📃 Informative Commands",
            `\`${prefix}balance\` \`${prefix}config\` \`${prefix}help\` \`${prefix}ginvite\`
        \`${prefix}invite\` \`${prefix}ping\` \`${prefix}report\` \`${prefix}rolemenu\` 
        \`${prefix}serverinfo\` \`${prefix}suggest\` \`${prefix}support\`
        \`${prefix}uptime\` \`${prefix}userinfo\` \`${prefix}website\``, true)
          .addField(":ticket: Ticket Commands",
            `\`${prefix}ticket\` \`${prefix}add\` \`${prefix}close\` \`${prefix}forceclose\`
        \`${prefix}new\` \`${prefix}remove\` \`${prefix}rename\``, true)
          .addField(":red_car: Fun Commands",
            `\`${prefix}8ball\` \`${prefix}avatar\` \`${prefix}calc\` \`${prefix}coinflip\`
        \`${prefix}flip\` \`${prefix}gamble\` \`${prefix}hug\` \`${prefix}leader\`
        \`${prefix}level\` \`${prefix}lmgtfy\` \`${prefix}meme\` \`${prefix}remindme\`
        \`${prefix}trakt\``, true);

        message.channel.send({
          embed: mhelpEmbed
        });
        //message.channel.send(
        //  `:white_check_mark: **| Check your DMs.**`
        //);
        //message.author.send({ embed: mhelpEmbed });
        break;
    }
  }, 1000);
};

module.exports.help = {
  name: "help"
};