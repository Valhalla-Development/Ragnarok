const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Emits a Discord.js event.',
			category: 'Hidden',
			usage: '<event>',
			ownerOnly: true
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);

		const { prefix } = prefixgrab;

		if (args[0] === undefined) {
			this.client.utils.messageDelete(message, 10000);

			const noArgs = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Emit**`,
					`**◎ Available Commands:**\n\`${prefix}emit guildMemberAdd\`\n\`${prefix}emit guildMemberRemove\``);
			message.channel.send({ embeds: [noArgs] }).then((m) => this.client.utils.deletableCheck(m, 10000));
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
