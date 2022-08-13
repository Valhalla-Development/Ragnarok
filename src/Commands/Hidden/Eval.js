/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command');
const { EmbedBuilder, MessageAttachment, PermissionsBitField } = require('discord.js');
const { inspect } = require('util');
const { Type } = require('@extreme_hero/deeptype');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const Hastebin = require('hastebin.js');
const haste = new Hastebin({ url: 'https://pastie.io' });
const moment = require('moment');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Evaluates given input.',
			category: 'Hidden',
			usage: '<input>',
			ownerOnly: true
		});
	}

	async run(message, args) {
		if (!args.length) {
			this.client.utils.messageDelete(message, 10000);

			const incorrectFormat = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Eval**`,
					value: `**◎ Error:** Please input some text!` });
			message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let code = args.join(' ');
		code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
		let evaled;
		try {
			const start = process.hrtime();
			evaled = eval(code);
			if (evaled instanceof Promise) {
				evaled = await evaled;
			}
			const stop = process.hrtime(start);
			const success = new EmbedBuilder()
				.addFields({ name: `${this.client.user.username} - Eval`,
					value: `**◎ Output:** \`\`\`js\n${this.clean(inspect(evaled, { depth: 0 }))}\n\`\`\`
					**◎ Type:** \`\`\`ts\n${new Type(evaled).is}\n\`\`\`` })
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.setFooter({ text: `Time Taken: ${(((stop[0] * 1e9) + stop[1])) / 1e6}s` });

			if (success.fields[0].value.length > 1024) {
				await haste.post(this.clean(inspect(evaled, { depth: 1 })), 'js')
					.then((link) => {
						const hastEmb = new EmbedBuilder()
							.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
							.addFields({ name: `**${this.client.user.username} - Eval**`,
								value: `**◎ Link:** ${link}` })
							.setURL(link)
							.setFooter({ text: 'Embed field limit reached, posting to pastie.io' });
						message.channel.send({ embeds: [hastEmb] });
					}).catch(() => {
						return;
					});
				return;
			}
			await message.channel.send({ embeds: [success] });
		} catch (err) {
			const error = new EmbedBuilder()
				.addFields({ name: `${this.client.user.username} - Eval`,
					value: `**◎ Error:** \`\`\`x1\n${this.clean(err)}\n\`\`\`` })
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor));
			message.channel.send({ embeds: [error] });
			return;
		}
	}

	clean(text) {
		if (typeof text === 'string') {
			text = text
				.replace(/`/g, `\`${String.fromCharCode(8203)}`)
				.replace(/@/g, `@${String.fromCharCode(8203)}`)
				.replace(new RegExp(this.client.token, 'gi'), 'u steal token! succ u!');
		}
		return text;
	}

};
