const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['unshh'],
			description: 'Unmutes tagged user.',
			category: 'Moderation',
			usage: '<@user>',
			requiredPermission: 'MANAGE_MESSAGES'
		});
	}

	async run(message, args) {
		const mod = message.author;
		const user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
		if (!user) {
			const nomodRole = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Unmute**`,
					`**◎ Error:** You must mention someone to unmute them!`);
			message.channel.send(nomodRole).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		const muterole = message.guild.roles.cache.find((x) => x.name === 'Muted');
		if (!user.roles.cache.find((x) => x.id === muterole.id)) {
			const nomodRole = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Unmute**`,
					`**◎ Error:** This user is not muted!`);
			message.channel.send(nomodRole).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const dbid = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
		if (!dbid) {
			await user.roles.remove(muterole.id);
			const embed = new MessageEmbed()
				.setThumbnail(this.client.user.displayAvatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField('Action | Un-Mute', [
					`**◎ User:** <@${user.id}>`,
					`**◎ Staff Member:** ${mod}`
				])
				.setTimestamp();
			message.channel.send(embed);
		} else {
			const dblogs = dbid.channel;
			await user.roles.remove(muterole.id);
			const embed1 = new MessageEmbed()
				.setThumbnail(this.client.user.displayAvatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField('Action | Un-Mute', [
					`**◎ User:** <@${user.id}>`,
					`**◎ Staff Member:** ${mod}`
				])
				.setTimestamp();
			this.client.channels.cache.get(dblogs).send(embed1);
			message.channel.send(embed1);
		}
	}

};
