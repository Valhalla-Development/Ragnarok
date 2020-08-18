const Event = require('../../Structures/Event');
const RagnarokEmbed = require('../../Structures/RagnarokEmbed');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(message) {
		if (!message.guild || message.author.bot) return;
		// the following code is from menudocs, test it and probably replace your own code with this bruh
		const attachments = message.attachments.size ? message.attachments.map(attachment => attachment.proxyURL) : null;
		const embed = new RagnarokEmbed()
			.setColor(message.guild.me.displayHexColor || '36393F')
			.setAuthor(message.author.tag, this.client.user.displayAvatarURL({ dynamic: true }))
			.setTitle('Message Deleted')
			.setDescription([
				`**◎ Message ID:** ${message.id}`,
				`**◎ Channel:** ${message.channel}`,
				`**◎ Author:** ${message.member.displayName}`,
				`${attachments ? `**◎ Attachments:** ${attachments.join('\n')}` : ''}`
			])
			.setTimestamp();
		if (message.content.length) {
			embed.splitFields(`**◎ Deleted Message:** ${message.content}`);
		}
		const channel = message.guild.channels.cache.find(ch => ch.name === 'owner-testing');
		if (channel) channel.send(embed);
		// stolen code from menudocs ends here

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
				.setAuthor('Message Deleted')
				.setDescription(`**A message sent by <@${message.author.id}> was deleted but no content was found.**`)
				.setTimestamp();
			this.client.channels.cache.get(logs).send(noLogE);
			return;
		}

		const logembed = new MessageEmbed()
			.setAuthor('Message Deleted')
			.setDescription(`**Message sent by <@${message.author.id}> deleted in <#${message.channel.id}>** \n ${message.content}`
			)
			.setColor(message.guild.member(this.client.user).displayHexColor)
			.setFooter(`ID: ${message.channel.id}`)
			.setTimestamp();
		this.client.channels.cache.get(logs).send(logembed);
	}

};
