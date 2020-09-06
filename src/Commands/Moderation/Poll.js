const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Starts a poll.',
			category: 'Moderation',
			requiredPermission: 'MANAGE_MESSAGES'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		// Check for input
		if (!args[0]) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Poll**`,
					`**◎ Error:** Correct usage: \`${prefix}poll <question>\``);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Create Embed
		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**Poll Create By ${message.author.username}**`,
				`${args.join(' ')}`)
			.setFooter('React to Vote.');

		await message.channel.send(embed).then((msg) => {
			msg.react('✅');
			msg.react('❌');
		}).catch((error) => {
			console.log(error);
		});
	}

};
