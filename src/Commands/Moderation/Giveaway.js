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
			description: 'Starts a giveaway.',
			category: 'Moderation',
			usage: '<start/stop/reroll> <time> <winners amount> <prize>',
			botPerms: ['ADD_REACTIONS']
		});
	}

	async run(message, args) {
		if (!message.member.hasPermission('MANAGE_MESSAGES') && !message.member.roles.cache.some((r) => r.name === 'Giveaways')) {
			this.client.utils.messageDelete(message, 10000);

			const invalidPerm = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Giveaway**`,
					`**◎ Error:** You need to have the manage messages permissions or the giveaway role for this command.`);
			message.channel.send(invalidPerm).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const usageE = new MessageEmbed()
			.setThumbnail(this.client.user.displayAvatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Giveaway**`, [
				`**◎ Start:** \`${prefix}giveaway start <time> <winners amount> <prize>\``,
				`**◎ Reroll:** \`${prefix}giveaway reroll <message id>\``,
				`**◎ Stop:** \`${prefix}giveaway stop <message id>\``
			])
			.setTimestamp();

		if (!args[0]) {
			this.client.utils.messageDelete(message, 10000);

			message.channel.send(usageE).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		if (args[0] !== 'start' && args[0] !== 'reroll' && args[0] !== 'stop') {
			this.client.utils.messageDelete(message, 10000);

			message.channel.send(usageE).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[0] === 'start') {
			if (!args[1] || !args[2] || !args[3]) {
				this.client.utils.messageDelete(message, 10000);

				const incorrectStart = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Giveaway**`,
						`**◎ Error:** \`${prefix}giveaway start <time> <winners amount> <prize>\``);
				message.channel.send(incorrectStart).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			if (!args[1].match('[dhm]')) {
				this.client.utils.messageDelete(message, 10000);

				const incorrectFormat = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Giveaway**`,
						`**◎ Error:** You did not use the correct formatting for the time! The valid options are \`d\`, \`h\`, or \`m\``);
				message.channel.send(incorrectFormat).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			if (ms(args[1]) > '7889400000') {
				this.client.utils.messageDelete(message, 10000);

				const valueHigh = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Giveaway**`,
						`**◎ Error:** Please input a value lower than 3 months!`);
				message.channel.send(valueHigh).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			if (ms(args[1]) < '60000') {
				this.client.utils.messageDelete(message, 10000);

				const valueLow = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Giveaway**`,
						`**◎ Error:** Please input a value higher than 1 minute!`);
				message.channel.send(valueLow).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			if (isNaN(ms(args[1]))) {
				this.client.utils.messageDelete(message, 10000);

				const invalidDur = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Giveaway**`,
						`**◎ Error:** Please input a valid duration!`);
				message.channel.send(invalidDur).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			if (isNaN(args[2]) || (parseInt(args[2]) <= 0)) {
				this.client.utils.messageDelete(message, 10000);

				const invalidNum = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Giveaway**`,
						`**◎ Error:** Please input a valid number!`);
				message.channel.send(invalidNum).then((m) => this.client.utils.deletableCheck(m, 10000));
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
			this.client.utils.messageDelete(message, 10000);

			if (!args[1]) {
				const incorrectReroll = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Giveaway**`,
						`**◎ Error:** \`${prefix}giveaway reroll <message id>\``);
				message.channel.send(incorrectReroll).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			const giveaway = this.client.giveawaysManager.giveaways.find((g) => g.messageID === args[1]);
			if (!giveaway) {
				this.client.utils.messageDelete(message, 10000);

				const noGiveaway = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Giveaway**`,
						`**◎ Error:** Unable to find a giveaway with ID: \`${args.slice(1).join(' ')}\`.`);
				message.channel.send(noGiveaway).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			this.client.giveawaysManager.reroll(giveaway.messageID)
				.then(() => {
					const rerolled = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Giveaway**`,
							`**◎ Success:** Giveaway rerolled!`);
					message.channel.send(rerolled);
				})
				.catch((e) => {
					this.client.utils.messageDelete(message, 10000);

					if (e.startsWith(`Giveaway with message ID ${giveaway.messageID} is not ended.`)) {
						const notEnded = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Giveaway**`,
								`**◎ Error:** This giveaway has not ended!`);
						message.channel.send(notEnded).then((m) => this.client.utils.deletableCheck(m, 10000));
					} else {
						this.client.utils.messageDelete(message, 10000);

						console.error(e);
						const error = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Giveaway**`,
								`**◎ Error:** An error occured!`);
						message.channel.send(error).then((m) => this.client.utils.deletableCheck(m, 10000));
					}
				});
		}


		if (args[0] === 'stop') {
			if (!args[1]) {
				this.client.utils.messageDelete(message, 10000);

				const incorrectStop = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Giveaway**`,
						`**◎ Error:** \`${prefix}giveaway stop <message id>\``);
				message.channel.send(incorrectStop).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			const giveaway = this.client.giveawaysManager.giveaways.find((g) => g.messageID === args[1]);
			if (!giveaway) {
				this.client.utils.messageDelete(message, 10000);

				const noGiveaway = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Giveaway**`,
						`**◎ Error:** Unable to find a giveaway with ID: \`${args.slice(1).join(' ')}\`.`);
				message.channel.send(noGiveaway).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			this.client.giveawaysManager.edit(giveaway.messageID, {
				setEndTimestamp: Date.now()
			}).then(() => {
				this.client.utils.messageDelete(message, 10000);

				const stopped = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Giveaway**`,
						`**◎ Success:** Giveaway will end in less than ${this.client.giveawaysManager.options.updateCountdownEvery / 1000} seconds.`);
				message.channel.send(stopped).then((m) => this.client.utils.deletableCheck(m, 10000));
			}).catch((e) => {
				this.client.utils.messageDelete(message, 10000);

				if (e.startsWith(`Giveaway with message ID ${giveaway.messageID} is already ended.`)) {
					const alreadyEnded = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Giveaway**`,
							`**◎ Error:** This giveaway has already ended!`);
					message.channel.send(alreadyEnded).then((m) => this.client.utils.deletableCheck(m, 10000));
				} else {
					this.client.utils.messageDelete(message, 10000);

					console.error(e);
					const error = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Giveaway**`,
							`**◎ Error:** An error occured!`);
					message.channel.send(error).then((m) => this.client.utils.deletableCheck(m, 10000));
				}
			});
		}
	}

};
