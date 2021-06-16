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
			userPerms: ['MANAGE_MESSAGES'],
			botPerms: ['MANAGE_GUILD']
		});
	}

	async run(message, args) {
		const mod = message.author;
		const user = message.mentions.users.size ? message.guild.members.cache.get(message.mentions.users.first().id) : message.guild.members.cache.get(args[0]);

		if (!user) {
			this.client.utils.messageDelete(message, 10000);

			const nomodRole = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Unmute**`,
					`**◎ Error:** You must mention someone to unmute them!`);
			message.channel.send({ embeds: [nomodRole] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const muteRoleGrab = db.prepare(`SELECT role FROM muterole WHERE guildid = ${message.guild.id}`).get();
		let muteRole;
		if (muteRoleGrab) {
			muteRole = message.guild.roles.cache.find((r) => r.id === muteRoleGrab.role);
		} else {
			muteRole = message.guild.roles.cache.find((x) => x.name === 'Muted');
		}

		if (user.roles.cache.has(muteRole.id)) {
			this.client.utils.messageDelete(message, 10000);

			const nomodRole = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Unmute**`,
					`**◎ Error:** This user is not muted!`);
			message.channel.send({ embeds: [nomodRole] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		await user.roles.remove(muteRole);

		const embed = new MessageEmbed()
			.setThumbnail(this.client.user.displayAvatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField('Action | Un-Mute',
				`**◎ User:** <@${user.user.id}>
				**◎ Staff Member:** ${mod}`)
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
