const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Fake ban a user',
			category: 'Hidden',
			usage: '<input>',
			userPerms: ['MANAGE_MESSAGES']

		});
	}

	async run(message, args) {
		this.client.utils.messageDelete(message, 0);

		const user = message.mentions.users.size ? message.guild.members.cache.get(message.mentions.users.first().id) : message.guild.members.cache.get(args[0]);

		if (!user) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Ban**`,
					`**◎ Error:** Please specify a user you wish to ban!.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let reason = args.slice(1).join(' ');
		if (!reason) reason = 'No reason given.';

		const embed = new MessageEmbed()
			.setThumbnail(this.client.user.displayAvatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField('User Banned',
				`**◎ User:** ${user.user.tag}
				**◎ Reason:** ${reason}
				**◎ Moderator:** ${message.author.tag}`)
			.setFooter({ text: 'User Ban Logs' })
			.setTimestamp();
		message.channel.send({ embeds: [embed] });
	}

};
