const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(invite) {
		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${invite.guild.id};`).get();
		if (!id) return;
		const logs = id.channel;
		if (!logs) return;

		const toHHMMSS = (secs) => {
			const secNum = parseInt(secs, 10);
			const hours = Math.floor(secNum / 3600);
			const minutes = Math.floor(secNum / 60) % 60;

			return [hours, minutes]
				.map((v) => v < 10 ? `0${v}` : v)
				.filter((v, i) => v !== '00' || i > 0)
				.join(' Hours ');
		};

		let expiry;

		if (invite.maxAge !== 0) {
			expiry = `${toHHMMSS(invite.maxAge)} Minutes`;
		} else {
			expiry = 'Never';
		}

		const logembed = new MessageEmbed()
			.setAuthor(invite.guild, invite.guild.iconURL())
			.setDescription(`**Invite Created:**\n**Created By:** ${invite.inviter}\n**Expires:** \`${expiry}\`\n**Location:** ${invite.channel}\n**Invite:** [https://discord.gg/${invite.code}](https://discord.gg/${invite.code}${invite.code})`)
			.setColor('990000')
			.setTimestamp();
		this.client.channels.cache.get(logs).send(logembed);
	}

};
