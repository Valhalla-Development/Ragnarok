const Command = require('../../Structures/Command');
const { MessageEmbed, Permissions } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Temp-Bans tagged user from the guild.',
			category: 'Moderation',
			usage: '<@user> <time> [reason]',
			userPerms: ['BAN_MEMBERS'],
			botPerms: ['BAN_MEMBERS']
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const user = message.mentions.users.size ? message.guild.members.cache.get(message.mentions.users.first().id) : message.guild.members.cache.get(args[0]);

		// No user
		if (!user) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Temp-Ban**`,
					`**◎ Error:** Run \`${prefix}help ban\` If you are unsure.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// If user id = message id
		if (user.user.id === message.author.id) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Temp-Ban**`,
					`**◎ Error:** You cannot Ban yourself!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user has a role that is higher than the message author
		if (user.roles.highest.position >= message.member.roles.highest.position) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Temp-Ban**`,
					`**◎ Error:** You cannot ban someone with a higher role than yourself!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user is bannable
		if (user.permissions.has(Permissions.FLAGS.MANAGE_GUILD) || user.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || !user.bannable) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Temp-Ban**`,
					`**◎ Error:** You cannot ban <@${user.id}>`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user is the bot
		if (user.user.id === this.client.user.id) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Kick**`,
					`**◎ Error:** You cannot ban me. :slight_frown:`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Define bantime
		const bantime = args[1];
		if (!bantime) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Temp-Ban**`,
					`**◎ Error:** You must specify a ban time!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Ensure bantime is a valid option
		if (!args[1].match('[dhms]')) {
			this.client.utils.messageDelete(message, 10000);

			const incorrectFormat = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Temp-Ban**`,
					`**◎ Error:** You did not use the correct formatting for the time! The valid options are \`d\`, \`h\`, \`m\` or \`s\``);
			message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Checks if bantime is a number
		if (isNaN(ms(args[1]))) {
			this.client.utils.messageDelete(message, 10000);

			const invalidDur = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Temp-Ban**`,
					`**◎ Error:** Please input a valid duration!`);
			message.channel.send({ embeds: [invalidDur] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if bantime is higher than 30 seconds
		if (ms(args[1]) < '30000') {
			this.client.utils.messageDelete(message, 10000);

			const valueLow = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Temp-Ban**`,
					`**◎ Error:** Please input a value higher than 30 seconds!`);
			message.channel.send({ embeds: [valueLow] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let reason = args.slice(2).join(' ');
		if (!reason) reason = 'No reason given.';

		// Kick the user and send the embed
		await message.guild.members.ban(user, { reason: `${reason}` }).catch(() => {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Temp-Ban**`,
					`**◎ Error:** An error occured!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		});

		const endTime = new Date().getTime() + ms(args[1]);

		const insert = db.prepare('INSERT INTO ban (id, guildid, userid, endtime, channel, username) VALUES (@id, @guildid, @userid, @endtime, @channel, @username);');
		insert.run({
			id: `${message.guild.id}-${user.user.id}`,
			guildid: message.guild.id,
			userid: user.user.id,
			endtime: endTime,
			channel: message.channel.id,
			username: user.user.tag
		});

		const embed = new MessageEmbed()
			.setThumbnail(this.client.user.displayAvatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField('Action | Temp-Banned',
				`**◎ User:** ${user.user.tag}
				**◎ Reason:**: ${reason}
				**◎ Time:** ${bantime}
				**◎ Moderator:**: ${message.author.tag}`)
			.setFooter('User Ban Logs')
			.setTimestamp();
		message.channel.send({ embeds: [embed] });

		const dbid = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
		if (!dbid) return;
		const dblogs = dbid.channel;
		const chnCheck = this.client.channels.cache.get(dblogs);
		if (!chnCheck) {
			db.prepare('DELETE FROM logging WHERE guildid = ?').run(message.guild.id);
		}

		if (dbid) {
			this.client.channels.cache.get(dblogs).send({ embeds: [embed] });
		}
	}

};
