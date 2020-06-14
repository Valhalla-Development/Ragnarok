const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const { supportGuild, supportChannel } = require('../../../config.json');
const language = require('../../../Storage/messages.json');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['bug'],
			description: 'Reports a bug on the bot to the owner.',
			category: 'Informative',
			usage: 'Bugreport <bug>'
		});
	}

	async run(message, args) {
		if (!args[0]) {
			const noinEmbed = new MessageEmbed()
				.setColor('36393F')
				.setDescription(`${language.bugreport.noInput}`);
			message.channel.send(noinEmbed);
			return;
		}

		const argresult = args.join(' ');

		const embed = new MessageEmbed()
			.setColor('36393F')
			.setTitle('Bug Report')
			.setDescription(`**User: <@${message.author.id}> - **\`${message.author.tag}\`\n**Bug:** ${argresult}`)
			.setFooter(`${message.guild.name} - ${message.guild.id}`);
		this.client.guilds
			.cache.get(supportGuild)
			.channels.cache.get(supportChannel)
			.send(embed);

		const loggedEmbed = new MessageEmbed()
			.setColor('36393F')
			.setDescription(`${language.bugreport.bugLogged}`);
		message.channel.send(loggedEmbed);
	}

};
