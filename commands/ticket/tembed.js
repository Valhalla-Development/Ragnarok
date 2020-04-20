const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const { ownerID } = require('../../storage/config.json');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
  config: {
    name: 'tembed',
    usage: '${prefix}tembed',
    category: 'ticket',
    description: 'Creates a ticket on reaction',
    accessableby: 'Everyone',
  },
  run: async (bot, message, args, color) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);
    const { prefix } = prefixgrab;

    if (!message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) {
      const errEmbed = new MessageEmbed()
        .setColor(color)
        .setDescription(':x: You do not have permission to run this command.');
      message.channel.send(errEmbed);
      return;
    }

    const embed = new MessageEmbed()
      .setColor(color)
      .setTitle('Create a Ticket')
      .setDescription('To create a ticket react with 📩')
      .setFooter('Ragnarok Bot', bot.user.avatarURL());

    const foundtEmbed = db.prepare(`SELECT * FROM ticketConfig WHERE guildid=${message.guild.id}`).get();
    if (!foundtEmbed) {
      const disabledTic = new MessageEmbed()
        .setColor(color)
        .setDescription('Tickets are not enabled on this server!');
      message.channel.send(disabledTic).then((m) => m.delete({ timeout: 10000 }));
      return;
    }
    const checkEmbedEx = db
      .prepare(`SELECT ticketembed FROM ticketConfig WHERE guildid = ${message.guild.id}`)
      .get();
    if (checkEmbedEx) {
      if (args[0] === 'clear') {
        if (checkEmbedEx.ticketembed) {
          const update = db.prepare('UPDATE ticketconfig SET ticketembed = (@ticketembed), ticketembedchan = (@ticketEChan) WHERE guildid = (@guildid);');
          update.run({
            guildid: `${message.guild.id}`,
            ticketembed: null,
            ticketEChan: null,
          });
          const cleared = new MessageEmbed()
            .setColor(color)
            .setDescription('Ticket embed has been cleared from the database!');
          message.channel.send(cleared).then((msg) => msg.delete({ timeout: 10000 }));
          return;
        }
        const danelSucc = new MessageEmbed()
          .setColor(color)
          .setDescription('I found no embed data in the database!');
        message.channel.send(danelSucc).then((msg) => msg.delete({ timeout: 10000, reason: 'Danel succ' }));
        return;
      }

      if (checkEmbedEx.ticketembed === null) {
        await message.channel.send(embed).then(async (a) => {
          a.react('📩');
          const update = db.prepare(
            'UPDATE ticketConfig SET ticketembed = (@ticketembed), ticketembedchan = (@ticketEChan) WHERE guildid = (@guildid);',
          );
          update.run({
            guildid: `${message.guild.id}`,
            ticketembed: `${a.id}`,
            ticketEChan: `${message.channel.id}`,
          });
          return;
        });
      } else {
        try {
          const embedChannel = message.guild.channels.cache.find((channel) => channel.id === foundtEmbed.ticketembedchan);
          await embedChannel.messages.fetch(foundtEmbed.ticketembed).then((res) => {
            if (res) {
              const alreadytick = new MessageEmbed()
                .setColor(color)
                .setDescription(`You already have a Ticket embed in this server!\n Please delete the other, or clear it from the database via \`${prefix}tembed clear\``);
              message.channel.send(alreadytick).then((msg) => msg.delete({ timeout: 10000 }));
              return;
            }
          }).catch(() => {
            message.channel.send(embed).then(async (a) => {
              a.react('📩');
              const update = db.prepare(
                'UPDATE ticketConfig SET ticketembed = (@ticketembed), ticketembedchan = (@ticketEChan) WHERE guildid = (@guildid);',
              );
              update.run({
                guildid: `${message.guild.id}`,
                ticketembed: `${a.id}`,
                ticketEChan: `${message.channel.id}`,
              });
              return;
            });
          });
        } catch (err) {
          message.channel.send(embed).then(async (a) => {
            a.react('📩');
            const update = db.prepare(
              'UPDATE ticketConfig SET ticketembed = (@ticketembed), ticketembedchan = (@ticketEChan) WHERE guildid = (@guildid);',
            );
            update.run({
              guildid: `${message.guild.id}`,
              ticketembed: `${a.id}`,
              ticketEChan: `${message.channel.id}`,
            });
            return;
          });
        }
      }
    }
  },
};
