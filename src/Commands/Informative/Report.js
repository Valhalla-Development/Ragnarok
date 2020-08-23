const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Reports tagged user.',
			category: 'Informative',
			usage: '<@user>'
		});
	}

	async run(message, args) {
		const target = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
		const reports = message.guild.channels.cache.find((chan) => chan.name === 'reports');
		const reason = args.slice(1).join(' ');

		if (!target) {
			const noTarget = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(message.guild.me.displayHexColor || 'A10000')
				.addField(`**${this.client.user.username} - Report**`,
					`**◎ Error:** You must specify a user to report!`);
			message.channel.send(noTarget).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		if (!reason) {
			const noReason = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(message.guild.me.displayHexColor || 'A10000')
				.addField(`**${this.client.user.username} - Report**`,
					`**◎ Error:** You must specify a reason!`);
			message.channel.send(noReason).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		if (!reports) {
			const noReason = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(message.guild.me.displayHexColor || 'A10000')
				.addField(`**${this.client.user.username} - Report**`,
					`**◎ Error:** Reports are disabled on this server! If you are an administrator, create the channel and name it \`reports\``);
			message.channel.send(noReason).then((m) => m.delete({ timeout: 15000 }));
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
			.setColor(message.guild.me.displayHexColor || 'A10000')
			.setTimestamp();
		reports.send(reportembed);

		const success = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(message.guild.me.displayHexColor || 'A10000')
			.addField(`**${this.client.user.username} - Report**`,
				`**◎ Success:** ${target}** was reported by **${message.author}`);
		message.channel.send(success).then((m) => m.delete({ timeout: 15000 }));
	}

};
