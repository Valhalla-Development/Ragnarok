const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Un-bans specified user.',
			category: 'Moderation',
			usage: '<user-id>',
			userPerms: ['BAN_MEMBERS'],
			botPerms: ['BAN_MEMBERS', 'VIEW_AUDIT_LOG']
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		// No user
		if (!args[0]) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Un-Ban**`,
					`**◎ Error:** Run \`${prefix}help unban\` If you are unsure.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const embed = new MessageEmbed()
			.setThumbnail(this.client.user.displayAvatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField('Action | Un-Ban',
				`**◎ User ID:** ${args[0]}
				**◎ Moderator:**: ${message.author.tag}`)
			.setFooter('User Un-Ban Logs')
			.setTimestamp();

		message.guild.bans.fetch().then((bans) => {
			if (bans.size === 0) {
				this.client.utils.messageDelete(message, 10000);

				const embed1 = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Un-Ban**`,
						`**◎ Error:** An error occured, is the user banned?`);
				message.channel.send({ embeds: [embed1] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			const bUser = bans.find(b => b.user.id === args[0]);
			if (!bUser) {
				this.client.utils.messageDelete(message, 10000);

				const embed2 = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Un-Ban**`,
						`**◎ Error:** The user specified is not banned!`);
				message.channel.send({ embeds: [embed2] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			message.guild.members.unban(bUser.user).then(() => message.channel.send({ embeds: [embed] }));
		});

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
