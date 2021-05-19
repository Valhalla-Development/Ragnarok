/* eslint-disable no-mixed-operators */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const paginationEmbed = require('@xoalone/discordjs-pagination');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Harvests crops',
			category: 'Economy'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const balance = await this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);

		let foundBoostList = await JSON.parse(balance.boosts);

		if (!foundBoostList) {
			foundBoostList = {};
		}

		if (!foundBoostList.farmPlot) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Harvest**`,
					`**◎ Error:** You do not have a farming plot! You will be awarded one once you purhcase farming tools with: \`${prefix}shop buy\``);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let foundPlotList = await JSON.parse(balance.farmPlot);

		if (!foundPlotList) {
			foundPlotList = [];
		}

		let harvestable;

		if (foundPlotList.length) {
			harvestable = foundPlotList.filter(key => key.cropStatus === 'harvest');
		}

		if (!foundPlotList.length || !harvestable.length) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Harvest**`,
					`**◎ Error:** You have nothing to harvest!`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let foundHarvestedList = await JSON.parse(balance.harvestedCrops);

		if (!foundHarvestedList) {
			foundHarvestedList = [];
		}

		const availableSpots = foundBoostList.farmBag - foundHarvestedList.length;

		const cornPrice = this.client.ecoPrices.corn;
		const wheatPrice = this.client.ecoPrices.wheat;
		const potatoesPrice = this.client.ecoPrices.potatoes;
		const tomatoesPrice = this.client.ecoPrices.tomatoes;


		if (availableSpots <= 0) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Harvest**`,
					`**◎ Error:** You do not have enough space to harvest anything!\nYou can upgrade your storage with the command \`${prefix}shop upgrade\``);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[0] === undefined) {
			const arr = [];

			foundPlotList.forEach(key => {
				if (key.cropStatus === 'harvest') {
					arr.push(`\u3000Crop Type: \`${this.client.utils.capitalise(key.cropType)}\` - Crop Decay: \`${key.decay.toFixed(4)}%\``);
				}
			});

			const pages = [];

			while (arr.length) {
				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Harvest**`,
						`**◎ Success:** The following crops are ready to be harvested!\n${arr.splice(0, 5).join(`\n`)}`)
					.setFooter(`To harvest, you can run ${prefix}harvest all`);
				pages.push(embed);
			}
			paginationEmbed(message, pages);
			return;
		}

		if (args[0] === 'all') {
			let totalToAdd = 0;
			let sellPrice;
			const arr = [];

			harvestCrops();

			foundHarvestedList.forEach(key => {
				if (key.cropType === 'corn') {
					totalToAdd += Math.floor(cornPrice * (1 - key.decay.toFixed(4) / 100));
					sellPrice = Math.floor(cornPrice * (1 - key.decay.toFixed(4) / 100));
					arr.push(`\u3000Crop Type: \`Corn\` - Current Value: <:coin:706659001164628008>\`${sellPrice.toLocaleString('en')}\` - Decayed: \`${key.decay.toFixed(4)}\`%`);
				}
				if (key.cropType === 'wheat') {
					totalToAdd += Math.floor(wheatPrice * (1 - key.decay.toFixed(4) / 100));
					sellPrice = Math.floor(wheatPrice * (1 - key.decay.toFixed(4) / 100));
					arr.push(`\u3000Crop Type: \`Wheat\` - Current Value: <:coin:706659001164628008>\`${sellPrice.toLocaleString('en')}\` - Decayed: \`${key.decay.toFixed(4)}\`%`);
				}
				if (key.cropType === 'potato') {
					totalToAdd += Math.floor(potatoesPrice * (1 - key.decay.toFixed(4) / 100));
					sellPrice = Math.floor(potatoesPrice * (1 - key.decay.toFixed(4) / 100));
					arr.push(`\u3000Crop Type: \`Potato\` - Current Value: <:coin:706659001164628008>\`${sellPrice.toLocaleString('en')}\` - Decayed: \`${key.decay.toFixed(4)}\`%`);
				}
				if (key.cropType === 'tomato') {
					totalToAdd += Math.floor(tomatoesPrice * (1 - key.decay.toFixed(4) / 100));
					sellPrice = Math.floor(tomatoesPrice * (1 - key.decay.toFixed(4) / 100));
					arr.push(`\u3000Crop Type: \`Tomato\` - Current Value: <:coin:706659001164628008>\`${sellPrice.toLocaleString('en')}\` - Decayed: \`${key.decay.toFixed(4)}\`%`);
				}
			});

			await db.prepare('UPDATE balance SET farmPlot = (@crops) WHERE id = (@id);').run({
				crops: foundPlotList.length ? JSON.stringify(foundPlotList) : null,
				id: `${message.author.id}-${message.guild.id}`
			});

			await db.prepare('UPDATE balance SET harvestedCrops = (@crops) WHERE id = (@id);').run({
				crops: JSON.stringify(foundHarvestedList),
				id: `${message.author.id}-${message.guild.id}`
			});

			const pages = [];

			while (arr.length) {
				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Harvest**`,
						`**◎ Success:** You have harvested the following crops:\n${arr.splice(0, 5).join(`\n`)}\n\n In total, the current value is <:coin:706659001164628008>\`${totalToAdd.toLocaleString('en')}\`\nThis value of each crop will continue to depreciate, I recommend you sell your crops.`);
				pages.push(embed);
			}
			paginationEmbed(message, pages); // when emotes get removed manually, error in log, add catch maybe somehow
		}
		function harvestCrops() {
			for (let removeCounter = 0, harvestCounter = 0; removeCounter < foundPlotList.length && harvestCounter < availableSpots; removeCounter++) {
				if (foundPlotList[removeCounter].cropStatus === 'harvest') {
					const removedArray = foundPlotList.splice(removeCounter, 1);
					foundHarvestedList.push(removedArray[0]);
					harvestCounter++;
					removeCounter--;
				}
			}
			return foundHarvestedList;
		}
	}

};
