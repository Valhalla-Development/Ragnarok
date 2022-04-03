const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays available commands.',
			category: 'Ticket',
			userPerms: ['MANAGE_GUILD']
		});
	}

	async run(message) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))
			.setAuthor({ name: `Tickets`, iconURL: this.client.user.displayAvatarURL({ dynamic: true }) })
			.addField(`Available Commands`,
				`**◎ 📩 Open ticket:** \`${prefix}new\`
				**◎ 📩 Close Ticket (Admin):** \`${prefix}close\`
				**◎ 📩 Add User to Ticket (Admin):** \`${prefix}add\`
				**◎ 📩 Remove User from Ticket (Admin):** \`${prefix}remove\`
				**◎ 📩 Rename (Admin):** \`${prefix}rename\``);
		message.channel.send({ embeds: [embed] });
	}

};
