/* eslint-disable no-mixed-operators */
/* eslint-disable no-inline-comments */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

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

		if (!balance.items) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Items**`,
					`**◎ Error:** You do not have any items.`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const fishingPrice = this.client.ecoPrices.fishingRod;
		const farmingPrice = this.client.ecoPrices.farmingTools;

		let foundItemList = JSON.parse(balance.items);
		let foundBoostList = JSON.parse(balance.boosts);
		let foundPlotList = JSON.parse(balance.farmPlot);

		if (!foundBoostList) {
			foundBoostList = {};
		}

		if (!foundItemList) {
			foundItemList = {};
		}

		if (!foundPlotList) {
			foundPlotList = [];
		}

		let troutPrice;
		let salmonPrice;
		let swordFishPrice;
		let pufferFishPrice;
		let treasurePrice;

		let goldBarPrice;
		let cornPrice;
		let wheatPrice;
		let potatoesPrice;
		let tomatoesPrice;
		let goldNuggetPrice;
		let barleyPrice;
		let spinachPrice;
		let strawberriesPrice;
		let lettucePrice;

		if (foundItemList.trout) troutPrice = this.client.ecoPrices.trout * Number(foundItemList.trout);
		if (foundItemList.kingSalmon) salmonPrice = this.client.ecoPrices.kingSalmon * Number(foundItemList.kingSalmon);
		if (foundItemList.swordfish) swordFishPrice = this.client.ecoPrices.swordfish * Number(foundItemList.swordfish);
		if (foundItemList.pufferfish) pufferFishPrice = this.client.ecoPrices.pufferfish * Number(foundItemList.pufferfish);
		if (foundItemList.treasure) treasurePrice = this.client.ecoPrices.treasure * Number(foundItemList.treasure);

		if (foundItemList.goldBar) goldBarPrice = this.client.ecoPrices.goldBar * Number(foundItemList.goldBar);
		if (foundPlotList.corn) cornPrice = this.client.ecoPrices.corn * Number(foundPlotList.corn);
		if (foundPlotList.corn) wheatPrice = this.client.ecoPrices.wheat * Number(foundPlotList.corn);
		if (foundPlotList.potato) potatoesPrice = this.client.ecoPrices.potatoes * Number(foundPlotList.potato);
		if (foundPlotList.tomato) tomatoesPrice = this.client.ecoPrices.tomatoes * Number(foundPlotList.tomato);
		if (foundItemList.goldNugget) goldNuggetPrice = this.client.ecoPrices.goldNugget * Number(foundItemList.goldNugget);
		if (foundItemList.barley) barleyPrice = this.client.ecoPrices.barley * Number(foundItemList.barley);
		if (foundItemList.spinach) spinachPrice = this.client.ecoPrices.spinach * Number(foundItemList.spinach);
		if (foundItemList.strawberries) strawberriesPrice = this.client.ecoPrices.strawberries * Number(foundItemList.strawberries);
		if (foundItemList.lettuce) lettucePrice = this.client.ecoPrices.lettuce * Number(foundItemList.lettuce);

		let fullPrice = 0;
		if (foundItemList.trout) fullPrice += Number(foundItemList.trout) * this.client.ecoPrices.trout;
		if (foundItemList.kingSalmon) fullPrice += Number(foundItemList.kingSalmon) * this.client.ecoPrices.kingSalmon;
		if (foundItemList.swordfish) fullPrice += Number(foundItemList.swordfish) * this.client.ecoPrices.swordfish;
		if (foundItemList.pufferfish)fullPrice += Number(foundItemList.pufferfish) * this.client.ecoPrices.pufferfish;
		if (foundItemList.treasure) fullPrice += Number(foundItemList.treasure) * this.client.ecoPrices.treasure;

		if (foundItemList.goldBar) fullPrice += Number(foundItemList.goldBar) * this.client.ecoPrices.goldBar;
		if (foundPlotList.corn) fullPrice += Number(foundPlotList.corn) * this.client.ecoPrices.corn;
		if (foundPlotList.corn) fullPrice += Number(foundPlotList.corn) * this.client.ecoPrices.wheat;
		if (foundPlotList.potato) fullPrice += Number(foundPlotList.potato) * this.client.ecoPrices.potatoes;
		if (foundPlotList.tomato) fullPrice += Number(foundPlotList.tomato) * this.client.ecoPrices.tomatoes;
		if (foundItemList.goldNugget) fullPrice += Number(foundItemList.goldNugget) * this.client.ecoPrices.goldNugget;
		if (foundItemList.barley) fullPrice += Number(foundItemList.barley) * this.client.ecoPrices.barley;
		if (foundItemList.spinach) fullPrice += Number(foundItemList.spinach) * this.client.ecoPrices.spinach;
		if (foundItemList.strawberries) fullPrice += Number(foundItemList.strawberries) * this.client.ecoPrices.strawberries;
		if (foundItemList.lettuce) fullPrice += Number(foundItemList.lettuce) * this.client.ecoPrices.lettuce;

		let currentTotalSeeds = 0;

		if (foundItemList.cornSeeds) {
			currentTotalSeeds += Number(foundItemList.cornSeeds);
		} else {
			currentTotalSeeds += Number(0);
		}
		if (foundItemList.wheatSeeds) {
			currentTotalSeeds += Number(foundItemList.wheatSeeds);
		} else {
			currentTotalSeeds += Number(0);
		}
		if (foundItemList.potatoSeeds) {
			currentTotalSeeds += Number(foundItemList.potatoSeeds);
		} else {
			currentTotalSeeds += Number(0);
		}
		if (foundItemList.tomatoSeeds) {
			currentTotalSeeds += Number(foundItemList.tomatoSeeds);
		} else {
			currentTotalSeeds += Number(0);
		}

		let currentTotalFish = 0;

		if (foundItemList.trout) {
			currentTotalFish += Number(foundItemList.trout);
		} else {
			currentTotalFish += Number(0);
		}
		if (foundItemList.kingSalmon) {
			currentTotalFish += Number(foundItemList.kingSalmon);
		} else {
			currentTotalFish += Number(0);
		}
		if (foundItemList.swordfish) {
			currentTotalFish += Number(foundItemList.swordfish);
		} else {
			currentTotalFish += Number(0);
		}
		if (foundItemList.pufferfish) {
			currentTotalFish += Number(foundItemList.pufferfish);
		} else {
			currentTotalFish += Number(0);
		}

		let currentTotalFarm = 0;

		if (foundPlotList.corn) {
			currentTotalFarm += Number(foundPlotList.corn);
		} else {
			currentTotalFarm += Number(0);
		}
		if (foundPlotList.corn) {
			currentTotalFarm += Number(foundPlotList.corn);
		} else {
			currentTotalFarm += Number(0);
		}
		if (foundPlotList.potato) {
			currentTotalFarm += Number(foundPlotList.potato);
		} else {
			currentTotalFarm += Number(0);
		}
		if (foundPlotList.tomato) {
			currentTotalFarm += Number(foundPlotList.tomato);
		} else {
			currentTotalFarm += Number(0);
		}

		let fields;

		if (!foundItemList.farmingTools) {
			fields = [
				`**◎ Crops:**`,
				`\u3000 Barley: Own ${foundItemList.barley === undefined ? `\`0\`` : `\`${foundItemList.barley}\` - <:coin:706659001164628008> \`${barleyPrice.toLocaleString('en')}\``}`,
				`\u3000 Spinach: Own ${foundItemList.spinach === undefined ? `\`0\`` : `\`${foundItemList.spinach}\` - <:coin:706659001164628008> \`${spinachPrice.toLocaleString('en')}\``}`,
				`\u3000 Strawberries: Own ${foundItemList.strawberries === undefined ? `\`0\`` : `\`${foundItemList.strawberries} \`- <:coin:706659001164628008> \`${strawberriesPrice.toLocaleString('en')}\``}`,
				`\u3000 Lettuce: Own ${foundItemList.lettuce === undefined ? `\`0\`` : `\`${foundItemList.lettuce}\` - <:coin:706659001164628008> \`${lettucePrice.toLocaleString('en')}\``}`
			];
		} else {
			fields = [
				`**◎ Crops:**`,
				`\u3000 Corn: Own ${foundPlotList.corn === undefined ? `\`0\`` : `\`${foundPlotList.corn}\` - <:coin:706659001164628008> \`${cornPrice.toLocaleString('en')}\``}`,
				`\u3000 Wheat: Own ${foundPlotList.corn === undefined ? `\`0\`` : `\`${foundPlotList.corn}\` - <:coin:706659001164628008> \`${wheatPrice.toLocaleString('en')}\``}`,
				`\u3000 Potatoes: Own ${foundPlotList.potato === undefined ? `\`0\`` : `\`${foundPlotList.potato} \`- <:coin:706659001164628008> \`${potatoesPrice.toLocaleString('en')}\``}`,
				`\u3000 Tomatoes: Own ${foundPlotList.tomato === undefined ? `\`0\`` : `\`${foundPlotList.tomato}\` - <:coin:706659001164628008> \`${tomatoesPrice.toLocaleString('en')}\``}`,
				`\u200b`,
				`**◎ Seeds:**`,
				`\u3000 Corn: Own ${foundItemList.cornSeeds === undefined ? `\`0\`` : `\`${foundItemList.cornSeeds}\``}`,
				`\u3000 Wheat: Own ${foundItemList.wheatSeeds === undefined ? `\`0\`` : `\`${foundItemList.wheatSeeds}\``}`,
				`\u3000 Potatoes: Own ${foundItemList.potatoSeeds === undefined ? `\`0\`` : `\`${foundItemList.potatoSeeds}\``}`,
				`\u3000 Tomatoes: Own ${foundItemList.tomatoSeeds === undefined ? `\`0\`` : `\`${foundItemList.tomatoSeeds}\``}`
			];
		}

		if (!args.length) {
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Items**`, [
					`**◎ Fish:**`,
					`\u3000 Trout: Own ${foundItemList.trout === undefined ? `\`0\`` : `\`${foundItemList.trout}\` - <:coin:706659001164628008> \`${troutPrice.toLocaleString('en')}\``}`,
					`\u3000 King Salmon: Own ${foundItemList.kingSalmon === undefined ? `\`0\`` : `\`${foundItemList.kingSalmon}\` - <:coin:706659001164628008> \`${salmonPrice.toLocaleString('en')}\``}`,
					`\u3000 Swordfish: Own ${foundItemList.swordfish === undefined ? `\`0\`` : `\`${foundItemList.swordfish} \`- <:coin:706659001164628008> \`${swordFishPrice.toLocaleString('en')}\``}`,
					`\u3000 Pufferfish: Own ${foundItemList.pufferfish === undefined ? `\`0\`` : `\`${foundItemList.pufferfish}\` - <:coin:706659001164628008> \`${pufferFishPrice.toLocaleString('en')}\``}`,
					`\u200b`,
					`${fields.join('\n')}`,
					`\u200b`,
					`**◎ Treasure:**`,
					`\u3000 Treasure Chest: Own ${foundItemList.treasure === undefined ? `\`0\`` : `\`${foundItemList.treasure}\` - <:coin:706659001164628008> \`${treasurePrice.toLocaleString('en')}\``}`,
					`\u3000 Gold Bar: Own ${foundItemList.goldBar === undefined ? `\`0\`` : `\`${foundItemList.goldBar}\` - <:coin:706659001164628008> \`${goldBarPrice.toLocaleString('en')}\``}`,
					`\u3000 Gold Nugget: Own ${foundItemList.goldNugget === undefined ? `\`0\`` : `\`${foundItemList.goldNugget}\` - <:coin:706659001164628008> \`${goldNuggetPrice.toLocaleString('en')}\``}`,
					`\u200b`,
					`**◎ Permanent Items:**`,
					`\u3000 ${!foundItemList.fishingRod ? `\`${prefix}shop buy rod\` - <:coin:706659001164628008> \`${fishingPrice.toLocaleString('en')}\`` : `Fishing Rod - \`Owned\``}`,
					`\u3000 Fish Bag - ${!foundBoostList.fishBag ? `\`Not Owned\` - Buy fishing rod to aquire` : `\`Owned\` - Current capacity: \`${Number(currentTotalFish)}\`/\`${foundBoostList.fishBag}\``}`,
					`\u3000 ${!foundItemList.farmingTools ? `\`${prefix}shop buy tools\` - <:coin:706659001164628008> \`${farmingPrice.toLocaleString('en')}\`` : `Farming Tools - \`Owned\``}`,
					`\u3000 Seed Bag - ${!foundBoostList.seedBag ? `\`Not Owned\` - Buy farming tools to aquire` : `\`Owned\` - Current capacity: \`${Number(currentTotalSeeds)}\`/\`${foundBoostList.seedBag}\``}`,
					`\u3000 Farm Bag - ${!foundBoostList.farmBag ? `\`Not Owned\` - Buy farming tools to aquire` : `\`Owned\` - Current capacity: \`${Number(currentTotalFarm)}\`/\`${foundBoostList.farmBag}\``}`
				]);
			if (fullPrice > 0) {
				embed.setFooter(`Total Value: ${fullPrice.toLocaleString('en')}`);
			}
			message.channel.send(embed);
		}
	}

};
