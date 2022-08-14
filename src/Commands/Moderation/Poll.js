const Command = require('../../Structures/Command');
const { EmbedBuilder, codeBlock } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Starts a poll.',
			category: 'Moderation',
			userPerms: ['ManageMessages'],
			botPerms: ['AddReactions']
		});
	}

	async run(message, args) {
		this.client.utils.messageDelete(message, 0);

		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		// Check for input
		if (!args[0]) {
			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Poll**`,
					value: `**◎ Error:** Correct usage: \`${prefix}poll <question>\`` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Create Embed
		const embed = new EmbedBuilder()
			.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
			.setAuthor({ name: 'Poll Created', iconURL: message.guild.iconURL({ extension: 'png' }) })
			.addFields({ name: `**React to Vote**`,
				value: `${codeBlock('text', `${args.join(' ')}`)}` });

		await message.channel.send({ embeds: [embed] }).then((msg) => {
			msg.react('✅');
			msg.react('❌');
		}).catch((error) => {
			console.log(error);
		});
	}

};
