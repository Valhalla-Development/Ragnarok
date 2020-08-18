const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'E',
			aliases: ['E'],
			description: 'E',
			category: 'E',
			usage: 'E'
		});
	}

	async run(message, args) {
		if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Incorrect Perms**',
					`**◎ Error:** Only users with \`MANAGE_GUILD\` can use this command!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const embed = new MessageEmbed()
			.setColor(message.guild.me.displayHexColor || '36393F')
			.addField('**Incorrect Usage**',
				`**◎ Error:** Please input text, example: \`${prefix}markdown <language> <text> !\``);
		message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));

		if (args[0] === undefined) {
			message.channel.send(embed);
			return;
		}
		if (args[1] === undefined) {
			message.channel.send(embed);
			return;
		}


		const extension = args[0].toLowerCase();
		const sayMessage = args.slice(1).join(' ');

		message.channel.send(sayMessage, { code: extension });
	}

};
