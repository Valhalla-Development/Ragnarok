/* eslint-disable no-mixed-operators */
/* eslint-disable no-inline-comments */
const Command = require('../../Structures/Command');
const { EmbedBuilder } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['steal'],
			description: 'Steals money from specified user',
			category: 'Economy',
			usage: '<@user>'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const user = message.mentions.members.first() || message.guild.members.cache.find(usr => usr.displayName === args.join(' '));

		if (!user) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new EmbedBuilder()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Steal**`,
					`**◎ Error:** An example of this command is: \`${prefix}steal @user\``);
			message.channel.send({ embeds: [wrongUsage] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (user.id === message.author.id) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Steal**`,
					`**◎ Error:** You can not rob yourself. <:wut:745408596233289839>`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (user.bot) return;

		const balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);
		const otherB = this.client.getBalance.get(`${user.id}-${message.guild.id}`);

		if (!otherB) {
			this.client.utils.messageDelete(message, 10000);

			const errorE = new EmbedBuilder()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Error:** ${user} does not have an economy account. They will instantly open one when they speak.`);
			message.channel.send({ embeds: [errorE] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (Date.now() > balance.stealcool) {
			balance.stealcool = null;

			if (otherB.cash < 10) {
				this.client.utils.messageDelete(message, 10000);

				const wrongUsage = new EmbedBuilder()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Steal**`,
						`**◎ Error:** The targeted user does not have enough cash to steal!`);
				message.channel.send({ embeds: [wrongUsage] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			let maxPerc;
			let minPerc;
			let totalCalc;
			let calc;
			let totalCalc2;
			let calc2;
			let stealAmount;

			const stealChance = Math.random(); // give you a random number between 0 and 1
			if (stealChance < 0.75) { // there’s a 75% chance of this happening
				maxPerc = otherB.cash / 100 * 85;
				minPerc = otherB.cash / 100 * 35;

				stealAmount = Math.floor(Math.random() * (maxPerc - minPerc + 1) + minPerc); // * (max - min + 1) + min);

				totalCalc = otherB.total - stealAmount;
				calc = otherB.cash - stealAmount;
				totalCalc2 = balance.total + stealAmount;
				calc2 = balance.cash + stealAmount;

				otherB.cash = calc;
				otherB.total = totalCalc;
				this.client.setUserBalance.run(otherB);

				const endTime = new Date().getTime() + 120000;

				balance.stealcool = endTime;
				balance.cash = calc2;
				balance.total = totalCalc2;
				this.client.setBalance.run(balance);

				const succMessage = [
					`You held ${user} at gun-point and stole <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`You stabbed ${user} and took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\` from their wallet.`,
					`You hired someone to mug ${user}, you received <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`${user} said they watch anime, you kicked them in the face and took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`You snuck up on ${user} and pick-pocketed <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`*slaps ${user} with a large trout*, they dropped <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`You tricked ${user} into giving you <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`You petrified ${user}, they ran away and dropped <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`You went to ${user}'s house and stole his college fund worth <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`You noticed ${user} was drunk so you stole <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\` from them.`,
					`${user} tried to mug you, but you had an uno reverse card. You stole <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\` from them.`
				];

				const depArg = new EmbedBuilder()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Steal**`,
						`**◎ Success:** ${succMessage[Math.floor(Math.random() * succMessage.length)]}`);
				message.channel.send({ embeds: [depArg] });
				return;
			} else {
				maxPerc = balance.bank / 100 * 0.1;
				minPerc = balance.bank / 100 * 0.05;

				stealAmount = Math.floor(Math.random() * (maxPerc - minPerc + 1) + minPerc); // * (max - min + 1) + min);

				totalCalc = otherB.total + stealAmount;
				calc = otherB.bank + stealAmount;
				totalCalc2 = balance.total - stealAmount;
				calc2 = balance.bank - stealAmount;


				otherB.bank = calc;
				otherB.total = totalCalc;
				this.client.setUserBalance.run(otherB);

				const endTime = new Date().getTime() + 240000;

				balance.stealcool = endTime;
				balance.bank = calc2;
				balance.total = totalCalc2;
				this.client.setBalance.run(balance);

				const failMessage = [
					`You tried to mug ${user} but they over-powered you${stealAmount > 1 ? ` and took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.` : `.`}`,
					`You held ${user} at knife point but they knew Karate${stealAmount > 1 ? ` and stole your lunch money <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.` : `.`}`,
					`You challenged ${user} to a 1v1 and lost${stealAmount > 1 ? ` <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.` : `.`}`,
					`You hired someone to mug ${user}${stealAmount > 1 ? ` but they mugged you instead and took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.` : ` ${user} fought him off.`}`,
					`You tried to stab ${user}, but they said 'no u'${stealAmount > 1 ? ` and you stabbed yourself. You lost <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.` : ` and walked away.`}`,
					`You tried to steal from ${user} but they caught you${stealAmount > 1 ? ` and they took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\` from you.` : `, they simply said 'pathetic' and walked away.`}`,
					`You asked ${user} for financial advice and lost <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`${user} had a gun and you did not... They stole <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\` from you.`,
					`You tried to mug ${user} but they were too drunk to fight back. They stole <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`You tried to mug ${user} but they shot you. You lost <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`${user} was drunk and you tried to mug them. You stabbed yourself and lost <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`You tried to mug ${user} but they were too drunk to fight back. You tried to stab them, but they said 'no u' and you stabbed yourself. You lost <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`${user} was a ninja and you tried to steal from them. They threw you out the window and stole <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`
				];

				const depArg = new EmbedBuilder()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Steal**`,
						`**◎ Fail:** ${failMessage[Math.floor(Math.random() * failMessage.length)]}`);
				message.channel.send({ embeds: [depArg] });
				return;
			}
		} else {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Steal**`,
					`**◎ Error:** Please wait \`${ms(balance.stealcool - new Date().getTime(), { long: true })}\`, before using this command again!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
	}

};
