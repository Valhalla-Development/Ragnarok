const Command = require('../../Structures/Command');
const { Permissions, MessageEmbed } = require('discord.js');
const ms = require('ms');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['shh', 'mute'],
			description: 'Timeouts tagged user.',
			category: 'Moderation',
			userPerms: ['MODERATE_MEMBERS'],
			botPerms: ['MODERATE_MEMBERS'],
			usage: '<@user>, <time> (reason>)'
		});
	}

	async run(message, args) {
		this.client.utils.messageDelete(message, 10000);

		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		if (!args[0]) {
			const incorrectFormat = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Timeout**`,
					`**◎ Error:** Incorrect usage! Available Commands:
					\`${prefix}timeout <@user> <time> (reason)\`
					\`${prefix}timeout clear <@user>\``);
			message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const user = message.mentions.members.first() || message.guild.members.cache.find(usr => usr.id === args[0]);

		if (!user) {
			const incorrectFormat = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Timeout**`,
					`**◎ Error:** Incorrect usage! Available Commands:
					\`${prefix}timeout <@user> <time> (reason)\`
					\`${prefix}timeout clear <@user>\``);
			message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user is message.author
		if (user.user.id === message.author.id) {
			const incorrectFormat = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Timeout**`,
					`**◎ Error:** You can't timeout yourself!`);
			message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user is bannable
		if (user.permissions.has(Permissions.FLAGS.MANAGE_GUILD) || user.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Timeout**`,
					`**◎ Error:** You cannot timeout <@${user.id}>`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[0] === 'clear') {
			if (!args[1]) {
				const incorrectFormat = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Timeout**`,
						`**◎ Error:** Incorrect usage! Please use \`${prefix}timeout clear <@user>\``);
				message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const userClear = message.mentions.members.first() || message.guild.members.cache.find(usr => usr.id === args[0]);
			if (!userClear) {
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Timeout**`,
						`**◎ Error:** Run \`${prefix}help timeout\` If you are unsure.`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (!user.isCommunicationDisabled()) {
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Timeout**`,
						`**◎ Error:** ${user} is not timed out`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			try {
				user.timeout(0);
			} catch {
				const valueLow = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Timeout**`,
						`**◎ Error:** An unknown error occured.`);
				message.channel.send({ embeds: [valueLow] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const embed = new MessageEmbed()
				.setThumbnail(this.client.user.displayAvatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField('Action | Timeout Clear',
					`**◎ User:** ${user.user.tag}
				**◎ Moderator:** ${message.author.tag}`)
				.setFooter({ text: 'User Timeout Logs' })
				.setTimestamp();

			message.channel.send({ embeds: [embed] });

			const dbid = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
			if (dbid && dbid.channel && dbid.channel === message.channel.id) return;

			if (!dbid) return;
			const dblogs = dbid.channel;
			const chnCheck = this.client.channels.cache.get(dblogs);

			if (dbid && chnCheck) {
				this.client.channels.cache.get(dblogs).send({ embeds: [embed] });
			}
			return;
		}

		if (!user) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Timeout**`,
					`**◎ Error:** Run \`${prefix}help timeout\` If you are unsure.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (user.isCommunicationDisabled()) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Timeout**`,
					`**◎ Error:** ${user} is already timed out, are you looking for \`${prefix}timeout clear\``);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const timeoutTime = args[1];
		if (!timeoutTime) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Timeout**`,
					`**◎ Error:** You must specify a timeout time!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Ensure timeoutTime is a valid option
		if (!args[1].match('[dhms]')) {
			const incorrectFormat = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Timeout**`,
					`**◎ Error:** You did not use the correct formatting for the time! The valid options are \`d\`, \`h\`, \`m\` or \`s\``);
			message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Checks if timeoutTime is a number
		if (isNaN(ms(args[1]))) {
			const invalidDur = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Timeout**`,
					`**◎ Error:** Please input a valid duration!`);
			message.channel.send({ embeds: [invalidDur] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if timeoutTime is higher than 30 seconds
		if (ms(args[1]) < '30000') {
			const valueLow = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Timeout**`,
					`**◎ Error:** Please input a value higher than 30 seconds!`);
			message.channel.send({ embeds: [valueLow] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if timeoutTime is higher than 28 days
		if (ms(args[1]) > '2419200000') {
			const valueLow = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Timeout**`,
					`**◎ Error:** Please input a value lower than 28 days!`);
			message.channel.send({ embeds: [valueLow] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const endTime = new Date().getTime() + ms(args[1]);
		const nowInSecond = Math.round(endTime / 1000);

		let reason = args.slice(2).join(' ');
		if (!reason) reason = 'No reason given.';

		try {
			user.timeout(ms(args[1]), reason);
		} catch {
			const valueLow = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Timeout**`,
					`**◎ Error:** An unknown error occured.`);
			message.channel.send({ embeds: [valueLow] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const embed = new MessageEmbed()
			.setThumbnail(this.client.user.displayAvatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField('Action | Timeout',
				`**◎ User:** ${user.user.tag}
				**◎ Reason:** ${reason}
				**◎ Time:** <t:${nowInSecond}>
				**◎ Moderator:** ${message.author.tag}`)
			.setFooter({ text: 'User Timeout Logs' })
			.setTimestamp();

		message.channel.send({ embeds: [embed] });

		const dbid = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
		if (dbid && dbid.channel && dbid.channel === message.channel.id) return;

		if (!dbid) return;
		const dblogs = dbid.channel;
		const chnCheck = this.client.channels.cache.get(dblogs);

		if (dbid && chnCheck) {
			this.client.channels.cache.get(dblogs).send({ embeds: [embed] });
		}
	}

};
