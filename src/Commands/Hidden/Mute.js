const Command = require('../../Structures/Command');
const { MessageEmbed, Permissions } = require('discord.js');
const ms = require('ms');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['shh'],
			description: 'Mutes tagged user.',
			category: 'Hidden',
			usage: '<@user> <time> [reason]',
			userPerms: ['MANAGE_MESSAGES'],
			botPerms: ['MANAGE_GUILD'],
			ownerOnly: true
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const muteRoleGrab = db.prepare(`SELECT role FROM muterole WHERE guildid = ${message.guild.id}`).get();
		let muteRole;
		if (muteRoleGrab) {
			muteRole = message.guild.roles.cache.find((r) => r.id === muteRoleGrab.role);
		} else {
			muteRole = message.guild.roles.cache.find((x) => x.name === 'Muted');
		}

		// Checks if muteRole exists
		if (!muteRole) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** I could not find the mute role! Please create it, it **must** be named \`Muted\`\n You can set a custom Mute role with: \`${prefix}config mute role <@role>\``);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const user = message.mentions.users.size ? message.guild.members.cache.get(message.mentions.users.first().id) : message.guild.members.cache.get(args[0]);

		// No user
		if (!user) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** Run \`${prefix}help mute\` If you are unsure.`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// If user id = message id
		if (user.user.id === message.author.id) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** You cannot Mute yourself!`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user has a role that is higher than the message author
		if (user.roles.highest.position >= message.member.roles.highest.position) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** You cannot Mute someone with a higher role than yourself!`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user is muteable
		if (user.permissions.has(Permissions.FLAGS.MANAGE_GUILD) || user.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** You cannot Mute <@${user.id}>`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user is the bot
		if (user.user.id === this.client.user.id) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** You cannot Mute me. :slight_frown:`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Define mutetime
		const mutetime = args[1];
		if (!mutetime) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** You must specify a mute time!`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Ensure mutetime is a valid option
		if (!args[1].match('[dhms]')) {
			this.client.utils.messageDelete(message, 10000);

			const incorrectFormat = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** You did not use the correct formatting for the time! The valid options are \`d\`, \`h\`, \`m\` or \`s\``);
			message.channel.send({ embed: incorrectFormat }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Checks if mutetime is a number
		if (isNaN(ms(args[1]))) {
			this.client.utils.messageDelete(message, 10000);

			const invalidDur = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** Please input a valid duration!`);
			message.channel.send({ embed: invalidDur }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if mutetime is higher than 30 seconds
		if (ms(args[1]) < '30000') {
			this.client.utils.messageDelete(message, 10000);

			const valueLow = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** Please input a value higher than 30 seconds!`);
			message.channel.send({ embed: valueLow }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let reason = args.slice(2).join(' ');
		if (!reason) reason = 'No reason given.';

		if (user.roles.cache.has(muteRole.id)) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** This user is already muted!`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// When the mute ends
		// eslint-disable-next-line no-mixed-operators
		const endTime = new Date().getTime() + ms(args[1]);

		await user.roles.add(muteRole);

		const insert = db.prepare('INSERT INTO mute (id, guildid, userid, endtime, channel) VALUES (@id, @guildid, @userid, @endtime, @channel);');
		insert.run({
			id: `${message.guild.id}-${user.user.id}`,
			guildid: message.guild.id,
			userid: user.user.id,
			endtime: endTime,
			channel: message.channel.id
		});

		const embed = new MessageEmbed()
			.setThumbnail(this.client.user.displayAvatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField('Action | Mute',
				`**◎ User:** <@${user.user.id}>
				**◎ Reason:** ${reason}
				**◎ Time:** ${mutetime}
				**◎ Moderator:** ${message.author}`)
			.setTimestamp();
		message.channel.send({ embed: embed });

		const dbid = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
		if (!dbid) return;
		const dblogs = dbid.channel;
		const chnCheck = this.client.channels.cache.get(dblogs);
		if (!chnCheck) {
			db.prepare('DELETE FROM logging WHERE guildid = ?').run(message.guild.id);
		}

		if (dbid) {
			this.client.channels.cache.get(dblogs).send({ embed: embed });
		}
	}

};
