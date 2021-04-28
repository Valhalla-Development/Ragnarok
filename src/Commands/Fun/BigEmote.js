const Command = require('../../Structures/Command');
const { MessageEmbed, Util } = require('discord.js');
const { parse } = require('twemoji-parser');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays an emote at full size.',
			category: 'Fun',
			usage: '<emote>'
		});
	}

	async run(message, args) {
		const emoji = args[0];

		if (!emoji) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - BigEmote**`,
					`**◎ Error:** Incorrect usage! Please specify an emote!`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		this.client.utils.messageDelete(message, 0);

		const custom = Util.parseEmoji(emoji);

		if (custom.id) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setTitle(`BigEmote - Requesed By ${message.guild.members.cache.get(message.author.id).nickname ? message.guild.members.cache.get(message.author.id).nickname : message.author.username}`)
				.setImage(`https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? 'gif' : 'png'}`);
			message.channel.send(embed);
			return;
		} else {
			const parsed = parse(emoji, { assetType: 'png' });
			if (!parsed[0]) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`BigEmote - Requesed By ${message.guild.members.cache.get(message.author.id).nickname ? message.guild.members.cache.get(message.author.id).nickname : message.author.username}`,
						`**◎ Error:** Invalid emoji!`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setTitle(`BigEmote - Requesed By ${message.guild.members.cache.get(message.author.id).nickname ? message.guild.members.cache.get(message.author.id).nickname : message.author.username}`)
				.setImage(parsed[0].url);
			message.channel.send(embed);
			return;
		}
	}

};
