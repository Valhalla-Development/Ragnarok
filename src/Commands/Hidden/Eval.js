/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const { inspect } = require('util');
const { Type } = require('@extreme_hero/deeptype');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const Hastebin = require('hastebin.js');
const haste = new Hastebin({ url: 'https://pastie.io' });

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

			const incorrectFormat = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Eval**`,
					`**◎ Error:** Please input some text!`);
			message.channel.send({ embed: incorrectFormat }).then((m) => this.client.utils.deletableCheck(m, 10000));
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
			const success = new MessageEmbed()
				.addField(`${this.client.user.username} - Eval`,
					`**◎ Output:** \`\`\`js\n${this.clean(inspect(evaled, { depth: 0 }))}\n\`\`\`
					**◎ Type:** \`\`\`ts\n${new Type(evaled).is}\n\`\`\``)
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setFooter(`Time Taken: ${(((stop[0] * 1e9) + stop[1])) / 1e6}s`);

			if (success.fields[0].value.length > 1024) {
				await haste.post(this.clean(inspect(evaled, { depth: 1 })), 'js')
					.then((link) => {
						const hastEmb = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Eval**`,
								`**◎ Link:** ${link}`)
							.setURL(link)
							.setFooter('Embed field limit reached, posting to pastie.io');
						message.channel.send({ embed: hastEmb });
					}).catch(() => {
						return;
					});
				return;
			}
			await message.channel.send({ embed: success });
		} catch (err) {
			const error = new MessageEmbed()
				.addField(`${this.client.user.username} - Eval`,
					`**◎ Error:** \`\`\`x1\n${this.clean(err)}\n\`\`\``)
				.setColor(this.client.utils.color(message.guild.me.displayHexColor));
			message.channel.send({ embed: error });
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
