const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays the current prefix for the',
			category: 'Informative'
		});
	}

	async run(message) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const embed = new MessageEmbed()
			.setColor(message.guild.me.displayHexColor || 'A10000')
			.addField(`**${this.client.user.username} - Prefix**`,
				`**◎ My prefix for this guild is: \`${prefix}\``);
		message.channel.send(embed);
	}

};
