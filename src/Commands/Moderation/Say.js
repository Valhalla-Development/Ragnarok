const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['echo'],
			description: 'Makes the bot post given text.',
			category: 'Moderation',
			usage: '[channel] <text>',
			userPerms: ['MANAGE_MESSAGES']
		});
	}

	async run(message, args) {
		this.client.utils.messageDelete(message, 0);

		let input;
		const channel = message.mentions.channels.first();

		if (channel) {
			const ch = message.guild.channels.cache.get(channel.id);

			if (ch.type !== 'GUILD_TEXT' && ch.type !== 'GUILD_NEWS') {
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Say**`,
						`**◎ Error:** Please input a valid channel!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (!ch) {
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Say**`,
						`**◎ Error:** I could not find the channel you mentioned!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (!message.guild.me.permissionsIn(ch).has('SEND_MESSAGES')) {
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Say**`,
						`**◎ Error:** I do not have permissions to send a message in ${ch}!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			input = args.slice(1).join(' ');

			if (!input) {
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Say**`,
						`**◎ Error:** You need to input text!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const user = message.guild.members.cache.get(message.author.id);
			if (!user.permissionsIn(ch).has('SEND_MESSAGES')) {
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Say**`,
						`**◎ Error:** You do not have permission to send messages to ${ch}!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			ch.send(input);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Say**`,
					`**◎ Success:** The following message has been posted in ${ch}\n\n${input}`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		} else {
			input = args.join(' ');

			if (!input) {
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Say**`,
						`**◎ Error:** You need to input text!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			message.channel.send(input);
		}
	}

};
