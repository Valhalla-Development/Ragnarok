const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const ms = require('ms');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['shh'],
			description: 'Mutes tagged user.',
			category: 'Moderation',
			usage: '<@user>'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;


		if (!message.member.hasPermission('KICK_MEMBERS') && !this.client.owners.includes(message.author.id)) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** You need to have the \`KICK_MEMBERS\` permission to use this command.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const mod = message.author;
		const user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
		if (!user) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** Run \`${prefix}help mute\` If you are unsure.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		const reason = message.content
			.split(' ')
			.splice(3)
			.join(' ');
		if (!reason) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** You must specify a reason for the mute!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		const muterole = message.guild.roles.cache.find((x) => x.name === 'Muted');
		if (!muterole) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** I could not find the mute role! Please create it, it **must** be named \`Muted\``);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const mutetime = args[1];
		if (!mutetime) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** You must specify a mute time!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (user.roles.cache.has(muterole.id)) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField(`**${this.client.user.username} - Mute**`,
					`**◎ Error:** This user is already muted!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const dbid = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
		if (!dbid) {
			await user.roles.add(muterole.id);
			const embed = new MessageEmbed()
				.setThumbnail(this.client.user.displayAvatarURL())
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('Action | Mute', [
					`**◎ User:** <@${user.id}>`,
					`**◎ Reason:** ${reason}`,
					`**◎ Time:** ${mutetime}`,
					`**◎ Moderator:** ${mod}`
				])
				.setTimestamp();
			message.channel.send(embed);

			setTimeout(() => {
				user.roles.remove(muterole.id);
				const embed1 = new MessageEmbed()
					.setThumbnail(this.client.user.displayAvatarURL())
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('Action | Un-Mute', [
						`**◎ User:** <@${user.id}>`,
						`**◎ Reason:** Mute time ended.`
					])
					.setTimestamp();
				message.channel.send(embed1);
			}, ms(mutetime));
		} else {
			const dblogs = dbid.channel;
			await user.roles.add(muterole.id);

			const embed = new MessageEmbed()
				.setThumbnail(this.client.user.displayAvatarURL())
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('Action | Mute', [
					`**◎ User:** <@${user.id}>`,
					`**◎ Reason:** ${reason}`,
					`**◎ Time:** ${mutetime}`,
					`**◎ Moderator:** ${mod}`
				])
				.setTimestamp();
			this.client.channels.cache.get(dblogs).send(embed);
			message.channel.send(embed);

			setTimeout(() => {
				user.roles.remove(muterole.id);

				const embed2 = new MessageEmbed()
					.setThumbnail(this.client.user.displayAvatarURL())
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('Action | Un-Mute', [
						`**◎ User:** <@${user.id}>`,
						`**◎ Reason:** Mute time ended.`
					])
					.setTimestamp();
				this.client.channels.cache.get(dblogs).send(embed2);
				message.channel.send(embed2);
			}, ms(mutetime));
		}
	}

};
