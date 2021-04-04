const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const prettyMilliseconds = require('pretty-ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['inv'],
			description: 'View your inventory',
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

		let currentTotalPlanted = 0;

		if (foundPlotList.corn) {
			currentTotalPlanted += Number(foundPlotList.corn);
		} else {
			currentTotalPlanted += Number(0);
		}
		if (foundPlotList.wheat) {
			currentTotalPlanted += Number(foundPlotList.wheat);
		} else {
			currentTotalPlanted += Number(0);
		}
		if (foundPlotList.potatoes) {
			currentTotalPlanted += Number(foundPlotList.potatoes);
		} else {
			currentTotalPlanted += Number(0);
		}
		if (foundPlotList.tomatoes) {
			currentTotalPlanted += Number(foundPlotList.tomatoes);
		} else {
			currentTotalPlanted += Number(0);
		}

		if (Number(currentTotalPlanted) >= Number(foundBoostList.farmPlot)) {
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
		} else if (args[0] === 'corn') {
			if (!foundItemList.cornSeeds) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Plant**`,
						`**◎ Error:** You do not have any corn seeds! You can buy some by running: \`${prefix}shop buy`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (args[1] === undefined) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Plant**`,
						`**◎ Error:** Please input a valid amount of seeds to plant.\nAn example would be: \`${prefix}plant corn 4\`\nYou currently have \`${foundItemList.cornSeeds}\` seeds available to plant.`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const cornAmt = args[1] ? Number(args[1]) : 1;

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

			if (Number(currentTotalPlanted) + Number(cornAmt) >= Number(foundBoostList.farmPlot) + 1) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Plant**`, [
						`**◎ Error:** You do not have enough room to plant \`${cornAmt}\` seeds.\nYour current plot capacity is: \`${Number(currentTotalPlanted)}\`/\`${Number(foundBoostList.farmPlot)}\``
					]);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Plant**`, [
					`**◎ Success:** You have successfully plant \`${cornAmt}\` seeds.\nCorn takes \`${prettyMilliseconds(cornGrow, { verbose: true })}\` to grow.\nYour current plot capacity is: \`${Number(currentTotalPlanted) + Number(cornAmt)}\`/\`${Number(foundBoostList.farmPlot)}\``
				]);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
	}

};
