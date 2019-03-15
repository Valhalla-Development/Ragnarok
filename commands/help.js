const Discord = require("discord.js");
const SQLite = require('better-sqlite3')
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
            `${prefix}adsprot <on/off>`
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
            `${prefix}profanity <on/off>`
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
            `${prefix}autorole <role>`
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
          message.author.send({ embed: autoroleHelp });
          return;
        }

        message.channel.send({ embed: autoroleHelp });
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
          message.author.send({ embed: kickHelp });
          return;
        }

        message.channel.send({ embed: kickHelp });
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
          message.author.send({ embed: memeHelp });
          return;
        }

        message.channel.send({ embed: memeHelp });
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
            `${prefix}setprefix <new prefix>`
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
          message.author.send({ embed: setPrefixHelp });
          return;
        }

        message.channel.send({ embed: setPrefixHelp });
        break;
      case "setwelcome":
        const setwelcomeHelp = new Discord.RichEmbed()
          .setAuthor("Setwelcome Command", client.user.avatarURL)
          .setDescription("Enables welcome messages (detailed setup)")
          .addField("Usage", `${prefix}setwelcome`)
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
          message.author.send({ embed: unmuteHelp });
          return;
        }

        message.channel.send({ embed: unmuteHelp });
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
          message.author.send({ embed: coinflipHelp });
          return;
        }

        message.channel.send({ embed: coinflipHelp });
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
          message.author.send({ embed: userinfoHelp });
          return;
        }

        message.channel.send({ embed: userinfoHelp });
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
          message.author.send({ embed: serverinfoHelp });
          return;
        }

        message.channel.send({ embed: serverinfoHelp });
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
          message.author.send({ embed: uptimeHelp });
          return;
        }

        message.channel.send({ embed: uptimeHelp });
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
          message.author.send({ embed: lmgtfyHelp });
          return;
        }

        message.channel.send({ embed: lmgtfyHelp });
        break;

      default:
      const helpEmbed = new Discord.RichEmbed()
        .setAuthor(client.user.username, client.user.avatarURL)
        .setColor(color)
        .setDescription(`Hey, I'm [**__Ragnarok__**]! A multi-purpose bot!\nRun \`${prefix}help <command>\` to see command specific instructions!\n'Administration Commands' must be preceded by \`${prefix}config\` e.g. \`${prefix}config adsprot\``)
        .setFooter(`This guild's prefix is ${prefix}`, client.user.avatarURL)
        .setTimestamp()
        .addField(":gear: Administration Commands",
        `\`adsprot\` \`autorole\` \`logging\` \`prefix\`
        \`welcome\` \`rset\` \`rremove\` \`rclear\``, true)
        .addField("🔨 Moderation Commands", 
        `\`${prefix}ban\` \`${prefix}esay\` \`${prefix}kick\` \`${prefix}mute\` 
        \`${prefix}poll\` \`${prefix}purge\` \`${prefix}unmute\``, true)
        .addField("📃 Informative Commands",
        `\`${prefix}balance\` \`${prefix}config\` \`${prefix}help\` \`${prefix}ginvite\`
        \`${prefix}invite\` \`${prefix}ping\` \`${prefix}report\` \`${prefix}serverinfo\`
        \`${prefix}suggest\` \`${prefix}support\` \`${prefix}uptime\` \`${prefix}userinfo\`
        \`${prefix}website\``, true)
        .addField(":ticket: Ticket Commands",
        `\`${prefix}ticket\` \`${prefix}add\` \`${prefix}close\` \`${prefix}forceclose\`
        \`${prefix}new\` \`${prefix}remove\` \`${prefix}rename\``, true)
        .addField(":red_car: Fun Commands",
        `\`${prefix}8ball\` \`${prefix}avatar\` \`${prefix}calc\` \`${prefix}coinflip\`
        \`${prefix}gamble\` \`${prefix}lmgtfy\` \`${prefix}meme\` \`${prefix}pleader\`
        \`${prefix}points\` \`${prefix}remindme\` \`${prefix}trakt\``, true);
      
        message.channel.send({ embed: helpEmbed});
          //message.channel.send(
          //  `:white_check_mark: **| Check your DMs.**`
          //);
          //message.author.send({ embed: helpEmbed });
          break;
        }
  }, 1000);
};

module.exports.help = {
  name: "help"
};