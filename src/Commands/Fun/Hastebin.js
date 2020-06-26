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
				const badType = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.setDescription(`\`.${fileExtension}\` is not a valid file type!\n\nAcceptable files:\n\`${validExtensions.join(', ')}\``);
				message.channel.send(badType);
				return;
			}
			await fetch(file)
				.then((res) => res.text())
				.then((body) => {
					if (!body) {
						const emptyFile = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.setDescription(':x: You can not upload an empty file!');
						message.channel.send(emptyFile);
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
						}).catch(() => message.channel.send(':slight_frown: An error occured!'));
				}).catch(() => message.channel.send(':slight_frown: An error occured!'));
			return;
		} if (message.attachments.size > 1) {
			message.channel.send('You can only post 1 file at a time!');
			return;
		}
		if (args[0] === undefined) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.setDescription(':x: | You must input some text');
			message.channel.send(embed);
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
			}).catch(() => message.channel.send(':slight_frown: An error occured!'));
	}

};
