const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(member) {
		this.client.user.setActivity(`${this.client.prefix}help | ${this.client.guilds.cache.size.toLocaleString('en')} Guilds ${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')} Users`,
			{
				type: 'WATCHING'
			}
		);

		const id = db
			.prepare(`SELECT channel FROM logging WHERE guildid = ${member.guild.id};`)
			.get();
		if (id) {
			const logs = id.channel;
			if (logs) {
				const logembed = new MessageEmbed()
					.setAuthor('Member Left', member.user.avatarURL())
					.setDescription(`<@${member.user.id}> - ${member.user.tag}`)
					.setColor(member.guild.me.displayHexColor || 'A10000')
					.setFooter(`ID: ${member.user.id}`)
					.setTimestamp();
				this.client.channels.cache.get(logs).send(logembed);
			}
		}

		// Member Count
		const memStat = db.prepare(`SELECT * FROM membercount WHERE guildid = ${member.guild.id};`).get();
		if (memStat) {
			const channelA = this.client.channels.cache.find((a) => a.id === memStat.channela);
			const channelB = this.client.channels.cache.find((b) => b.id === memStat.channelb);
			const channelC = this.client.channels.cache.find((c) => c.id === memStat.channelc);

			if (channelA) {
				channelA.setName(`Users: ${(member.guild.memberCount - member.guild.members.cache.filter((m) => m.user.bot).size).toLocaleString('en')}`);
			} else {
				db.prepare('DELETE FROM membercount WHERE guildid = ?').run(member.guild.id);
			}
			if (channelB) {
				channelB.setName(`Bots: ${member.guild.members.cache.filter((m) => m.user.bot).size}`);
			} else {
				db.prepare('DELETE FROM membercount WHERE guildid = ?').run(member.guild.id);
			}
			if (channelC) {
				channelC.setName(`Total: ${member.guild.memberCount.toLocaleString('en')}`);
			} else {
				db.prepare('DELETE FROM membercount WHERE guildid = ?').run(member.guild.id);
			}
		}

		/* // Invite Manager
		if (member.user.bot) return;

		const cachedInvites = this.invites.get(member.guild.id);
		const newInvites = await member.guild.fetchInvites();
		this.invites.set(member.guild.id, newInvites);

		const usedInvite = newInvites.find(invite => cachedInvites.get(invite.code).uses < invite.uses);

		const logChannel = member.guild.channels.cache.find(channel => channel.name === 'general');

		if (!logChannel) return;

		const { inviter } = usedInvite;
		const inviteUses = usedInvite.uses;

		const embed = new MessageEmbed()
			.setColor(member.guild.me.displayHexColor || 'A10000')
			.setAuthor(member.guild, member.user.avatarURL())
			.addField(`**Invite Manager**`,
				`**◎ ${member.user} joined**; Invited by ${inviter.username} (${inviteUses} invites)`)
			.setFooter(`ID: ${member.user.id}`)
			.setTimestamp();
		logChannel.send(embed);*/
	}

};
