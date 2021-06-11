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
		const target = message.mentions.users.size ? message.guild.members.cache.get(message.mentions.users.first().id) : message.guild.members.cache.get(args[0]);
		const reports = message.guild.channels.cache.find((chan) => chan.name === 'reports');
		const reason = args.slice(1).join(' ');

		if (!target) {
			this.client.utils.messageDelete(message, 10000);

			const noTarget = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Report**`,
					`**◎ Error:** You must specify a user to report!`);
			message.channel.send({ embed: noTarget }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		if (!reason) {
			this.client.utils.messageDelete(message, 10000);

			const noReason = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Report**`,
					`**◎ Error:** You must specify a reason!`);
			message.channel.send({ embed: noTarget }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		if (!reports) {
			this.client.utils.messageDelete(message, 10000);

			const noReason = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Report**`,
					`**◎ Error:** Reports are disabled on this server! If you are an administrator, create the channel and name it \`reports\``);
			message.channel.send({ embed: noReason }).then((m) => this.client.utils.deletableCheck(m, 10000));
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
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setTimestamp();
		reports.send({ embed: reportembed });

		const success = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Report**`,
				`**◎ Success:** ${target}** was reported by **${message.author}`);
		message.channel.send({ embed: success }).then((m) => this.client.utils.deletableCheck(m, 10000));
	}

};
