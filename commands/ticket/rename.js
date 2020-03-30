const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'rename',
    usage: '${prefix}rename <name>',
    category: 'ticket',
    description: 'Renames a ticket',
    accessableby: 'Staff',
  },
  run: async (bot, message, args, color) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    const suppRole = db
      .prepare(
        `SELECT role FROM ticketConfig WHERE guildid = ${message.guild.id}`,
      )
      .get();
    const modRole = message.guild.roles.cache.find((x) => x.name === 'Support Team') || message.guild.roles.cache.find((r) => r.id === suppRole.role);
    if (!modRole) {
      const nomodRole = new MessageEmbed()
        .setColor(color)
        .setDescription(`${language.tickets.nomodRole}`);
      message.channel.send(nomodRole);
      return;
    }

    if (
      !message.member.roles.cache.has(modRole.id) && message.author.id !== message.guild.ownerID) {
      const donthaveroleMessage = language.tickets.donthaveRole;
      const role = donthaveroleMessage.replace('${role}', modRole);
      const donthaveRole = new MessageEmbed()
        .setColor(color)
        .setDescription(`${role}`);
      message.channel.send(donthaveRole);
      return;
    }

    let foundTicket = db
      .prepare(
        `SELECT * FROM tickets WHERE guildid = ${
          message.guild.id
        } AND ticketid = (@ticketid)`,
      )
      .get({
        ticketid: args[0],
      });
    if (foundTicket) {
      const getChan = message.guild.channels.cache.find(
        (chan) => chan.id === foundTicket.chanid,
      );
      const argResult = args.splice(1).join('-');
      getChan.setName(`${argResult}-${foundTicket.ticketid}`);
      const logget = db
        .prepare(
          `SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`,
        )
        .get();
      const logchan = message.guild.channels.cache.find(
        (chan) => chan.id === logget.log,
      );
      if (!logchan) return;
      const loggingembed = new MessageEmbed()
        .setColor(color)
        .setDescription(
          `<@${message.author.id}> renamed ticket from \`#${
            getChan.name
          }\` to <#${getChan.id}>`,
        );
      logchan.send(loggingembed);
    } else if (!foundTicket && message.channel.name.startsWith('ticket')) {
      const channelArgs = message.channel.name.split('-');
      foundTicket = db
        .prepare(
          `SELECT * from tickets WHERE guildid = ${
            message.guild.id
          } AND ticketid = (@ticketid)`,
        )
        .get({
          ticketid: channelArgs[channelArgs.length - 1],
        });
      const argResult = args.join('-');
      message.channel.setName(`${argResult}-${foundTicket.ticketid}`);
      const logget = db
        .prepare(
          `SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`,
        )
        .get();
      const logchan = message.guild.channels.cache.find(
        (chan) => chan.id === logget.log,
      );
      if (!logchan) return;
      const loggingembed = new MessageEmbed()
        .setColor(color)
        .setDescription(
          `<@${message.author.id}> renamed ticket from \`#${
            message.channel.name
          }\` to <#${message.channel.id}>`,
        );
      logchan.send(loggingembed);
    } else if (!foundTicket && !message.channel.name.startsWith('ticket-')) {
      const errEmbed = new MessageEmbed()
        .setColor(color)
        .setDescription('This ticket could not be found.');
      message.channel.send(errEmbed);
    }
  },
};
