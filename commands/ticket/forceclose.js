const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'forceclose',
    usage: '${prefix}forceclose',
    category: 'ticket',
    description: 'Forcefully closes a ticket',
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
        .setColor('36393F')
        .setDescription(`${language.tickets.nomodRole}`);
      message.channel.send(nomodRole);
      return;
    }

    if (
      !message.member.roles.cache.has(modRole.id) && message.author.id !== message.guild.ownerID) {
      const donthaveroleMessage = language.tickets.donthaveRole;
      const role = donthaveroleMessage.replace('${role}', modRole);
      const donthaveRole = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${role}`);
      message.channel.send(donthaveRole);
      return;
    }

    const channelArgs = message.channel.name.split('-');
    const foundTicket = db
      .prepare(
        `SELECT * FROM tickets WHERE guildid = ${
          message.guild.id
        } AND ticketid = (@ticketid)`,
      )
      .get({
        ticketid: args[0] || channelArgs[channelArgs.length - 1],
      });
    if (foundTicket) {
      const getChan = message.guild.channels.cache.find(
        (chan) => chan.id === foundTicket.chanid,
      );
      const forceclosetimer = new MessageEmbed()
        .setColor('#36393F')
        .setTitle(':x: Closing Ticket! :x:')
        .setDescription(`${language.tickets.closeTimer}`);
      getChan.send(forceclosetimer).then((timerMsg) => {
        getChan
          .awaitMessages(
            (resp) => resp.author.id === message.author.id || foundTicket.authorid,
            {
              max: 1,
              time: 10000,
              errors: ['time'],
            },
          )
          .then(() => {
            const cancelTimer = new MessageEmbed()
              .setColor('#36393F')
              .setDescription('Canceling Ticket Close');
            timerMsg.edit(cancelTimer).then((cancelMsg) => {
              cancelMsg.delete({
                timeout: 5000,
              });
            });
          })
          .catch(() => {
            getChan.delete();
            db.prepare(
              `DELETE FROM tickets WHERE guildid = ${
                message.guild.id
              } AND ticketid = (@ticketid)`,
            ).run({
              ticketid: foundTicket.ticketid,
            });
            const logget = db
              .prepare(
                `SELECT log FROM ticketConfig WHERE guildid = ${
                  message.guild.id
                };`,
              )
              .get();
            if (!logget) return;
            const logchan = message.guild.channels.cache.find(
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
          });
      });
    } else {
      const errEmbed = new MessageEmbed()
        .setColor('#36393F')
        .setDescription('This ticket could not be found.');
      message.channel.send(errEmbed);
    }
  },
};
