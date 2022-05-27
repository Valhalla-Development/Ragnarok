/* eslint-disable prefer-destructuring */
const Command = require('../../Structures/Command');
const ms = require('ms');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['slowmo', 'slowmode', 'panik'],
			description: 'Sets the slowmode of the specified channel!',
			category: 'Moderation',
			usage: '[channel] <slowmode>',
			userPerms: ['MANAGE_CHANNELS'],
			botPerms: ['MANAGE_CHANNELS']
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		let channel;
		let time;

		if (message.mentions.channels.first()) {
			channel = message.mentions.channels.first();
			time = args[1];
		} else {
			channel = message.channel;
			time = args[0];
		}

		// Check if the channel exists in the guild
		const guildCheck = message.guild.channels.cache.find(c => c.id === channel.id);
		if (!guildCheck) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Slow**`,
					`**◎ Error:** The specified channel does not exist in this guild!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[0] === 'off' || args[1] === 'off') {
			this.client.utils.messageDelete(message, 10000);

			channel.setRateLimitPerUser(0);
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Slow**`,
					`**◎ Success:** <#${channel.id}> is no longer in slowmode.`);
			channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!time) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Slow**`,
					`**◎ Error:** You did not include a valid time! Correct usage is:\n\`${prefix}slow [channel] <time>\` an example would be: \`${prefix}slow #general 10s\` or \`${prefix}slow 10s\``);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const convert = ms(time);
		const toSecond = Math.floor(convert / 1000);

		if (!toSecond || toSecond === undefined) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Slow**`,
					`**◎ Error:** You did not include a valid time! Correct usage is:\n\`${prefix}slow [channel] <time>\` an example would be: \`${prefix}slow #general 10s\` or \`${prefix}slow 10s\``);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (toSecond > 21600) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Slow**`,
					`**◎ Error:** The maximum cooldown is 6 hours.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		} else if (toSecond < 1) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Slow**`,
					`**◎ Error:** The minimum cooldown is 1 second.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		this.client.utils.messageDelete(message, 10000);

		await channel.setRateLimitPerUser(toSecond);

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Slow**`,
				`**◎ Success:** <#${channel.id}> is now in slowmode. Regular users can send messages every \`${ms(ms(time), { long: true })}\``);
		channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
		return;
	}

};
