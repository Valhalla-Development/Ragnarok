const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Owner command to edit the announcement message.',
			category: 'Hidden',
			usage: '<message>'
		});
	}

	async run(message, args) {
		if (!this.client.owners.includes(message.author.id)) return;

		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		if (args[0] === undefined) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Announcement**`,
					`**◎ Error:** Please use:**:\n\n${prefix}announcement <message>`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		db.prepare('UPDATE announcement SET msg = ?').run(args.join(' '));
		const complete = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Announcement**`,
				`**◎ Success:** Announcement message has been set to:\n\`\`\`${args.join(' ')}\`\`\``);
		message.channel.send(complete);
	}

};
