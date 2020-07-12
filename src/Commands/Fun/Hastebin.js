const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const Hastebin = require('hastebin.js');
const haste = new Hastebin({ url: 'https://pastie.io' });
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['haste'],
			description: 'Posts text/file to paste.io',
			category: 'Fun',
			usage: 'Hastebin <text/file>'
		});
	}

	async run(message, args) {
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
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Invalid File**',
						`**◎ Error:** \`.${fileExtension}\` is not a valid file type!\n\n**Acceptable files:**\n\`${validExtensions.join(', ')}\``);
				message.channel.send(invalidExt).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
			await fetch(file)
				.then((res) => res.text())
				.then((body) => {
					if (!body) {
						const emptyFile = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Invalid File**',
								`**◎ Error:** You can not upload an empty file!`);
						message.channel.send(emptyFile).then((m) => m.delete({ timeout: 15000 }));
						return;
					}
					haste.post(body, extension)
						.then((res) => {
							const hastEmb = new MessageEmbed()
								.setColor(message.guild.me.displayHexColor || '36393F')
								.setAuthor('Hastebin Link:')
								.setDescription(`${res}\nPosted By: ${message.author}`)
								.setURL(res);
							message.channel.send(hastEmb);
						}).catch(() => {
							const error = new MessageEmbed()
								.setColor(message.guild.me.displayHexColor || '36393F')
								.addField('**Error**',
									`**◎ Error:** An error occured!`);
							message.channel.send(error).then((m) => m.delete({ timeout: 15000 }));
						});
				}).catch(() => {
					const error = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Error**',
							`**◎ Error:** An error occured!`);
					message.channel.send(error).then((m) => m.delete({ timeout: 15000 }));
				});
			return;
		} if (message.attachments.size > 1) {
			const fileCount = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Error**',
					`**◎ Error:** You can only post 1 file at a time!`);
			message.channel.send(fileCount).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		if (args[0] === undefined) {
			const error = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Error**',
					`**◎ Error:** You must input some text!`);
			message.channel.send(error).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		await haste.post(args.join(' '), 'js')
			.then((link) => {
				const hastEmb = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.setAuthor('Hastebin Link:')
					.setDescription(`${link}\nPosted By: ${message.author}`)
					.setURL(link);
				message.channel.send(hastEmb);
			}).catch(() => {
				const error = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Error**',
						`**◎ Error:** An error occured!`);
				message.channel.send(error).then((m) => m.delete({ timeout: 15000 }));
			});
	}

};
