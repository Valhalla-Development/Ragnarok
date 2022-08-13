const Command = require('../../Structures/Command');
const { EmbedBuilder } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['echo'],
			description: 'Makes the bot post given text.',
			category: 'Moderation',
			usage: '[channel] <text>',
			userPerms: ['ManageMessages']
		});
	}

	async run(message, args) {
		this.client.utils.messageDelete(message, 0);

		let input;

		let channel;
		// Regex to find channel mentions
		const channelRegex = /<#(\d{17,19})>/g;
		// Check if args[0] is a channel tag
		if (channelRegex.test(args[0])) {
			// Get the channel id
			const channelId = args[0].match(channelRegex)[0].replace(/[<#>]/g, '');
			// Get the channel
			channel = message.guild.channels.cache.get(channelId);
		}

		if (channel) {
			const ch = message.guild.channels.cache.get(channel.id);

			if (ch.type !== 'GUILD_TEXT' && ch.type !== 'GUILD_NEWS') {
				const embed = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
					.addFields({ name: `**${this.client.user.username} - Say**`,
						value: `**◎ Error:** Please input a valid channel!` });
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (!ch) {
				const embed = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
					.addFields({ name: `**${this.client.user.username} - Say**`,
						value: `**◎ Error:** I could not find the channel you mentioned!` });
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (!message.guild.members.me.permissionsIn(ch).has('SEND_MESSAGES')) {
				const embed = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
					.addFields({ name: `**${this.client.user.username} - Say**`,
						value: `**◎ Error:** I do not have permissions to send a message in ${ch}!` });
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			input = args.slice(1).join(' ');

			if (!input) {
				const embed = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
					.addFields({ name: `**${this.client.user.username} - Say**`,
						value: `**◎ Error:** You need to input text!` });
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const user = message.guild.members.cache.get(message.author.id);
			if (!user.permissionsIn(ch).has('SEND_MESSAGES')) {
				const embed = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
					.addFields({ name: `**${this.client.user.username} - Say**`,
						value: `**◎ Error:** You do not have permission to send messages to ${ch}!` });
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			ch.send(input);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Say**`,
					value: `**◎ Success:** The following message has been posted in ${ch}\n\n${input}` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		} else {
			input = args.join(' ');

			if (!input) {
				const embed = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
					.addFields({ name: `**${this.client.user.username} - Say**`,
						value: `**◎ Error:** You need to input text!` });
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			message.channel.send(input);
		}
	}

};
