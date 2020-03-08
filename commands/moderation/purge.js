/* eslint-disable no-restricted-globals */
const { ownerID } = require('../../storage/config.json');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'purge',
    usage: '${prefix}purge <amount>',
    category: 'moderation',
    description: 'Deletes X amoune of message',
    accessableby: 'Staff',
  },
  run: async (bot, message, args) => {
    if (
      !message.member.hasPermission('MANAGE_MESSAGES') && message.author.id !== ownerID) {
      message.channel.send(`${language.purge.noPermission}`).then((message) => message.delete({
        timeout: 5000,
      }));
      return;
    }

    if (!args[0]) {
      message.channel.send(`${language.purge.notSpecified}`).then((message) => message.delete({
        timeout: 5000,
      }));
      return;
    }
    if (isNaN(args[0])) {
      message.channel.send(`${language.purge.invalidNumber}`).then((message) => message.delete({
        timeout: 5000,
      }));
      return;
    }
    if (args[0] > 100) {
      message.channel.send(`${language.purge.limitNumber}`).then((message) => message.delete({
        timeout: 5000,
      }));
      return;
    }
    if (args[0] < 1) {
      message.channel.send(`${language.purge.notSpecified}`).then((message) => message.delete({
        timeout: 5000,
      }));
      return;
    }

    const amt = await message.channel.messages.fetch({ limit: parseInt(args[0]) });

    try {
      await message.channel.bulkDelete(amt);
      message.channel.bulkDelete(args[0]).then(() => {
        setTimeout(() => {
          const purgedMessage = language.purge.purged;
          const purged = purgedMessage.replace('${messages}', args[0]);

          message.channel.send(`${purged}`).then((m) => {
            setTimeout(() => {
              m.delete();
            }, 5000);
          });
        }, 2000);
      }).catch((error) => {
        console.log(error);
      });
    } catch (e) {
      message.channel.send(':x: You can not delete messages older than 14 days.');
    }
  },
};
