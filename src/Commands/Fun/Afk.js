const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
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
		const afkGrab = db.prepare('SELECT * FROM afk WHERE user = ? AND guildid = ?').get(message.author.id, message.guild.id);

		const reason = args[0] ? args.join(' ') : 'AFK';

		if (afkGrab) {
			await db.prepare('UPDATE afk SET reason = (@reason) WHERE (user, guildid) = (@user, @guildid);').run({
				reason: reason,
				user: message.author.id,
				guildid: message.guild.id
			});

			this.client.utils.messageDelete(message, 10000);

			const badChannel = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - AFK**`,
					`**◎ Success:** ${message.author} is now AFK for the following reason:\n\n\`${reason}\``);
			message.channel.send({ embed: badChannel });
			return;
		} else {
			await db.prepare('INSERT INTO afk (reason, user, guildid) values (@reason, @user, @guildid);').run({
				reason: reason,
				user: message.author.id,
				guildid: message.guild.id
			});

			this.client.utils.messageDelete(message, 10000);

			const badChannel = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - AFK**`,
					`**◎ Success:** ${message.author} is now AFK for the following reason:\n\n\`${reason}\``);
			message.channel.send({ embed: badChannel });
			return;
		}
	}

};
