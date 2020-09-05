const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Emits a Discord.js event.',
			category: 'Hidden',
			usage: '<event>'
		});
	}

	async run(message, args) {
		if (!this.client.owners.includes(message.author.id)) return;

		const prefixgrab = db
			.prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
			.get(message.guild.id);
		const { prefix } = prefixgrab;

		if (args[0] === undefined) {
			const noArgs = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Emit**`,
					`**◎ Available Commands:**\n\`${prefix}emit guildMemberAdd\`\n\`${prefix}emit guildMemberRemove\``);
			message.channel.send(noArgs).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		if (args[0] === 'guildMemberAdd') {
			this.client.emit('guildMemberAdd', message.member);
			return;
		}
		if (args[0] === 'guildMemberRemove') {
			this.client.emit('guildMemberRemove', message.member);
			return;
		}
	}

};
