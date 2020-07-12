/* eslint-disable complexity */
const Command = require('../../Structures/Command');
const ms = require('ms');
const SQLite = require('better-sqlite3');
const { MessageEmbed } = require('discord.js');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['g'],
			description: 'Starts a giveaway',
			category: 'Hidden',
			usage: '<start/stop/reroll> <time> <winners amount> <prize>'
		});
	}

	async run(message, args) {
		if (!message.member.hasPermission('MANAGE_MESSAGES') && !message.member.roles.cache.some((r) => r.name === 'Giveaways')) {
			const invalidPerm = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Invalid Permissions**',
					`**◎ Error:** You need to have the manage messages permissions to reroll giveaways.`);
			message.channel.send(invalidPerm).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const usageE = new MessageEmbed()
			.setThumbnail(this.client.user.displayAvatarURL())
			.setColor(message.guild.me.displayHexColor || '36393F')
			.addField('**Available Commands:**', [
				`**◎ Start:** \`${prefix}giveaway start <time> <winners amount> <prize>\``,
				`**◎ Reroll:** \`${prefix}giveaway reroll <message id>\``,
				`**◎ Stop:** \`${prefix}giveaway stop <message id>\``
			])
			.setTimestamp();

		if (!args[0]) {
			message.channel.send(usageE).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		if (args[0] !== 'start' && args[0] !== 'reroll' && args[0] !== 'stop') {
			message.channel.send(usageE).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (args[0] === 'start') {
			if (!args[1] || !args[2] || !args[3]) {
				const incorrectStart = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Incorrect Usage**',
						`**◎ Error:** \`${prefix}giveaway start <time> <winners amount> <prize>\``);
				message.channel.send(incorrectStart).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
			if (!args[1].match('[dhm]')) {
				const incorrectFormat = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Incorrect Format**',
						`**◎ Error:** You did not use the correct formatting for the time! The valid options are \`d\`, \`h\`, or \`m\``);
				message.channel.send(incorrectFormat).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
			if (ms(args[1]) > '7889400000') {
				const valueHigh = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Value Too High**',
						`**◎ Error:** Please input a value lower than 3 months!`);
				message.channel.send(valueHigh).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
			if (ms(args[1]) < '60000') {
				const valueLow = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Value Too Low**',
						`**◎ Time Limit:** Please input a value higher than 1 minute!`);
				message.channel.send(valueLow).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
			if (isNaN(ms(args[1]))) {
				const invalidDur = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Invalid Duration**',
						`**◎ Error:** Please input a valid duration!`);
				message.channel.send(invalidDur).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
			if (isNaN(args[2]) || (parseInt(args[2]) <= 0)) {
				const invalidNum = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Invalid Number**',
						`**◎ Error:** Please input a valid number!`);
				message.channel.send(invalidNum).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			this.client.giveawaysManager.start(message.channel, {
				time: ms(args[1]),
				prize: args.slice(3).join(' '),
				winnerCount: parseInt(args[2]),
				hostedBy: `**${message.guild.name}**`,
				messages: {
					giveaway: '<:yay:725153188667195432>  **GIVEAWAY**  <:yay:725153188667195432>',
					giveawayEnded: '<:yay:725153188667195432>  **GIVEAWAY ENDED**  <:yay:725153188667195432>',
					timeRemaining: 'Time remaining: **{duration}**!',
					inviteToParticipate: 'React with 🎉 to participate!',
					winMessage: 'Congratulations, {winners}! You won **{prize}**!',
					embedFooter: 'Giveaways',
					noWinner: 'Giveaway cancelled, no valid participations.',
					hostedBy: `Hosted by: {user}`,
					winners: 'winner(s)',
					endedAt: 'Ended at',
					units: {
						seconds: 'seconds',
						minutes: 'minutes',
						hours: 'hours',
						days: 'days',
						pluralS: false
					}

				}
			});
		}

		if (args[0] === 'reroll') {
			if (!args[1]) {
				const incorrectReroll = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Incorrect Usage**',
						`**◎ Error:** \`${prefix}giveaway reroll <message id>\``);
				message.channel.send(incorrectReroll).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
			const giveaway = this.client.giveawaysManager.giveaways.find((g) => g.messageID === args[1]);
			if (!giveaway) {
				const noGiveaway = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Invalid ID**',
						`**◎ Invalid ID:** Unable to find a giveaway with ID: \`${args.slice(1).join(' ')}\`.`);
				message.channel.send(noGiveaway).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
			this.client.giveawaysManager.reroll(giveaway.messageID)
				.then(() => {
					const rerolled = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success!**',
							`**◎ Success:** Giveaway rerolled!`);
					message.channel.send(rerolled);
				})
				.catch((e) => {
					if (e.startsWith(`Giveaway with message ID ${giveaway.messageID} is not ended.`)) {
						const notEnded = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Error!**',
								`**◎ Error:** This giveaway has not ended!`);
						message.channel.send(notEnded).then((m) => m.delete({ timeout: 15000 }));
					} else {
						console.error(e);
						const error = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Error!**',
								`**◎ Error:** An error occured!`);
						message.channel.send(error).then((m) => m.delete({ timeout: 15000 }));
					}
				});
		}


		if (args[0] === 'stop') {
			if (!args[1]) {
				const incorrectStop = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Incorrect Usage**',
						`**◎ Correct usage:** \`${prefix}giveaway stop <message id>\``);
				message.channel.send(incorrectStop).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
			const giveaway = this.client.giveawaysManager.giveaways.find((g) => g.messageID === args[1]);
			if (!giveaway) {
				const noGiveaway = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Invalid ID**',
						`**◎ Invalid ID:** Unable to find a giveaway with ID: \`${args.slice(1).join(' ')}\`.`);
				message.channel.send(noGiveaway).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
			this.client.giveawaysManager.edit(giveaway.messageID, {
				setEndTimestamp: Date.now()
			}).then(() => {
				const stopped = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Success!**',
						`**◎ Success:** Giveaway will end in less than ${this.client.giveawaysManager.options.updateCountdownEvery / 1000} seconds.`);
				message.channel.send(stopped).then((m) => m.delete({ timeout: 15000 }));
			}).catch((e) => {
				if (e.startsWith(`Giveaway with message ID ${giveaway.messageID} is already ended.`)) {
					const alreadyEnded = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Error!**',
							`**◎ Error:** This giveaway has already ended!`);
					message.channel.send(alreadyEnded).then((m) => m.delete({ timeout: 15000 }));
				} else {
					console.error(e);
					const error = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Error!**',
							`**◎ Error:** An error occured!`);
					message.channel.send(error).then((m) => m.delete({ timeout: 15000 }));
				}
			});
		}
	}

};
