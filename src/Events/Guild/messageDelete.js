const Event = require('../../Structures/Event');
const RagnarokEmbed = require('../../Structures/RagnarokEmbed');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(message) {
		if (!message.guild || message.author.bot) return;

		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
		if (!id) return;
		const logs = id.channel;
		if (!logs) return;

		const fetchedLogs = await message.guild.fetchAuditLogs({
			limit: 1,
			type: 'MESSAGE_DELETE'
		});
		const deletionLog = fetchedLogs.entries.first();

		// Check if message deleted was a command, return if it was

		const cmd = message.content.substring(1).replace(/ .*/, '').toLowerCase();
		const commandfile = this.client.commands.get(cmd) || this.client.commands.get(this.client.aliases.get(cmd));
		if (commandfile) {
			return;
		}

		if (!deletionLog) {
			const noLogE = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setAuthor({ name: message.author.tag, iconURL: this.client.user.displayAvatarURL({ dynamic: true }) })
				.setTitle('Message Deleted')
				.setDescription([
					`**◎ No Data:** A message sent by <@${message.author.id}> was deleted but no content was found.**`
				])
				.setTimestamp();
			this.client.channels.cache.get(logs).send({ embeds: [noLogE] });
			return;
		}

		const attachments = message.attachments.size ? message.attachments.map(attachment => attachment.proxyURL) : null;
		const embed = new RagnarokEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setAuthor({ name: message.author.tag, iconURL: this.client.user.displayAvatarURL({ dynamic: true }) })
			.setTitle('Message Deleted')
			.setDescription([
				`**◎ Message ID:** ${message.id}`,
				`**◎ Channel:** ${message.channel}`,
				`**◎ Author:** ${message.guild.members.resolve(message.author) ? message.author : message.author.username}`,
				`${attachments ? `**◎ Attachments:** ${attachments.join('\n')}` : ''}`
			])
			.setTimestamp();
		if (message.content.length) {
			embed.splitFields(`**◎ Deleted Message:** ${message.content}`);
		}
		this.client.channels.cache.get(logs).send({ embeds: [embed] });
	}

};
