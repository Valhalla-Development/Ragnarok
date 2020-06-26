const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Evaluates given input',
			category: 'Hidden',
			usage: 'Eval <input>'
		});
	}

	async run(message, args) {
		if (!this.client.owners.includes(message.author.id)) return;
		if (args.length < 1) {
			message.channel.send('Please input some text!');
			return;
		}

		function clean(text) {
			if (typeof text === 'string') {
				return text
					.replace(/'/g, `\`${String.fromCharCode(8203)}`)
					.replace(/@/g, `@${String.fromCharCode(8203)}`);
			}
			return text;
		}

		const argresult = args.join(' ');

		try {
			let evaled = eval(argresult);

			if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
			if (evaled.includes(this.client.token)) {
				console.log(
					`\n${message.author.username}#${
						message.author.discriminator
					} Tried to get the bot token on ${message.guild.name} (ServerID: ${
						message.guild.id
					}).\n`
				);
				return;
			}

			const embed = new MessageEmbed()
				.setAuthor(`Ragnarok - Eval`, this.client.user.displayAvatarURL({ dynamic: true }))
				.addFields({ name: `${message.author.username} - JavaScript Eval Success:`, value: '** **' },
					{ name: ':inbox_tray: **INPUT**', value: `\`\`\`${args.join(' ')}\`\`\`` },
					{ name: ':outbox_tray: **OUTPUT**', value: `\`\`\`${clean(evaled)}\`\`\`` })
				.setColor(message.guild.me.displayHexColor || '36393F')
				.setTimestamp();
			message.channel.send({
				embed
			});
		} catch (err) {
			message.channel
				.send(
					new MessageEmbed()
						.setAuthor(`Ragnarok - Eval Error`, this.client.user.displayAvatarURL({ dynamic: true }))
						.addFields({ name: `${message.author.username} - JavaScript Eval Error:`, value: 'There was a problem with the code you tried to run!' },
							{ name: ':no_entry: ERROR', value: `\`\`\`${clean(err)}\`\`\`` })
						.setColor(message.guild.me.displayHexColor || '36393F')
						.setFooter(message.createdAt, message.author.avatarURL())
				)

				.catch((error) => message.channel.send(`**ERROR:** ${error.message}`));
		}
	}

};
