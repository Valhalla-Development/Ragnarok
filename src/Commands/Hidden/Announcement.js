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
		if (!this.client.owners.includes(message.author.id)) return;

		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		if (args[0] === undefined) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Incorrect Usage**',
					`**◎ Error:** Please use:**:\n\n${prefix}announcement <message>`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		db.prepare('UPDATE announcement SET msg = ?').run(args.join(' '));
		const complete = new MessageEmbed()
			.setColor(message.guild.me.displayHexColor || '36393F')
			.addField('**Success**',
				`**◎ Success:** Announcement message has been set to:**\n\`\`\`${args.join(' ')}\`\`\``);
		message.channel.send(complete);
	}

};
