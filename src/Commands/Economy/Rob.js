/* eslint-disable no-mixed-operators */
/* eslint-disable no-inline-comments */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
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

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Steal**`,
					`**◎ Error:** An example of this command is: \`${prefix}steal @user\``);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (user.id === message.author.id) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Steal**`,
					`**◎ Error:** You can not rob yourself. <:wut:745408596233289839>`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (user.bot) return;

		const balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);
		const otherB = this.client.getBalance.get(`${user.id}-${message.guild.id}`);

		if (!otherB) {
			this.client.utils.messageDelete(message, 10000);

			const errorE = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Error:** ${user} does not have an economy account. They will instantly open one when they speak.`);
			message.channel.send(errorE).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (Date.now() > balance.stealcool) {
			await db.prepare('UPDATE balance SET stealcool = (@stealcool) WHERE id = (@id);').run({
				stealcool: null,
				id: `${message.author.id}-${message.guild.id}`
			});

			if (otherB.cash < 10) {
				this.client.utils.messageDelete(message, 10000);

				const wrongUsage = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Steal**`,
						`**◎ Error:** The targeted user does not have enough cash to steal!`);
				message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
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

				const setUse = {
					id: `${user.id}-${message.guild.id}`,
					user: user.id,
					guild: message.guild.id,
					hourly: otherB.hourly,
					daily: otherB.daily,
					weekly: otherB.weekly,
					monthly: otherB.monthly,
					yearly: otherB.yearly,
					stealcool: otherB.stealcool,
					boosts: otherB.boosts,
					cash: calc,
					bank: otherB.bank,
					total: totalCalc,
					fishcool: otherB.fishcool,
					farmcool: otherB.farmcool,
					items: otherB.items,
					claimNewUser: otherB.claimNewUser
				};

				this.client.setUserBalance.run(setUse);

				const endTime = new Date().getTime() + 120000;

				const addAut = {
					id: `${message.author.id}-${message.guild.id}`,
					user: message.author.id,
					guild: message.guild.id,
					hourly: balance.hourly,
					daily: balance.daily,
					weekly: balance.weekly,
					monthly: balance.monthly,
					yearly: balance.yearly,
					stealcool: endTime,
					boosts: balance.boosts,
					cash: calc2,
					bank: balance.bank,
					total: totalCalc2,
					fishcool: balance.fishcool,
					farmcool: balance.farmcool,
					items: balance.items,
					claimNewUser: balance.claimNewUser
				};

				this.client.setBalance.run(addAut);

				const succMessage = [
					`You held ${user} at gun-point and stole <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`You stabbed ${user} and took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\` from their wallet.`,
					`You hired someone to mug ${user}, you received <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`${user} said they watch anime, you kicked them in the face and took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`You snuck up on ${user} and pick-pocketed <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
					`*slaps ${user} with a large trout*, they dropped <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`
				];

				const depArg = new MessageEmbed()
					.setAuthor(`${message.author.username}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Steal**`,
						`**◎ Success:** ${succMessage[Math.floor(Math.random() * succMessage.length)]}`);
				message.channel.send(depArg);
				return;
			} else {
				maxPerc = balance.bank / 100 * 0.1;
				minPerc = balance.bank / 100 * 0.05;

				stealAmount = Math.floor(Math.random() * (maxPerc - minPerc + 1) + minPerc); // * (max - min + 1) + min);

				totalCalc = otherB.total + stealAmount;
				calc = otherB.bank + stealAmount;
				totalCalc2 = balance.total - stealAmount;
				calc2 = balance.bank - stealAmount;

				const setUse = {
					id: `${user.id}-${message.guild.id}`,
					user: user.id,
					guild: message.guild.id,
					hourly: otherB.hourly,
					daily: otherB.daily,
					weekly: otherB.weekly,
					monthly: otherB.monthly,
					yearly: otherB.yearly,
					stealcool: otherB.stealcool,
					boosts: otherB.boosts,
					cash: otherB.cash,
					bank: calc,
					total: totalCalc,
					fishcool: otherB.fishcool,
					farmcool: otherB.farmcool,
					items: otherB.items,
					claimNewUser: otherB.claimNewUser
				};

				this.client.setUserBalance.run(setUse);

				const endTime = new Date().getTime() + 240000;

				const addAut = {
					id: `${message.author.id}-${message.guild.id}`,
					user: message.author.id,
					guild: message.guild.id,
					hourly: balance.hourly,
					daily: balance.daily,
					weekly: balance.weekly,
					monthly: balance.monthly,
					yearly: balance.yearly,
					stealcool: endTime,
					boosts: balance.boosts,
					cash: balance.cash,
					bank: calc2,
					total: totalCalc2,
					fishcool: balance.fishcool,
					farmcool: balance.farmcool,
					items: balance.items,
					claimNewUser: balance.claimNewUser
				};

				this.client.setBalance.run(addAut);

				const failMessage = [
					`You tried to mug ${user} but they over-powered you${stealAmount > 1 ? ` and took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.` : `.`}`,
					`You held ${user} at knife point but they knew Karate${stealAmount > 1 ? ` and stole your lunch money <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.` : `.`}`,
					`You challenged ${user} to a 1v1 and lost${stealAmount > 1 ? ` <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.` : `.`}`,
					`You hired someone to mug ${user}${stealAmount > 1 ? ` but they mugged you instead and took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.` : ` ${user} fought him off.`}`,
					`You tried to stab ${user}, but they said 'no u'${stealAmount > 1 ? ` and you stabbed yourself. You lost <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.` : ` and walked away.`}`,
					`You tried to steal from ${user} but they caught you${stealAmount > 1 ? ` and they took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\` from you.` : `, they simply said 'pathetic' and walked away.`}`
				];

				const depArg = new MessageEmbed()
					.setAuthor(`${message.author.username}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Steal**`,
						`**◎ Fail:** ${failMessage[Math.floor(Math.random() * failMessage.length)]}`);
				message.channel.send(depArg);
				return;
			}
		} else {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Steal**`,
					`**◎ Error:** Please wait \`${ms(balance.stealcool - new Date().getTime(), { long: true })}\`, before using this command again!`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
	}

};
