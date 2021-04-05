const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const prettyMilliseconds = require('pretty-ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Plant seeds',
			category: 'Economy'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);

		let foundPlotList = JSON.parse(balance.farmPlot);
		let foundBoostList = JSON.parse(balance.boosts);
		let foundItemList = JSON.parse(balance.items);

		const cornGrow = this.client.ecoPrices.cornPlant;
		const wheatGrow = this.client.ecoPrices.wheatPlant;
		const potatoGrow = this.client.ecoPrices.potatoPlant;
		const tomatoeGrow = this.client.ecoPrices.tomatoPlant;

		if (!foundPlotList) {
			foundPlotList = {};
		}

		if (!foundBoostList) {
			foundBoostList = {};
		}

		if (!foundItemList) {
			foundItemList = {};
		}

		if (!foundBoostList.farmPlot) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Plant**`,
					`**◎ Error:** You do not have a farming plot! You will be awarded one once you purhcase farming tools with: \`${prefix}shop buy\``);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!foundItemList.cornSeeds && !foundItemList.wheatSeeds && !foundItemList.potatoeSeeds && !foundItemList.tomatoeSeeds) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Plant**`,
					`**◎ Error:** You do not have any seeds! You can buy them from the shop:\n${prefix}shop buy`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[0] === 'dm') {
			if (args[1] === undefined) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Plant**`,
						`**◎ Success:** You have the following commands you can run:\n\n\`${prefix}plant dm off\`\n\`${prefix}plant dm on\``);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (args[1] === 'off') {
				if (balance.dmHarvest) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor(`${message.author.tag}`, message.author.avatarURL())
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Plant DM**`,
							`**◎ Error:** You already have DM alerts disabled!`);
					message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				} else {
					await db.prepare('UPDATE balance SET dmHarvest = (@dmHarvest) WHERE id = (@id);').run({
						dmHarvest: 'off',
						id: `${message.author.id}-${message.guild.id}`
					});

					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor(`${message.author.tag}`, message.author.avatarURL())
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Plant DM**`,
							`**◎ Success:** You will no longer receive alerts when a harvest is ready!`);
					message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
			}

			if (args[1] === 'on') {
				if (balance.dmHarvest) {
					await db.prepare('UPDATE balance SET dmHarvest = (@dmHarvest) WHERE id = (@id);').run({
						dmHarvest: null,
						id: `${message.author.id}-${message.guild.id}`
					});

					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor(`${message.author.tag}`, message.author.avatarURL())
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Plant DM**`,
							`**◎ Success:** You will now receive alerts when a harvest is ready.`)
						.setFooter(`Note: You must have DM's enabled for this feature!`);
					message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				} else {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor(`${message.author.tag}`, message.author.avatarURL())
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Plant DM**`,
							`**◎ Error:** You already have harvest alerts enabled!`);
					message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
			}
		}

		if (Object.keys(foundPlotList).length >= Number(foundBoostList.farmPlot)) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Plant**`,
					`**◎ Error:** You do not have enough space in your plot. You can upgrade your plot with the command \`${prefix}shop upgrade`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[0] !== 'corn' && args[0] !== 'wheat' && args[0] !== 'potato' && args[0] !== 'tomato') {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Plant**`,
					`**◎ Error:** Incorrect Usage! Available commands:\n\`${prefix}plant corn <amt>\`\n\`${prefix}plant wheat <amt>\`\n\`${prefix}plant potato <amt>\`\n\`${prefix}plant tomato <amt>\``);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		async function cropCreator(type, status, time, count) {
			const occupied = Object.keys(foundPlotList).length;

			var cropCounter;
			for (cropCounter = 0; cropCounter < count; cropCounter++) {
				// I added 1 because it seemed to make it work, don’t ask why
				const number = occupied + cropCounter + 1;

				foundPlotList[`plot${number}`] = { cropType: type, cropStatus: status, cropGrowTime: time };
			}

			await db.prepare('UPDATE balance SET farmPlot = (@crops) WHERE id = (@id);').run({
				crops: JSON.stringify(foundPlotList),
				id: `${message.author.id}-${message.guild.id}`
			});
		}

		if (args[0] === 'corn') {
			const cornAmt = args[1] ? Number(args[1]) : 1;

			if (!foundItemList.cornSeeds || Number(foundItemList.cornSeeds - Number(cornAmt)) < 0) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Plant**`,
						`**◎ Error:** You do not have any corn seeds! You can buy some by running: \`${prefix}shop buy\``);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (isNaN(cornAmt)) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Plant**`, [
						`**◎ Error:** Please enter a valid number.`
					]);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (Object.keys(foundPlotList).length + Number(cornAmt) > Number(foundBoostList.farmPlot)) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Plant**`, [
						`**◎ Error:** You do not have enough room to plant \`${cornAmt}\` ${cornAmt > 1 ? 'seeds.' : 'seed.'}\nYour current plot capacity is: \`${Object.keys(foundPlotList).length}\`/\`${Number(foundBoostList.farmPlot)}\``
					]);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const removeSeed = Number(foundItemList.cornSeeds) - Number(cornAmt);

			if (removeSeed === 0) {
				delete foundItemList.cornSeeds;
			} else {
				foundItemList.cornSeeds = removeSeed.toString();
			}

			cropCreator('corn', 'planting', new Date().getTime() + Number(cornGrow), cornAmt);

			await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
				items: JSON.stringify(foundItemList),
				id: `${message.author.id}-${message.guild.id}`
			});

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Plant**`, [
					`**◎ Success:** You have successfully planted \`${cornAmt}\` ${cornAmt > 1 ? 'seeds.' : 'seed.'}\nCorn takes \`${prettyMilliseconds(cornGrow, { verbose: true })}\` to grow.\nYour current plot capacity is: \`${Object.keys(foundPlotList).length}\`/\`${Number(foundBoostList.farmPlot)}\``
				]);
			message.channel.send(embed);
			return;
		}

		if (args[0] === 'wheat') {
			const wheatAmt = args[1] ? Number(args[1]) : 1;

			if (!foundItemList.wheatSeeds || Number(foundItemList.wheatSeeds - Number(wheatAmt)) < 0) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Plant**`,
						`**◎ Error:** You do not have any wheat seeds! You can buy some by running: \`${prefix}shop buy\``);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (isNaN(wheatAmt)) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Plant**`, [
						`**◎ Error:** Please enter a valid number.`
					]);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (Object.keys(foundPlotList).length + Number(wheatAmt) > Number(foundBoostList.farmPlot)) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Plant**`, [
						`**◎ Error:** You do not have enough room to plant \`${wheatAmt}\` ${wheatAmt > 1 ? 'seeds.' : 'seed.'}\nYour current plot capacity is: \`${Object.keys(foundPlotList).length}\`/\`${Number(foundBoostList.farmPlot)}\``
					]);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const removeSeed = Number(foundItemList.wheatSeeds) - Number(wheatAmt);

			if (removeSeed === 0) {
				delete foundItemList.wheatSeeds;
			} else {
				foundItemList.wheatSeeds = removeSeed.toString();
			}

			cropCreator('wheat', 'planting', new Date().getTime() + Number(wheatGrow), wheatAmt);

			await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
				items: JSON.stringify(foundItemList),
				id: `${message.author.id}-${message.guild.id}`
			});

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Plant**`, [
					`**◎ Success:** You have successfully planted \`${wheatAmt}\` ${wheatAmt > 1 ? 'seeds.' : 'seed.'}\nWheat takes \`${prettyMilliseconds(wheatGrow, { verbose: true })}\` to grow.\nYour current plot capacity is: \`${Object.keys(foundPlotList).length}\`/\`${Number(foundBoostList.farmPlot)}\``
				]);
			message.channel.send(embed);
			return;
		}

		if (args[0] === 'potato') {
			const potatoeAmt = args[1] ? Number(args[1]) : 1;

			if (!foundItemList.potatoeSeeds || Number(foundItemList.potatoeSeeds - Number(potatoeAmt)) < 0) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Plant**`,
						`**◎ Error:** You do not have any wheat seeds! You can buy some by running: \`${prefix}shop buy\``);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (isNaN(potatoeAmt)) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Plant**`, [
						`**◎ Error:** Please enter a valid number.`
					]);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (Object.keys(foundPlotList).length + Number(potatoeAmt) > Number(foundBoostList.farmPlot)) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Plant**`, [
						`**◎ Error:** You do not have enough room to plant \`${potatoeAmt}\` ${potatoeAmt > 1 ? 'seeds.' : 'seed.'}\nYour current plot capacity is: \`${Object.keys(foundPlotList).length}\`/\`${Number(foundBoostList.farmPlot)}\``
					]);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const removeSeed = Number(foundItemList.potatoeSeeds) - Number(potatoeAmt);

			if (removeSeed === 0) {
				delete foundItemList.potatoeSeeds;
			} else {
				foundItemList.potatoeSeeds = removeSeed.toString();
			}

			cropCreator('potato', 'planting', new Date().getTime() + Number(potatoGrow), potatoeAmt);

			await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
				items: JSON.stringify(foundItemList),
				id: `${message.author.id}-${message.guild.id}`
			});

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Plant**`, [
					`**◎ Success:** You have successfully planted \`${potatoeAmt}\` ${potatoeAmt > 1 ? 'seeds.' : 'seed.'}\nPotatoe's take \`${prettyMilliseconds(potatoGrow, { verbose: true })}\` to grow.\nYour current plot capacity is: \`${Object.keys(foundPlotList).length}\`/\`${Number(foundBoostList.farmPlot)}\``
				]);
			message.channel.send(embed);
			return;
		}

		if (args[0] === 'tomato') {
			const tomatoeAmt = args[1] ? Number(args[1]) : 1;

			if (!foundItemList.tomatoeSeeds || Number(foundItemList.tomatoeSeeds - Number(tomatoeAmt)) < 0) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Plant**`,
						`**◎ Error:** You do not have any wheat seeds! You can buy some by running: \`${prefix}shop buy\``);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (isNaN(tomatoeAmt)) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Plant**`, [
						`**◎ Error:** Please enter a valid number.`
					]);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (Object.keys(foundPlotList).length + Number(tomatoeAmt) > Number(foundBoostList.farmPlot)) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Plant**`, [
						`**◎ Error:** You do not have enough room to plant \`${tomatoeAmt}\` ${tomatoeAmt > 1 ? 'seeds.' : 'seed.'}\nYour current plot capacity is: \`${Object.keys(foundPlotList).length}\`/\`${Number(foundBoostList.farmPlot)}\``
					]);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const removeSeed = Number(foundItemList.tomatoeSeeds) - Number(tomatoeAmt);

			if (removeSeed === 0) {
				delete foundItemList.tomatoeSeeds;
			} else {
				foundItemList.tomatoeSeeds = removeSeed.toString();
			}

			cropCreator('tomato', 'planting', new Date().getTime() + Number(tomatoeGrow), tomatoeAmt);

			await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
				items: JSON.stringify(foundItemList),
				id: `${message.author.id}-${message.guild.id}`
			});

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Plant**`, [
					`**◎ Success:** You have successfully planted \`${tomatoeAmt}\` ${tomatoeAmt > 1 ? 'seeds.' : 'seed.'}\nTomatoe's take \`${prettyMilliseconds(tomatoeGrow, { verbose: true })}\` to grow.\nYour current plot capacity is: \`${Object.keys(foundPlotList).length}\`/\`${Number(foundBoostList.farmPlot)}\``
				]);
			message.channel.send(embed);
			return;
		}
	}

};
