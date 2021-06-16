const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const { supportGuild, supportChannel } = require('../../../config.json');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['bug'],
			description: 'Reports a bug on the bot to the owner.',
			category: 'Informative',
			usage: '<text>'
		});
	}

	async run(message, args) {
		if (!args[0]) {
			this.client.utils.messageDelete(message, 10000);

			const noinEmbed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - BugReport**`,
					`**◎ Error:** Please input some text!`);
			message.channel.send({ embeds: [noinEmbed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const argresult = args.join(' ');

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(this.client.guilds.cache.get(supportGuild).me.displayHexColor))
			.setTitle('Bug Report')
			.setDescription(`**◎ User: <@${message.author.id}> - **\`${message.author.tag}\`\n**Bug:** ${argresult}`)
			.setFooter(`${message.guild.name} - ${message.guild.id}`);
		this.client.guilds.cache.get(supportGuild).channels.cache.get(supportChannel).send({ embeds: [embed] });

		this.client.utils.messageDelete(message, 10000);

		const loggedEmbed = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - BugReport**`,
				`**◎ Success:** Bug has been successfully reported!`);
		message.channel.send({ embeds: [loggedEmbed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
	}

};
