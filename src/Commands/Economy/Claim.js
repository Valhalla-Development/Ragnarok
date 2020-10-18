/* eslint-disable no-mixed-operators */
/* eslint-disable no-inline-comments */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const ms = require('ms');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['rewards', 'claimable', 'reward'],
			description: 'Displays available rewards',
			category: 'Economy'
		});
	}

	async run(message, args) {
		const balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);

		const date = new Date();

		if (balance.claimNewUser) {
			if (Date.now() > balance.claimNewUser) {
				message.channel.send(balance.claimNewUser);
				await db.prepare('UPDATE balance SET claimNewUser = (@claimNewUser) WHERE id = (@id);').run({
					claimNewUser: null,
					id: `${message.author.id}-${message.guild.id}`
				});
			} else {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Claim**`,
						`**◎ Error:** Your Economy proifle is too new! Please wait another \`${ms(balance.claimNewUser - new Date().getTime(), { long: true })}\` before using this command.`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
		}

		if (Date.now() > balance.hourly) {
			await db.prepare('UPDATE balance SET hourly = (@hourly) WHERE id = (@id);').run({
				hourly: null,
				id: `${message.author.id}-${message.guild.id}`
			});
		}

		if (Date.now() > balance.daily) {
			await db.prepare('UPDATE balance SET daily = (@daily) WHERE id = (@id);').run({
				daily: null,
				id: `${message.author.id}-${message.guild.id}`
			});
		}

		if (Date.now() > balance.weekly) {
			await db.prepare('UPDATE balance SET weekly = (@weekly) WHERE id = (@id);').run({
				weekly: null,
				id: `${message.author.id}-${message.guild.id}`
			});
		}

		if (Date.now() > balance.monthly) {
			await db.prepare('UPDATE balance SET monthly = (@monthly) WHERE id = (@id);').run({
				monthly: null,
				id: `${message.author.id}-${message.guild.id}`
			});
		}

		if (Date.now() > balance.yearly) {
			await db.prepare('UPDATE balance SET yearly = (@monthly) WHERE id = (@id);').run({
				monthly: null,
				id: `${message.author.id}-${message.guild.id}`
			});
		}

		if (!args.length) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Claim**`, [
					`**◎ Hourly:** \`${Date.now() > balance.hourly ? 'Available!' : ms(balance.hourly - date.getTime(), { long: true })}\``,
					`**◎ Daily:** \`${Date.now() > balance.daily ? 'Available!' : ms(balance.daily - date.getTime(), { long: true })}\``,
					`**◎ Weekly:** \`${Date.now() > balance.weekly ? 'Available!' : ms(balance.weekly - date.getTime(), { long: true })}\``,
					`**◎ Monthly:** \`${Date.now() > balance.monthly ? 'Available!' : ms(balance.monthly - date.getTime(), { long: true })}\``,
					`**◎ Yearly:** \`${Date.now() > balance.yearly ? 'Available!' : ms(balance.yearly - date.getTime(), { long: true })}\``
				]);
			message.channel.send(embed);
			return;
		}

		if (args[0] === 'all') {
			if (balance.hourly && balance.daily && balance.weekly && balance.monthly && balance.yearly) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Claim - All**`, [
						`**◎ Error:** You have nothing to claim!`
					]);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			let fullPrice = 0;

			if (!balance.hourly) fullPrice += this.client.ecoPrices.hourlyClaim;
			if (!balance.daily) fullPrice += this.client.ecoPrices.dailyClaim;
			if (!balance.weekly) fullPrice += this.client.ecoPrices.weeklyClaim;
			if (!balance.monthly) fullPrice += this.client.ecoPrices.monthlyCliam;
			if (!balance.yearly) fullPrice += this.client.ecoPrices.yearlyClaim;

			message.channel.send(fullPrice);
			message.channel.send(this.client.ecoPrices.yearlyClaim);
			message.channel.send(Number(fullPrice).toLocaleString('en'));
			const endTime = new Date().getTime();

			const addAut = {
				id: `${message.author.id}-${message.guild.id}`,
				user: message.author.id,
				guild: message.guild.id,
				hourly: !balance.hourly ? endTime + 3600000 : balance.hourly,
				daily: !balance.daily ? endTime + 86400000 : balance.daily,
				weekly: !balance.weekly ? endTime + 604800000 : balance.weekly,
				monthly: !balance.monthly ? endTime + 2629800000 : balance.monthly,
				yearly: !balance.yearly ? endTime + 31557600000 : balance.yearly,
				stealcool: balance.stealcool,
				boosts: balance.boosts,
				cash: balance.cash,
				bank: balance.bank + fullPrice,
				total: balance.total + fullPrice,
				fishcool: balance.fishcool,
				farmcool: balance.farmcool,
				items: balance.items,
				claimNewUser: balance.claimNewUser
			};

			this.client.setBalance.run(addAut);

			const newTot = balance.total + fullPrice;

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Claim - All**`, [
					`**◎ Success:** You have claimed all available claims! <:coin:706659001164628008> \`${fullPrice.toLocaleString('en')}\` has been credited to your bank.\n Your new total is <:coin:706659001164628008> \`${newTot.toLocaleString('en')}\``
				]);
			message.channel.send(embed);
			return;
		}

		if (args[0] === 'hourly') {
			if (Date.now() > balance.hourly) {
				await db.prepare('UPDATE balance SET hourly = (@hourly) WHERE id = (@id);').run({
					hourly: null,
					id: `${message.author.id}-${message.guild.id}`
				});

				const hourlyAmount = Math.floor(Math.random() * (150 - 50 + 1) + 50); // * (max - min + 1) + min);

				const endTime = new Date().getTime() + 3600000;

				const totaCalc2 = balance.total + hourlyAmount;
				const addAut = {
					id: `${message.author.id}-${message.guild.id}`,
					user: message.author.id,
					guild: message.guild.id,
					hourly: endTime,
					daily: balance.daily,
					weekly: balance.weekly,
					monthly: balance.monthly,
					yearly: balance.yearly,
					stealcool: balance.stealcool,
					boosts: balance.boosts,
					cash: balance.cash + hourlyAmount,
					bank: balance.bank,
					total: totaCalc2,
					fishcool: balance.fishcool,
					farmcool: balance.farmcool,
					items: balance.items,
					claimNewUser: balance.claimNewUser
				};

				this.client.setBalance.run(addAut);

				const depArg = new MessageEmbed()
					.setAuthor(`${message.author.username}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Hourly**`,
						`**◎ Success:** You have received your hourly sum of: <:coin:706659001164628008> ${hourlyAmount.toLocaleString('en')}.`);
				message.channel.send(depArg);
				return;
			}

			if (balance.hourly !== null) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Hourly**`,
						`**◎ Error:** Please wait another \`${ms(balance.hourly - date.getTime(), { long: true })}\` before using this command.`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
		}

		if (args[0] === 'daily') {
			if (Date.now() > balance.daily) {
				await db.prepare('UPDATE balance SET daily = (@daily) WHERE id = (@id);').run({
					daily: null,
					id: `${message.author.id}-${message.guild.id}`
				});

				const dailyAmount = Math.floor(Math.random() * (300 - 150 + 1) + 150); // * (max - min + 1) + min);

				const endTime = new Date().getTime() + 86400000;

				const totaCalc2 = balance.total + dailyAmount;
				const addAut = {
					id: `${message.author.id}-${message.guild.id}`,
					user: message.author.id,
					guild: message.guild.id,
					hourly: balance.hourly,
					daily: endTime,
					weekly: balance.weekly,
					monthly: balance.monthly,
					yearly: balance.yearly,
					stealcool: balance.stealcool,
					boosts: balance.boosts,
					cash: balance.cash + dailyAmount,
					bank: balance.bank,
					total: totaCalc2,
					fishcool: balance.fishcool,
					farmcool: balance.farmcool,
					items: balance.items,
					claimNewUser: balance.claimNewUser
				};

				this.client.setBalance.run(addAut);

				const depArg = new MessageEmbed()
					.setAuthor(`${message.author.username}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Daily**`,
						`**◎ Success:** You have received your daily sum of: <:coin:706659001164628008> ${dailyAmount.toLocaleString('en')}.`);
				message.channel.send(depArg);
				return;
			}

			if (balance.daily !== null) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Daily**`,
						`**◎ Error:** Please wait another \`${ms(balance.daily - date.getTime(), { long: true })}\` before using this command.`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
		}

		if (args[0] === 'weekly') {
			if (Date.now() > balance.weekly) {
				await db.prepare('UPDATE balance SET weekly = (@weekly) WHERE id = (@id);').run({
					weekly: null,
					id: `${message.author.id}-${message.guild.id}`
				});

				const weeklyAmount = Math.floor(Math.random() * (1000 - 750 + 1) + 750); // * (max - min + 1) + min);

				const endTime = new Date().getTime() + 604800000;

				const totaCalc2 = balance.total + weeklyAmount;
				const addAut = {
					id: `${message.author.id}-${message.guild.id}`,
					user: message.author.id,
					guild: message.guild.id,
					hourly: balance.hourly,
					daily: balance.daily,
					weekly: endTime,
					monthly: balance.monthly,
					yearly: balance.yearly,
					stealcool: balance.stealcool,
					boosts: balance.boosts,
					cash: balance.cash + weeklyAmount,
					bank: balance.bank,
					total: totaCalc2,
					fishcool: balance.fishcool,
					farmcool: balance.farmcool,
					items: balance.items,
					claimNewUser: balance.claimNewUser
				};

				this.client.setBalance.run(addAut);

				const depArg = new MessageEmbed()
					.setAuthor(`${message.author.username}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Weeky**`,
						`**◎ Success:** You have received your weekly sum of: <:coin:706659001164628008> ${weeklyAmount.toLocaleString('en')}.`);
				message.channel.send(depArg);
				return;
			}

			if (balance.weekly !== null) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Weekly**`,
						`**◎ Error:** Please wait another \`${Date.now() > balance.weekly ? 'Available!' : ms(balance.weekly - date.getTime(), { long: true })}\` before using this command.`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
		}

		if (args[0] === 'monthly') {
			if (Date.now() > balance.monthly) {
				await db.prepare('UPDATE balance SET monthly = (@monthly) WHERE id = (@id);').run({
					monthly: null,
					id: `${message.author.id}-${message.guild.id}`
				});

				const monthlyAmount = Math.floor(Math.random() * (6000 - 4000 + 1) + 4000); // * (max - min + 1) + min);

				const endTime = new Date().getTime() + 2629800000;

				const totaCalc2 = balance.total + monthlyAmount;
				const addAut = {
					id: `${message.author.id}-${message.guild.id}`,
					user: message.author.id,
					guild: message.guild.id,
					hourly: balance.hourly,
					daily: balance.daily,
					weekly: balance.weekly,
					monthly: endTime,
					yearly: balance.yearly,
					stealcool: balance.stealcool,
					boosts: balance.boosts,
					cash: balance.cash + monthlyAmount,
					bank: balance.bank,
					total: totaCalc2,
					fishcool: balance.fishcool,
					farmcool: balance.farmcool,
					items: balance.items,
					claimNewUser: balance.claimNewUser
				};

				this.client.setBalance.run(addAut);

				const depArg = new MessageEmbed()
					.setAuthor(`${message.author.username}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Monthly**`,
						`**◎ Success:** You have received your monthly sum of: <:coin:706659001164628008> ${monthlyAmount.toLocaleString('en')}.`);
				message.channel.send(depArg);
				return;
			}

			if (balance.monthly !== null) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Monthly**`,
						`**◎ Error:** Please wait another \`${Date.now() > balance.monthly ? 'Available!' : ms(balance.monthly - date.getTime(), { long: true })}\` before using this command.`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
		}

		if (args[0] === 'yearly') {
			if (Date.now() > balance.yearly) {
				await db.prepare('UPDATE balance SET yearly = (@yearly) WHERE id = (@id);').run({
					yearly: null,
					id: `${message.author.id}-${message.guild.id}`
				});

				const yearlyAmount = Math.floor(Math.random() * (50000 - 47500 + 1) + 47500); // * (max - min + 1) + min);

				const endTime = new Date().getTime() + 31557600000;

				const totaCalc2 = balance.total + yearlyAmount;
				const addAut = {
					id: `${message.author.id}-${message.guild.id}`,
					user: message.author.id,
					guild: message.guild.id,
					hourly: balance.hourly,
					daily: balance.daily,
					weekly: balance.weekly,
					monthly: balance.monthly,
					yearly: endTime,
					stealcool: balance.stealcool,
					boosts: balance.boosts,
					cash: balance.cash + yearlyAmount,
					bank: balance.bank,
					total: totaCalc2,
					fishcool: balance.fishcool,
					farmcool: balance.farmcool,
					items: balance.items,
					claimNewUser: balance.claimNewUser
				};

				this.client.setBalance.run(addAut);

				const depArg = new MessageEmbed()
					.setAuthor(`${message.author.username}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Yearly**`,
						`**◎ Success:** You have received your yearly sum of: <:coin:706659001164628008> ${yearlyAmount.toLocaleString('en')}.`);
				message.channel.send(depArg);
				return;
			}

			if (balance.yearly !== null) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Yearly**`,
						`**◎ Error:** Please wait another \`${Date.now() > balance.yearly ? 'Available!' : ms(balance.yearly - date.getTime(), { long: true })}\` before using this command.`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
		}
	}

};
