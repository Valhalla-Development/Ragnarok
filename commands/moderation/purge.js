/* eslint-disable no-shadow */
const { ownerID } = require('../../storage/config.json');

module.exports = {
	config: {
		name: 'purge',
		usage: '${prefix}purge <amount>',
		category: 'moderation',
		description: 'Deletes X amoune of message',
		accessableby: 'Staff',
	},
	run: async (bot, message, args) => {
		const language = require('../../storage/messages.json');


		if (
			!message.member.hasPermission('MANAGE_MESSAGES') &&
			message.author.id !== ownerID
		) {
			message.channel.send(`${language.purge.noPermission}`).then(message =>
				message.delete({
					timeout: 5000,
				})
			);
			return;
		}

		const argresult = args.join(' ');
		if (!argresult) {
			message.channel.send(`${language.purge.notSpecified}`).then(message =>
				message.delete({
					timeout: 5000,
				})
			);
			return;
		}
		if (isNaN(argresult)) {
			message.channel.send(`${language.purge.invalidNumber}`).then(message =>
				message.delete({
					timeout: 5000,
				})
			);
			return;
		}
		if (args[0] > 100) {
			message.channel.send(`${language.purge.limitNumber}`).then(message =>
				message.delete({
					timeout: 5000,
				})
			);
			return;
		}

		const messagecount = parseInt(args.join(' '));
		message.channel.bulkDelete(messagecount).then(() => {
			setTimeout(() => {
				const purgedMessage = language.purge.purged;
				const purged = purgedMessage.replace('${messages}', messagecount);

				message.channel.send(`${purged}`).then(m => {
					setTimeout(() => {
						m.delete();
					}, 5000);
				});
			}, 2000);
		});
	},
};
