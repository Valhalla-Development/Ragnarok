const { MessageEmbed } = require('discord.js');
const ms = require('ms');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
	config: {
		name: 'remindme',
		usage: '${prefix}remindme <time> <message>',
		category: 'fun',
		description: 'Reminds you of a specifed message',
		accessableby: 'Everyone',
	},
	run: async (bot, message, args) => {
		const language = require('../../storage/messages.json');

		const prefixgrab = db
			.prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
			.get(message.guild.id);

		const prefix = prefixgrab.prefix;

		const incorrectUsageMessage = language.remindme.incorrectUsage;
		const incorrectUsage = incorrectUsageMessage.replace('${prefix}', prefix);

		const reminderTime = args[0];
		if (!reminderTime) return message.channel.send(`${incorrectUsage}`);

		const reminder = args.slice(1).join(' ');

		if (message.content.includes('@everyone')) {
			message.reply('NO!');
			return;
		}
		if (message.content.includes('@here')) {
			message.reply('NO!');
			return;
		}

		message.channel.send(
			':white_check_mark: ** I will remind you in ' +
				`${reminderTime}` +
				' :heart:**'
		);

		setTimeout(function() {
			const remindEmbed = new MessageEmbed()
				.setColor('RANDOM')
				.setAuthor(
					`${message.author.username}`,
					message.author.displayAvatarURL()
				)
				.addField('Reminder', `\`\`\`${reminder}\`\`\``);

			message.channel.send(remindEmbed);
			message.channel.send(`${message.author}`);
		}, ms(reminderTime));
	},
};
