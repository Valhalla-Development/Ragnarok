const Command = require('../../Structures/Command');
const { EmbedBuilder, PermissionsBitField, MessageButton, MessageActionRow } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['begone'],
			description: 'Bans tagged user from the guild.',
			category: 'Moderation',
			usage: '<@user> [reason]',
			userPerms: ['BanMembers', 'SendMessages', 'ViewAuditLog'],
			botPerms: ['BanMembers']
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();

		const user = message.mentions.users.size ? message.guild.members.members.cache.get(message.mentions.users.first().id) : message.guild.members.members.cache.get(args[0]);

		// No user
		if (!user) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Ban**`,
					value: `**◎ Error:** Run \`${prefix}help ban\` If you are unsure.` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// If user id = message id
		if (user.user.id === message.author.id) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Ban**`,
					value: `**◎ Error:** You cannot Ban yourself!` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user has a role that is higher than the message author
		if (user.roles.highest.position >= message.member.roles.highest.position) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Ban**`,
					value: `**◎ Error:** You cannot ban someone with a higher role than yourself!` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user is bannable
		if (user.permissions.has(PermissionsBitField.ManageGuild) || user.permissions.has(PermissionsBitField.Administrator) || !user.bannable) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Ban**`,
					value: `**◎ Error:** You cannot ban <@${user.id}>` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Check if user is the bot
		if (user.user.id === this.client.user.id) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Kick**`,
					value: `**◎ Error:** You cannot ban me. :slight_frown:` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let reasonArgs = args.slice(1).join(' ');
		if (!reasonArgs) reasonArgs = 'No reason given.';

		const authoMes = new EmbedBuilder()
			.setThumbnail(this.client.user.displayAvatarURL())
			.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
			.addFields({ name: `You have been banned from: \`${message.guild.name}\``,
				value: `**◎ Reason:** ${reasonArgs}
				**◎ Moderator:** ${message.author.tag}` })
			.setFooter({ text: 'You have been banned' })
			.setTimestamp();
		try {
			user.send({ embeds: [authoMes] });
		} catch {
			// Do nothing
		}

		// Kick the user and send the embed
		message.guild.members.members.ban(user, { days: 1, reason: `${reasonArgs}` }).catch(() => {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Ban**`,
					value: `**◎ Error:** An error occured!` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		});

		const embed = new EmbedBuilder()
			.setThumbnail(this.client.user.displayAvatarURL())
			.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
			.addFields({ name: 'User Banned',
				value: `**◎ User:** ${user.user.tag}
				**◎ Reason:** ${reasonArgs}
				**◎ Moderator:** ${message.author.tag}` })
			.setFooter({ text: 'User Ban Logs' })
			.setTimestamp();

		const buttonA = new MessageButton()
			.setStyle('SUCCESS')
			.setLabel('Unban')
			.setCustomId('unban');

		const row = new MessageActionRow()
			.addComponents(buttonA);

		if (id && id.channel && id.channel === message.channel.id) return;

		const m = await message.channel.send({ components: [row], embeds: [embed] });
		const filter = (but) => but.user.id === message.author.id;

		const collector = m.createMessageComponentCollector({ filter: filter, time: 15000 });

		collector.on('collect', async b => {
			if (b.customId === 'unban') {
				message.guild.bans.fetch().then((bans) => {
					if (bans.size === 0) {
						this.client.utils.messageDelete(message, 10000);

						const embed1 = new EmbedBuilder()
							.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
							.addFields({ name: `**${this.client.user.username} - Un-Ban**`,
								value: `**◎ Error:** An error occured, is the user banned?` });
						message.channel.send({ embeds: [embed1] }).then((me) => this.client.utils.deletableCheck(me, 10000));
						return;
					}
					const bUser = bans.find(ba => ba.user.id === user.user.id);
					if (!bUser) {
						this.client.utils.messageDelete(message, 10000);

						const embed2 = new EmbedBuilder()
							.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
							.addFields({ name: `**${this.client.user.username} - Un-Ban**`,
								value: `**◎ Error:** The user specified is not banned!` });
						message.channel.send({ embeds: [embed2] }).then((me) => this.client.utils.deletableCheck(me, 10000));
						return;
					}

					const unbanEmbed = new EmbedBuilder()
						.setThumbnail(this.client.user.displayAvatarURL())
						.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
						.addFields({ name: 'Action | Un-Ban',
							value: `**◎ User ID:** ${user.user.id}
				**◎ Moderator:** ${message.author.tag}` })
						.setFooter({ text: 'User Un-Ban Logs' })
						.setTimestamp();
					message.guild.members.members.unban(bUser.user).then(() => message.channel.send({ embeds: [unbanEmbed] }));
					collector.stop('unbanned');
				});
			}
		});
		collector.on('end', () => {
			this.client.utils.deletableCheck(m, 0);
		});

		if (id) {
			const logch = id.channel;
			const logsch = this.client.channels.cache.get(logch);

			if (!logsch) return;

			logsch.send({ embeds: [embed] });
		}
	}

};
