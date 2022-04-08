const Command = require('../../Structures/Command');
const { MessageEmbed, Permissions, MessageButton } = require('discord.js');
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
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// If user id = message id
		if (user.user.id === message.author.id) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Ban**`,
					`**◎ Error:** You cannot Ban yourself!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user has a role that is higher than the message author
		if (user.roles.highest.position >= message.member.roles.highest.position) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Ban**`,
					`**◎ Error:** You cannot ban someone with a higher role than yourself!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user is bannable
		if (user.permissions.has(Permissions.FLAGS.MANAGE_GUILD) || user.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || !user.bannable) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Ban**`,
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

		let reason = args.slice(1).join(' ');
		if (!reason) reason = 'No reason given.';

		const authoMes = new MessageEmbed()
			.setThumbnail(this.client.user.displayAvatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`You have been banned from: \`${message.guild.name}\``,
				`**◎ Reason:** ${reason}
				**◎ Moderator:** ${message.author.tag}`)
			.setFooter({ text: 'You have been banned' })
			.setTimestamp();
		try {
			user.send({ embeds: [authoMes] });
		} catch {
			// Do nothing
		}

		// Kick the user and send the embed
		message.guild.members.ban(user, { reason: `${reason}` }).catch(() => {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Ban**`,
					`**◎ Error:** An error occured!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		});

		const embed = new MessageEmbed()
			.setThumbnail(this.client.user.displayAvatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField('User Banned',
				`**◎ User:** ${user.user.tag}
				**◎ Reason:** ${reason}
				**◎ Moderator:** ${message.author.tag}`)
			.setFooter({ text: 'User Ban Logs' })
			.setTimestamp();

		const buttonA = new MessageButton()
			.setStyle('SUCCESS')
			.setLabel('Unban')
			.setCustomId('unban');

		if (id && id.channel && id.channel === message.channel.id) return;

		const m = await message.channel.send({ components: [buttonA], embeds: [embed] });
		const filter = (but) => but.user.id === message.author.id;

		const collector = m.createMessageComponentCollector(filter, { time: 10000 });

		collector.on('collect', async b => {
			if (b.customId === 'unban') {
				message.guild.bans.fetch().then((bans) => {
					if (bans.size === 0) {
						this.client.utils.messageDelete(message, 10000);

						const embed1 = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Un-Ban**`,
								`**◎ Error:** An error occured, is the user banned?`);
						message.channel.send({ embeds: [embed1] }).then((me) => this.client.utils.deletableCheck(me, 10000));
						return;
					}
					const bUser = bans.find(ba => ba.user.id === user.user.id);
					if (!bUser) {
						this.client.utils.messageDelete(message, 10000);

						const embed2 = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Un-Ban**`,
								`**◎ Error:** The user specified is not banned!`);
						message.channel.send({ embeds: [embed2] }).then((me) => this.client.utils.deletableCheck(me, 10000));
						return;
					}

					const unbanEmbed = new MessageEmbed()
						.setThumbnail(this.client.user.displayAvatarURL())
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField('Action | Un-Ban',
							`**◎ User ID:** ${user.user.id}
				**◎ Moderator:** ${message.author.tag}`)
						.setFooter({ text: 'User Un-Ban Logs' })
						.setTimestamp();
					message.guild.members.unban(bUser.user).then(() => message.channel.send({ embeds: [unbanEmbed] }));
					collector.stop('unbanned');
				});
			}
		});
		collector.on('end', () => {
			buttonA.setDisabled(true);
			m.update({ components: [buttonA], embeds: [embed] });
		});

		if (id) {
			const logch = id.channel;
			const logsch = this.client.channels.cache.get(logch);

			if (!logsch) return;

			logsch.send({ embeds: [embed] });
		}
	}

};
