const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Posts supplied text with markdown support.',
			category: 'Moderation',
			usage: '<language> <input>'
		});
	}

	async run(message, args) {
		if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Markdown**`,
					`**◎ Error:** Only users with \`MANAGE_GUILD\` can use this command!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Markdown**`,
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
