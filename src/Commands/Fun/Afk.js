const Command = require('../../Structures/Command');
const { EmbedBuilder } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Sets your AFK status',
			category: 'Fun',
			usage: '[input]'
		});
	}

	async run(message, args) {
		this.client.utils.messageDelete(message, 10000);

		const afkGrab = db.prepare('SELECT * FROM afk WHERE id = ?').get(`${message.author.id}-${message.guild.id}`);

		const reason = args[0] ? args.join(' ') : 'AFK';

		if (reason.length > 100) {
			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - AFK**`,
					`**◎ Error:** Please limit your reason to a maximum of 100 characters!`);
			message.channel.send({ embeds: [embed] });
			return;
		}

		if (afkGrab) {
			await db.prepare('UPDATE afk SET reason = (@reason) WHERE (user, guildid, id) = (@user, @guildid, @id);').run({
				reason: reason,
				user: message.author.id,
				guildid: message.guild.id,
				id: `${message.author.id}-${message.guild.id}`
			});

			const badChannel = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - AFK**`,
					`**◎ Success:** ${message.author} is now AFK for the following reason:\n\n${reason}`);
			message.channel.send({ embeds: [badChannel] });
			return;
		} else {
			await db.prepare('INSERT INTO afk (reason, user, guildid, id) values (@reason, @user, @guildid, @id);').run({
				reason: reason,
				user: message.author.id,
				guildid: message.guild.id,
				id: `${message.author.id}-${message.guild.id}`
			});

			const badChannel = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - AFK**`,
					`**◎ Success:** ${message.author} is now AFK for the following reason:\n\n${reason}`);
			message.channel.send({ embeds: [badChannel] });
			return;
		}
	}

};
