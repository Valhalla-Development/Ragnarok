const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Starts a poll.',
			category: 'Moderation'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Poll**`,
					`**◎ Error:** Only the server's managers can use this command!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		// Check for input
		if (!args[0]) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Poll**`,
					`**◎ Error:** Correct usage: \`${prefix}poll <question>\``);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
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
