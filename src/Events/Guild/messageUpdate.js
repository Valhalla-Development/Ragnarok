const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(oldMessage, newMessage) {
		if (!newMessage.guild || oldMessage.content === newMessage.content || newMessage.author.bot) return;
		const adsprot = db.prepare('SELECT count(*) FROM adsprot WHERE guildid = ?').get(newMessage.guild.id);
		if (adsprot['count(*)']) {
			if (newMessage.content.includes('https://') || newMessage.content.includes('http://') || newMessage.content.includes('discord.gg') || newMessage.content.includes('discord.me') || newMessage.content.includes('discord.io')) {
				if (!newMessage.member.hasPermission('MANAGE_MESSAGES')) {
					newMessage.delete();
					newMessage.channel.send(`**Your message contained a link and it was deleted, <@${newMessage.author.id}>**`)
						.then((msg) => {
							msg.delete({ timeout: 15000 });
						});
				}
			}
		}

		// This never runs if adsprot is disabled, damn
		const id = db
			.prepare(`SELECT channel FROM logging WHERE guildid = ${oldMessage.guild.id};`)
			.get();
		if (!id) return;
		const logs = id.channel;
		if (!logs) return;

		if (oldMessage.content.length === 0) {
			return;
		}
		if (oldMessage.author.bot === true) {
			return;
		}
		if (oldMessage.content === newMessage.content) {
			return;
		}
		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(newMessage.guild.me.displayHexColor))
			.setAuthor(oldMessage.author.tag, this.client.user.displayAvatarURL({ dynamic: true }))
			.setTitle('Message Updated')
			.setDescription([
				`**◎ Before:**\n${oldMessage.content}`,
				`**◎ After:**\n${newMessage.content}`
			])
			.setTimestamp()
			.setURL(oldMessage.url);
		this.client.channels.cache.get(logs).send(embed);
	}

};
