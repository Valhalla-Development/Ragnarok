const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const { supportGuild, suggestChan } = require('../../../config.json');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['suggest'],
			description: 'Sends suggestions to support server.',
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
				.addField(`**${this.client.user.username} - Suggest**`,
					`**◎ Error:** Please input some text!`);
			message.channel.send({ embeds: [noinEmbed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const argresult = args.join(' ');

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(this.client.guilds.cache.get(supportGuild).me.displayHexColor))
			.setTitle('Suggestion')
			.setDescription(`**◎ User: <@${message.author.id}> - **\`${message.author.tag}\`\n**Suggestion:** ${argresult}`)
			.setFooter(`${message.guild.name} - ${message.guild.id}`);
		this.client.guilds.cache.get(supportGuild).channels.cache.get(suggestChan).send({ embeds: [embed] });

		this.client.utils.messageDelete(message, 10000);

		const loggedEmbed = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Suggest**`,
				`**◎ Success:** Suggestion has been successfully sent!`);
		message.channel.send({ embeds: [loggedEmbed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
	}

};
