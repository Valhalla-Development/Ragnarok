const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const disbutreact = require('discord-buttons-react');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Starts a poll.',
			category: 'Moderation',
			userPerms: ['MANAGE_MESSAGES'],
			botPerms: ['ADD_REACTIONS']
		});
	}

	async run(message, args) {
		this.client.utils.messageDelete(message, 0);

		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		// Check for input
		if (!args[0]) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Poll**`,
					`**◎ Error:** Correct usage: \`${prefix}poll <question>\``);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Create Embed
		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**Poll Created By ${message.author.username}**`,
				`${args.join(' ')}`);

		const ReactionButton1 = new disbutreact.ReactionButton()
			.setStyle('blurple')
			.setEmoji('✅');

		const ReactionButton2 = new disbutreact.ReactionButton()
			.setStyle('blurple')
			.setEmoji('❌');

		message.channel.createMessageReactionButton({ embeds: [embed] }, [ReactionButton1, ReactionButton2]);
	}

};
