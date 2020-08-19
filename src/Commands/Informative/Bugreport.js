const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const { supportGuild, supportChannel } = require('../../../config.json');

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
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField(`**${this.client.user.username} - BugReport**`,
					`**◎ Error:** Please input some text!`);
			message.channel.send(noinEmbed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const argresult = args.join(' ');

		const embed = new MessageEmbed()
			.setColor(message.guild.me.displayHexColor || '36393F')
			.setTitle('Bug Report')
			.setDescription(`**◎ User: <@${message.author.id}> - **\`${message.author.tag}\`\n**Bug:** ${argresult}`)
			.setFooter(`${message.guild.name} - ${message.guild.id}`);
		this.client.guilds.cache.get(supportGuild).channels.cache.get(supportChannel).send(embed);

		const loggedEmbed = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(message.guild.me.displayHexColor || '36393F')
			.addField(`**${this.client.user.username} - BugReport**`,
				`**◎ Success:** Bug has been successfully reported!`);
		message.channel.send(loggedEmbed).then((m) => m.delete({ timeout: 15000 }));
	}

};
