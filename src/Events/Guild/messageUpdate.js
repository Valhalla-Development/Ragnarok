const Event = require('../../Structures/Event');
const { MessageEmbed, Permissions } = require('discord.js');
const RagnarokEmbed = require('../../Structures/RagnarokEmbed');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const urlRegexSafe = require('url-regex-safe');

module.exports = class extends Event {

	async run(oldMessage, newMessage) {
		if (!newMessage.guild || oldMessage.content === newMessage.content || newMessage.author.bot) return;
		const adsprot = db.prepare('SELECT count(*) FROM adsprot WHERE guildid = ?').get(newMessage.guild.id);
		if (adsprot['count(*)']) {
			if (!newMessage.member.guild.me.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
				const npPerms = new MessageEmbed()
					.setColor(this.client.utils.color(newMessage.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ads Protection**`,
						`**◎ Error:** I do not have the \`MANAGE_MESSAGES\` permissions. Disabling Ads Protection.`);
				newMessage.channel.send({ embeds: [npPerms] }).then((m) => newMessage.utils.messageDelete(m, 0));
				db.prepare('DELETE FROM adsprot WHERE guildid = ?').run(newMessage.guild.id);
				return;
			}
			const matches = urlRegexSafe({ strict: false }).test(newMessage.content.toLowerCase());
			if (matches) {
				if (newMessage.member.guild.me.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
					this.client.utils.messageDelete(newMessage, 0);
					newMessage.channel.send(`**◎ Your message contained a link and it was deleted, ${newMessage.author}**`)
						.then((msg) => {
							this.client.utils.deletableCheck(msg, 10000);
						});
				}
			}
		}

		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${oldMessage.guild.id};`).get();
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
		const embed = new RagnarokEmbed()
			.setColor(this.client.utils.color(newMessage.guild.me.displayHexColor))
			.setAuthor({ name: `${oldMessage.author.tag}`, iconURL: this.client.user.displayAvatarURL({ dynamic: true }) })
			.setTitle('Message Updated')
			.splitFields([
				`**◎ Before:**\n${oldMessage.content}`,
				`**◎ After:**\n${newMessage.content}`// do magic here, nitro lets you post 6k characters, trim it bub
			])
			.setTimestamp()
			.setURL(oldMessage.url);
		this.client.channels.cache.get(logs).send({ embeds: [embed] });
	}

};
