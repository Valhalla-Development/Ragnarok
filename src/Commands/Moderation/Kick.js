const Command = require('../../Structures/Command');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Kicks tagged user from the guild.',
			category: 'Moderation',
			usage: '<@user> [reason]',
			userPerms: ['KickMembers'],
			botPerms: ['KickMembers']
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();

		const user = message.mentions.users.size ? message.guild.members.cache.get(message.mentions.users.first().id) : message.guild.members.cache.get(args[0]);

		// No user
		if (!user) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Kick**`,
					value: `**◎ Error:** Run \`${prefix}help kick\` If you are unsure.` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// If user id = message id
		if (user.user.id === message.author.id) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Kick**`,
					value: `**◎ Error:** You can't kick yourself <:wut:745408596233289839>` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user has a role that is higher than the message author
		if (user.roles.highest.position >= message.member.roles.highest.position) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Kick**`,
					value: `**◎ Error:** You cannot kick someone with a higher role than yourself!` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user is kickable
		if (user.permissions.has(PermissionsBitField.ManageGuild) || user.permissions.has(PermissionsBitField.Administrator) || !user.kickable) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Kick**`,
					value: `**◎ Error:** You cannot kick <@${user.id}>` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user is the bot
		if (user.user.id === this.client.user.id) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Kick**`,
					value: `**◎ Error:** You cannot kick me. :slight_frown:` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let reason = args.slice(1).join(' ');
		if (!reason) reason = 'No reason given.';

		// Kick the user and send the embed
		user.kick({ reason: `${reason}` }).catch(() => {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Kick**`,
					value: `**◎ Error:** An error occured!` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		});

		const embed = new EmbedBuilder()
			.setThumbnail(this.client.user.displayAvatarURL())
			.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
			.addFields({ name: 'User Kicked',
				value: `**◎ User:** ${user.user.tag}
				**◎ Reason:** ${reason}
				**◎ Moderator:** ${message.author.tag}` })
			.setFooter({ text: 'User Kick Logs' })
			.setTimestamp();
		message.channel.send({ embeds: [embed] });

		if (id) {
			const logch = id.channel;
			const logsch = this.client.channels.cache.get(logch);

			if (!logsch) return;

			logsch.send({ embeds: [embed] });
		}
	}

};
