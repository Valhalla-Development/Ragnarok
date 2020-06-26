const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const language = require('../../../Storage/messages.json');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Reports tagged user.',
			category: 'Informative',
			usage: 'Report <@tag>'
		});
	}

	async run(message, args) {
		const target = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
		const reports = message.guild.channels.cache.find((chan) => chan.name === 'reports');
		const reason = args.slice(1).join(' ');

		if (!target) {
			message.channel.send(`${language.report.notarget}`).then((mes) => mes.delete({
				timeout: 5000
			}));
			return;
		}
		if (!reason) {
			message.channel.send(`${language.report.noreason}`).then((mes) => mes.delete({
				timeout: 5000
			}));
			return;
		}
		if (!reports) {
			message.channel.send(`${language.report.nochannel}`).then((mes) => mes.delete({
				timeout: 5000
			}));
			return;
		}

		const reportembed = new MessageEmbed()
			.setThumbnail(target.user.avatarURL())
			.setAuthor('Report', 'https://cdn.discordapp.com/emojis/465245981613621259.png?v=1')
			.setDescription(`New report by ${message.author.username}`)
			.addFields({ name: '⚠ - Reported Member', value: `${target.user.tag}\n(${target.user.id})`, inline: true },
				{ name: '⚠ - Reported by', value: `${message.author.tag}\n(${message.author.id})`, inline: true },
				{ name: '⚙ - Channel', value: message.channel },
				{ name: '🔨 - Reason', value: reason })
			.setColor(message.guild.me.displayHexColor || '36393F')
			.setTimestamp();
		reports.send(reportembed);

		message.channel.send(`**${target}** was reported by **${message.author}**`).then((mes) => mes.delete({
			timeout: 5000
		}));
	}

};
