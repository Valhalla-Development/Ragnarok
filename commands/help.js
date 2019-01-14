const Discord = require("discord.js");
const fs = require("fs");

module.exports.run = async (client, message, args, color) => {
  fs.readFileSync("./Storage/prefixes.json", "utf8");

  setTimeout(() => {
    let prefixes = JSON.parse(
      fs.readFileSync("./Storage/prefixes.json", "utf8")
    );

    switch (args[0]) {
      case "8ball":
        const ballHelp = new Discord.RichEmbed()
          .setAuthor("8ball Command", client.user.avatarURL)
          .setDescription("Question the mighty 8Ball!")
          .addField(
            "Usage",
            `${prefixes[message.guild.id].prefixes}8ball <question>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: ballHelp });
          return;
        }

        message.channel.send({ embed: ballHelp });
        break;

      case "adsprot":
        const adsprotHelp = new Discord.RichEmbed()
          .setAuthor("Adsprot Command", client.user.avatarURL)
          .setDescription("Activates ads protection")
          .addField(
            "Usage",
            `${prefixes[message.guild.id].prefixes}adsprot <on/off>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: adsprotHelp });
          return;
        }

        message.channel.send({ embed: adsprotHelp });
        break;

      case "profanity":
        const profanityHelp = new Discord.RichEmbed()
          .setAuthor("Profanity Command", client.user.avatarURL)
          .setDescription("Activates profanity protection")
          .addField(
            "Usage",
            `${prefixes[message.guild.id].prefixes}profanity <on/off>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: profanityHelp });
          return;
        }

        message.channel.send({ embed: profanityHelp });
        break;

      case "poll":
        const pollHelp = new Discord.RichEmbed()
          .setAuthor("Poll Command", client.user.avatarURL)
          .setDescription("Starts a poll")
          .addField(
            "Usage",
            `${prefixes[message.guild.id].prefixes}poll <question>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: pollHelp });
          return;
        }

        message.channel.send({ embed: pollHelp });
        break;
      case "remindme":
        const remindmeHelp = new Discord.RichEmbed()
          .setAuthor("Remindme Command", client.user.avatarURL)
          .setDescription("Reminds you with args given")
          .addField(
            "Usage",
            `${prefixes[message.guild.id].prefixes}remindme <time> <message> [Example: /remindme 15min example]`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: remindmeHelp });
          return;
        }

        message.channel.send({ embed: remindmeHelp });
        break;
      case "report":
        const reportHelp = new Discord.RichEmbed()
          .setAuthor("Report Command", client.user.avatarURL)
          .setDescription("Reports the specified user")
          .addField(
            "Usage",
            `${prefixes[message.guild.id].prefixes}report <@user> <reason>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: reportHelp });
          return;
        }

        message.channel.send({ embed: reportHelp });
        break;
      case "autorole":
        const autoroleHelp = new Discord.RichEmbed()
          .setAuthor("Autorole Command", client.user.avatarURL)
          .setDescription("Sets the role on join (case sensitive)")
          .addField(
            "Usage",
            `${prefixes[message.guild.id].prefixes}autorole <role>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: autoroleHelp });
          return;
        }

        message.channel.send({ embed: autoroleHelp });
        break;

      case "autortoggle":
        const autortoggleHelp = new Discord.RichEmbed()
          .setAuthor("Autortoggle Command", client.user.avatarURL)
          .setDescription("Toggles the autorole function")
          .addField(
            "Usage",
            `${prefixes[message.guild.id].prefixes}autortoggle <off>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: autortoggleHelp });
          return;
        }

        message.channel.send({ embed: autortoggleHelp });
        break;

      case "ban":
        const banHelp = new Discord.RichEmbed()
          .setAuthor("Ban Command", client.user.avatarURL)
          .setDescription("Ban the mentioned user")
          .addField(
            "Usage",
            `${prefixes[message.guild.id].prefixes}ban <@user> <reason>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: banHelp });
          return;
        }

        message.channel.send({ embed: banHelp });
        break;
      case "help":
        const helpHelp = new Discord.RichEmbed()
          .setAuthor("Help Command", client.user.avatarURL)
          .setDescription("Shows up a list of commands")
          .addField(
            "Usage",
            `${prefixes[message.guild.id].prefixes}help [<command>]`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: helpEmbed });
          return;
        }

        message.channel.send({ embed: helpHelp });
        break;
      case "kick":
        const kickHelp = new Discord.RichEmbed()
          .setAuthor("Kick Command", client.user.avatarURL)
          .setDescription("Kick the mentioned user")
          .addField(
            "Usage",
            `${prefixes[message.guild.id].prefixes}kick <@user>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: kickHelp });
          return;
        }

        message.channel.send({ embed: kickHelp });
        break;
      case "meme":
        const memeHelp = new Discord.RichEmbed()
          .setAuthor("Meme Command", client.user.avatarURL)
          .setDescription("Random meme!")
          .addField("Usage", `${prefixes[message.guild.id].prefixes}meme`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: memeHelp });
          return;
        }

        message.channel.send({ embed: memeHelp });
        break;
      case "ping":
        const pingHelp = new Discord.RichEmbed()
          .setAuthor("Ping Command", client.user.avatarURL)
          .setDescription("Displays the bot's ping")
          .addField("Usage", `${prefixes[message.guild.id].prefixes}ping`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: pingHelp });
          return;
        }

        message.channel.send({ embed: pingHelp });
        break;

      case "purge":
        const purgeHelp = new Discord.RichEmbed()
          .setAuthor("Purge Command", client.user.avatarURL)
          .setDescription("Deletes a specified amount of messages")
          .addField(
            "Usage",
            `${prefixes[message.guild.id].prefixes}purge <amount of messages>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: purgeHelp });
          return;
        }

        message.channel.send({ embed: purgeHelp });
        break;
      case "setprefix":
        const setPrefixHelp = new Discord.RichEmbed()
          .setAuthor("Setprefix Command", client.user.avatarURL)
          .setDescription("Set a new guild prefix")
          .addField(
            "Usage",
            `${prefixes[message.guild.id].prefixes}setprefix <new prefix>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: setPrefixHelp });
          return;
        }

        message.channel.send({ embed: setPrefixHelp });
        break;
      case "setwelcome":
        const setwelcomeHelp = new Discord.RichEmbed()
          .setAuthor("Setwelcome Command", client.user.avatarURL)
          .setDescription("Enables welcome messages (detailed setup)")
          .addField("Usage", `${prefixes[message.guild.id].prefixes}setwelcome`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: setwelcomeHelp });
          return;
        }

        message.channel.send({ embed: setwelcomeHelp });
        break;
      case "calc":
        const calcHelp = new Discord.RichEmbed()
          .setAuthor("Calc Command", client.user.avatarURL)
          .setDescription("Calculates a mathematical equation")
          .addField(
            "Usage",
            `${prefixes[message.guild.id].prefixes}calc <equation>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: calcHelp });
          return;
        }

        message.channel.send({ embed: calcHelp });
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
              prefixes[message.guild.id].prefixes
            }trakt <movie/show>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: traktHelp });
          return;
        }

        message.channel.send({ embed: traktHelp });
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
              prefixes[message.guild.id].prefixes
            }mute <time> <reason>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: muteHelp });
          return;
        }

        message.channel.send({ embed: muteHelp });
        break;
      case "unmute":
        const unmuteHelp = new Discord.RichEmbed()
          .setAuthor("Unmute Command", client.user.avatarURL)
          .setDescription("Unmutes the mentioned user")
          .addField(
            "Usage",
            `${prefixes[message.guild.id].prefixes}unmute <@mention>`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: unmuteHelp });
          return;
        }

        message.channel.send({ embed: unmuteHelp });
        break;
      case "coinflip":
        const coinflipHelp = new Discord.RichEmbed()
          .setAuthor("Coinflip Command", client.user.avatarURL)
          .setDescription("Flips a coin")
          .addField("Usage", `${prefixes[message.guild.id].prefixes}coinflip`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: coinflipHelp });
          return;
        }

        message.channel.send({ embed: coinflipHelp });
        break;
      case "esay":
        const esayHelp = new Discord.RichEmbed()
          .setAuthor("Esay Command", client.user.avatarURL)
          .setDescription("Posts an embed of your choosing")
          .addField("Usage", `${prefixes[message.guild.id].prefixes}esay <message>`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: esayHelp });
          return;
        }

        message.channel.send({ embed: esayHelp });
        break;
      case "userinfo":
        const userinfoHelp = new Discord.RichEmbed()
          .setAuthor("Userinfo Command", client.user.avatarURL)
          .setDescription("Displays informations about the mentioned user")
          .addField(
            "Usage",
            `${prefixes[message.guild.id].prefixes}userinfo [<@user>]`
          )
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: userinfoHelp });
          return;
        }

        message.channel.send({ embed: userinfoHelp });
        break;
      case "serverinfo":
        const serverinfoHelp = new Discord.RichEmbed()
          .setAuthor("Serverinfo Command", client.user.avatarURL)
          .setDescription("Displays informations about the server")
          .addField("Usage", `${prefixes[message.guild.id].prefixes}serverinfo`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: serverinfoHelp });
          return;
        }

        message.channel.send({ embed: serverinfoHelp });
        break;
      case "uptime":
        const uptimeHelp = new Discord.RichEmbed()
          .setAuthor("Uptime Command", client.user.avatarURL)
          .setDescription("Displays how long the bot has been running")
          .addField("Usage", `${prefixes[message.guild.id].prefixes}uptime`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: uptimeHelp });
          return;
        }

        message.channel.send({ embed: uptimeHelp });
        break;
      case "lmgtfy":
        const lmgtfyHelp = new Discord.RichEmbed()
          .setAuthor("LMGTFY Command", client.user.avatarURL)
          .setDescription("Post a 'Let me Google that for you' link")
          .addField("Usage", `${prefixes[message.guild.id].prefixes}lmgtfy <question>`)
          .setThumbnail(client.user.avatarURL)
          .setFooter(
            `This guild's prefix is ${prefixes[message.guild.id].prefixes}`,
            client.user.avatarURL
          )
          .setColor(color);

        if (
          !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
        ) {
          message.channel.send(
            `:white_check_mark: **| Check your DMs. :ok_hand:**`
          );
          message.author.send({ embed: lmgtfyHelp });
          return;
        }

        message.channel.send({ embed: lmgtfyHelp });
        break;

      default:
      const prefix = prefixes[message.guild.id].prefixes
      const helpEmbed = new Discord.RichEmbed()
        .setAuthor(client.user.username, client.user.avatarURL)
        .setColor(color)
        .setDescription(`Hey, I'm [**__Ragnarok__**]! A multi-purpose bot!\nRun \`${prefix}help <command>\` to see command specific instructions!`)
        .setFooter(`This guild's prefix is ${prefix}`, client.user.avatarURL)
        .setTimestamp()
        .addField("🔨 Moderation Commands", 
        `${prefix}ban - Bans the mentioned user
        ${prefix}esay - Posts an embed of your choosing
        ${prefix}invite - Links an invite to the guild
        ${prefix}kick - Kicks the mentioned user
        ${prefix}mute - Mutes the mentioned user
        ${prefix}poll - Starts a poll
        ${prefix}purge - Deletes specified amount of messages
        ${prefix}unmute - Unmutes the mentioned user`, true)
        .addField(":gear: Administration Commands",
        `${prefix}adsprot - Toggles ads protection
        ${prefix}autorole - Configures the autorole on join
        ${prefix}autortoggle - Toggles autorole
        ${prefix}logging - Enables logging for the guild
        ${prefix}profanity - Toggles profanity checks
        ${prefix}setprefix - Sets the guilds prefix
        ${prefix}setwelcome - Sets the welcome message`, true)
        .addField("📃 Informative Commands",
        `${prefix}close - Closes a support ticket
        ${prefix}ginvite - Links the invite for the bot
        ${prefix}new - Creates a ticket
        ${prefix}ping - Checks ping of bot
        ${prefix}pleader - Displays points leaderboard
        ${prefix}points - Display current points
        ${prefix}remindme - Reminds you of specificed message
        ${prefix}report - Reports mentioned user
        ${prefix}serverinfo - Display serverinfo
        ${prefix}ticket - Displays instructions on tickets
        ${prefix}uptime - Displays how long the bot has been online
        ${prefix}userinfo - Userinfo of mentioned user`, true)
        .addField(":red_car: Fun Commands",
        `${prefix}8ball - Question the mighty 8Ball
        ${prefix}calc - Calculated an equation
        ${prefix}coinflip - Flips a coin
        ${prefix}lmgtfy - Links a LetMeGoogleThatForYou link
        ${prefix}meme - Posts a meme
        ${prefix}trakt - Searches trakt for specified Movie`, true);
      
          message.channel.send(
            `:white_check_mark: **| Check your DMs.**`
          );
          message.author.send({ embed: helpEmbed });
          break;
        }
  }, 1000);
};

module.exports.help = {
  name: "help"
};