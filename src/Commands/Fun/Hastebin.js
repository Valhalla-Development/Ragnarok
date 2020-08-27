const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const Hastebin = require('hastebin.js');
const haste = new Hastebin({ url: 'https://pastie.io' });
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['haste', 'paste'],
			description: 'Posts text/file to paste.io.',
			category: 'Fun',
			usage: '<text/attachment>'
		});
	}

	async run(message, args) {
		if (message.member.guild.me.hasPermission('MANAGE_MESSAGES')) {
			message.delete();
		}

		if (message.attachments.size === 1) {
			const file = message.attachments.first().url;
			const fileExtension = file.substring(file.lastIndexOf('.') + 1);
			let extension;
			if (fileExtension === 'txt') {
				extension = 'js';
			} else {
				extension = fileExtension;
			}
			const validExtensions = ['bat', 'c', 'cpp', 'css', 'html', 'ini', 'java', 'js', 'jsx', 'json', 'lua', 'md', 'php', 'py', 'pyc', 'scss', 'sql', 'txt', 'xml', 'yaml'];
			if (!validExtensions.includes(fileExtension)) {
				const invalidExt = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Hastebin**`,
						`**◎ Error:** \`.${fileExtension}\` is not a valid file type!\n\n**Acceptable files:**\n\`${validExtensions.join(', ')}\``);
				message.channel.send(invalidExt).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
			await fetch(file)
				.then((res) => res.text())
				.then((body) => {
					if (!body) {
						const emptyFile = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Hastebin**`,
								`**◎ Error:** You can not upload an empty file!`);
						message.channel.send(emptyFile).then((m) => m.delete({ timeout: 15000 }));
						return;
					}
					haste.post(body, extension)
						.then((res) => {
							const hastEmb = new MessageEmbed()
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.addField(`**${this.client.user.username} - HasteBin**`,
									`**◎ Link:** ${res}\nPosted By: ${message.author}`)
								.setURL(res);
							message.channel.send(hastEmb);
						}).catch(() => {
							const error = new MessageEmbed()
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.addField(`**${this.client.user.username} - HasteBin**`,
									`**◎ Error:** An error occured!`);
							message.channel.send(error).then((m) => m.delete({ timeout: 15000 }));
						});
				}).catch(() => {
					const error = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - HasteBin**`,
							`**◎ Error:** An error occured!`);
					message.channel.send(error).then((m) => m.delete({ timeout: 15000 }));
				});
			return;
		} if (message.attachments.size > 1) {
			const fileCount = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Hastebin**`,
					`**◎ Error:** You can only post 1 file at a time!`);
			message.channel.send(fileCount).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		if (args[0] === undefined) {
			const error = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Hastebin**`,
					`**◎ Error:** You must input some text!`);
			message.channel.send(error).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		await haste.post(args.join(' '), 'js')
			.then((link) => {
				const hastEmb = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - HasteBin**`,
						`**◎ Link:** ${link}\nPosted By: ${message.author}`)
					.setURL(link);
				message.channel.send(hastEmb);
			}).catch(() => {
				const error = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - HasteBin**`,
						`**◎ Error:** An error occured!`);
				message.channel.send(error).then((m) => m.delete({ timeout: 15000 }));
			});
	}

};
