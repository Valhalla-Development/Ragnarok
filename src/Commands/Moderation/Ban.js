const Command = require('../../Structures/Command');
const { MessageEmbed, Permissions } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['begone'],
			description: 'Bans tagged user from the guild.',
			category: 'Moderation',
			usage: '<@user> [reason]',
			userPerms: ['BAN_MEMBERS', 'SEND_MESSAGES', 'VIEW_AUDIT_LOG'],
			botPerms: ['BAN_MEMBERS']
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

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Ban**`,
					`**◎ Error:** Run \`${prefix}help ban\` If you are unsure.`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// If user id = message id
		if (user.user.id === message.author.id) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Ban**`,
					`**◎ Error:** You cannot Ban yourself!`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user has a role that is higher than the message author
		if (user.roles.highest.position >= message.member.roles.highest.position) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Ban**`,
					`**◎ Error:** You cannot ban someone with a higher role than yourself!`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user is bannable
		if (user.permissions.has(Permissions.FLAGS.MANAGE_GUILD) || user.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || !user.bannable) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Ban**`,
					`**◎ Error:** You cannot ban <@${user.id}>`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user is the bot
		if (user.user.id === this.client.user.id) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Kick**`,
					`**◎ Error:** You cannot ban me. :slight_frown:`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let reason = args.slice(1).join(' ');
		if (!reason) reason = 'No reason given.';

		// Kick the user and send the embed
		message.guild.members.ban(user, { reason: `${reason}` }).catch(() => {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Ban**`,
					`**◎ Error:** An error occured!`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		});

		const embed = new MessageEmbed()
			.setThumbnail(this.client.user.displayAvatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField('User Banned',
				`**◎ User:** ${user.user.tag}
				**◎ Reason:**: ${reason}
				**◎ Moderator:**: ${message.author.tag}`)
			.setFooter('User Ban Logs')
			.setTimestamp();
		message.channel.send({ embed: embed });

		if (id) {
			const logch = id.channel;
			const logsch = this.client.channels.cache.get(logch);

			if (!logsch) return;

			logsch.send({ embed: embed });
		}
	}

};
