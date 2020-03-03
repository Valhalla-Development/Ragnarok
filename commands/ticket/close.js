const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'close',
    usage: '${prefix}close',
    category: 'ticket',
    description: 'Closes a ticket',
    accessableby: 'Staff',
  },
  run: async (bot, message, args, color) => {
    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);
    const { prefix } = prefixgrab;

    const channelArgs = message.channel.name.split('-');
    const foundTicket = db
      .prepare(
        `SELECT * FROM tickets WHERE guildid = ${
          message.guild.id
        } AND ticketid = (@ticketid)`,
      )
      .get({
        ticketid: channelArgs[channelArgs.length - 1],
      });
    // Make sure it's inside the ticket channel.
    if (foundTicket && message.channel.id !== foundTicket.chanid) {
      const badChannel = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${language.tickets.wrongChannelClose}`);
      message.channel.send(badChannel);
      return;
    }
    if (!foundTicket) {
      const errEmbed = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${language.tickets.wrongChannelClose}`);
      return message.channel.send(errEmbed);
    }

    // Ask for confirmation within 10 seconds.
    const confirmCloseMessage = language.tickets.closeConfirm;
    const confirmClose = confirmCloseMessage.replace('${prefix}', prefix);
    const confirmEmbed = new MessageEmbed()
      .setColor('36393F')
      .setDescription(`${confirmClose}`);
    message.channel.send(confirmEmbed).then((m) => {
      message.channel
        .awaitMessages((response) => response.content === `${prefix}confirm`, {
          max: 1,
          time: 20000,
          errors: ['time'],
        })
        .then(() => {
          message.channel.delete();

          const deleteTicket = db.prepare(
            `DELETE FROM tickets WHERE guildid = ${
              message.guild.id
            } AND ticketid = (@ticketid)`,
          );
          deleteTicket.run({
            ticketid: channelArgs[channelArgs.length - 1],
          });

          const logget = db
            .prepare(
              `SELECT log FROM ticketConfig WHERE guildid = ${
                message.guild.id
              };`,
            )
            .get();
          if (!logget) {
            return;
          }

          const logchan = message.guild.channels.find(
            (chan) => chan.id === logget.log,
          );
          if (!logchan) return;
          const loggingembed = new MessageEmbed()
            .setColor(color)
            .setDescription(
              `<@${message.author.id}> has closed ticket \`#${
                message.channel.name
              }\``,
            );
          logchan.send(loggingembed);
        })
        .catch(() => {
          m.delete();
        });
    });
  },
};
