/* eslint-disable no-mixed-operators */
/* eslint-disable no-inline-comments */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['upgrade', 'boosts', 'store'],
			description: 'Purchase upgrades',
			category: 'Economy'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);

		let foundItemList = JSON.parse(balance.items);
		let foundBoostList = JSON.parse(balance.boosts);
		let foundPlotList = JSON.parse(balance.farmPlot);
		let foundHarvestList = JSON.parse(balance.harvestedCrops);

		const fishingPrice = this.client.ecoPrices.fishingRod;
		const farmingPrice = this.client.ecoPrices.farmingTools;
		const cornSeedPrice = this.client.ecoPrices.cornSeed;
		const wheatSeedPrice = this.client.ecoPrices.wheatSeed;
		const potatoeSeedPrice = this.client.ecoPrices.potatoSeed;
		const tomatoeSeedprice = this.client.ecoPrices.tomatoSeed;
		const initalSeedBag = this.client.ecoPrices.seedBagFirst;
		const seedBagMax = this.client.ecoPrices.seedBagLimit;
		const initialFishBag = this.client.ecoPrices.fishBagFirst;
		const fishBagMax = this.client.ecoPrices.fishBagLimit;
		const initalFarmBag = this.client.ecoPrices.farmBagFirst;
		const farmBagMax = this.client.ecoPrices.farmBagLimit;
		const initialFarmPlot = this.client.ecoPrices.farmPlotFirst;
		const farmPlotMax = this.client.ecoPrices.farmPlotLimit;

		const { seedBagPrice } = this.client.ecoPrices;
		const { farmBagPrice } = this.client.ecoPrices;
		const { fishBagPrice } = this.client.ecoPrices;
		const { farmPlotPrice } = this.client.ecoPrices;

		if (!foundItemList) {
			foundItemList = {};
		}

		if (!foundBoostList) {
			foundBoostList = {};
		}

		if (!foundPlotList) {
			foundPlotList = [];
		}

		if (!foundHarvestList) {
			foundHarvestList = [];
		}

		let troutPrice;
		let salmonPrice;
		let swordFishPrice;
		let pufferFishPrice;
		let treasurePrice;

		let goldBarPrice;
		let cornPrice = 0;
		let wheatPrice = 0;
		let potatoesPrice = 0;
		let tomatoesPrice = 0;
		let goldNuggetPrice;
		let barleyPrice;
		let spinachPrice;
		let strawberriesPrice;
		let lettucePrice;

		if (foundItemList.trout !== undefined) troutPrice = this.client.ecoPrices.trout * Number(foundItemList.trout);
		if (foundItemList.kingSalmon !== undefined) salmonPrice = this.client.ecoPrices.kingSalmon * Number(foundItemList.kingSalmon);
		if (foundItemList.swordfish !== undefined) swordFishPrice = this.client.ecoPrices.swordfish * Number(foundItemList.swordfish);
		if (foundItemList.pufferfish !== undefined) pufferFishPrice = this.client.ecoPrices.pufferfish * Number(foundItemList.pufferfish);
		if (foundItemList.treasure !== undefined) treasurePrice = this.client.ecoPrices.treasure * Number(foundItemList.treasure);

		if (foundItemList.goldBar !== undefined) goldBarPrice = this.client.ecoPrices.goldBar * Number(foundItemList.goldBar);
		if (foundHarvestList) {
			foundHarvestList.forEach((obj) => {
				if (obj.cropType === 'corn') cornPrice += Math.floor(this.client.ecoPrices.corn * (1 - (obj.decay.toFixed(4) / 100)));
				if (obj.cropType === 'wheat') wheatPrice += Math.floor(this.client.ecoPrices.wheat * (1 - (obj.decay.toFixed(4) / 100)));
				if (obj.cropType === 'potato') potatoesPrice += Math.floor(this.client.ecoPrices.potatoes * (1 - (obj.decay.toFixed(4) / 100)));
				if (obj.cropType === 'tomato') tomatoesPrice += Math.floor(this.client.ecoPrices.tomatoes * (1 - (obj.decay.toFixed(4) / 100)));
			});
		}
		if (foundItemList.goldNugget !== undefined) goldNuggetPrice = this.client.ecoPrices.goldNugget * Number(foundItemList.goldNugget);
		if (foundItemList.barley !== undefined) barleyPrice = this.client.ecoPrices.barley * Number(foundItemList.barley);
		if (foundItemList.spinach !== undefined) spinachPrice = this.client.ecoPrices.spinach * Number(foundItemList.spinach);
		if (foundItemList.strawberries !== undefined) strawberriesPrice = this.client.ecoPrices.strawberries * Number(foundItemList.strawberries);
		if (foundItemList.lettuce !== undefined) lettucePrice = this.client.ecoPrices.lettuce * Number(foundItemList.lettuce);

		if (!args.length) {
			const embed = new MessageEmbed()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Shop**`,
					`**◎ Available Commands:**
					\u3000 \`${prefix}shop buy\`
					\u3000 \`${prefix}shop sell\`
					\u3000 \`${prefix}shop upgrade\``);
			message.channel.send({ embeds: [embed] });
			return;
		}

		console.log(typeof cornPrice);
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

		if (foundHarvestList) {
			currentTotalFarm += Number(foundHarvestList.filter(key => key.cropType === 'corn').length);
			currentTotalFarm += Number(foundHarvestList.filter(key => key.cropType === 'wheat').length);
			currentTotalFarm += Number(foundHarvestList.filter(key => key.cropType === 'potato').length);
			currentTotalFarm += Number(foundHarvestList.filter(key => key.cropType === 'tomato').length);
		}

		let currentTotalPlot = 0;

		if (foundBoostList.farmPlot) {
			currentTotalPlot += Number(foundPlotList.length);
		} else {
			currentTotalPlot += Number(0);
		}

		if (args[0] === 'upgrade') {
			if (args[1] === undefined) {
				const arr = [];
				if (foundBoostList.seedBag) {
					if (Number(foundBoostList.seedBag) < Number(seedBagMax)) {
						const upgradeSeedBag = foundBoostList.seedBag * seedBagPrice;
						arr.push(`\u3000 \`${prefix}shop upgrade seedbag\` - <:coin:706659001164628008> \`${upgradeSeedBag.toLocaleString('en')}\` Upgrade by 25, current capacity: \`${Number(currentTotalSeeds).toLocaleString('en')}\`/\`${Number(foundBoostList.seedBag).toLocaleString('en')}\``);
					}
				}

				if (foundBoostList.fishBag) {
					if (Number(foundBoostList.fishBag) < Number(fishBagMax)) {
						const upgradeFishBag = foundBoostList.fishBag * fishBagPrice;
						arr.push(`\u3000 \`${prefix}shop upgrade fishbag\` - <:coin:706659001164628008> \`${upgradeFishBag.toLocaleString('en')}\` Upgrade by 25, current capacity: \`${Number(currentTotalFish).toLocaleString('en')}\`/\`${Number(foundBoostList.fishBag).toLocaleString('en')}\``);
					}
				}

				if (foundBoostList.farmBag) {
					if (Number(foundBoostList.farmBag) < Number(farmBagMax)) {
						const upgradeFarmBag = foundBoostList.farmBag * farmBagPrice;
						arr.push(`\u3000 \`${prefix}shop upgrade farmbag\` - <:coin:706659001164628008> \`${upgradeFarmBag.toLocaleString('en')}\` Upgrade by 25, current capacity: \`${Number(currentTotalFarm).toLocaleString('en')}\`/\`${Number(foundBoostList.farmBag).toLocaleString('en')}\``);
					}
				}

				if (foundBoostList.farmPlot) {
					if (Number(foundBoostList.farmPlot) < Number(farmPlotMax)) {
						const upgradeFarmPlot = foundBoostList.farmPlot * farmPlotPrice;
						arr.push(`\u3000 \`${prefix}shop upgrade plot\` - <:coin:706659001164628008> \`${upgradeFarmPlot.toLocaleString('en')}\` Upgrade by 25, current capacity: \`${Number(currentTotalPlot).toLocaleString('en')}\`/\`${Number(foundBoostList.farmPlot).toLocaleString('en')}\``);
					}
				}

				if (!arr.length) arr.push(`\u3000 \`None\``);

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Shop - Upgrade**`,
						`**◎ Available Upgrades**
						${arr.join('\n')}`);
				message.channel.send({ embeds: [embed] });
				return;
			}

			if (args[1] === 'seed' || args[1] === 'seedbag' || args[1] === 'seedbackpack') {
				if (!foundBoostList.seedBag) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Seed Bag**`,
							`**◎ Error:** You do not own a seed bag! You will be awarded one once you purchase farming tools.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (Number(foundBoostList.seedBag) >= Number(seedBagMax)) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Seed Bag**`,
							`**◎ Error:** You have already upgraded your seed bag to the maximum level!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (balance.bank < foundBoostList.seedBag * seedBagPrice) {
					this.client.utils.messageDelete(message, 10000);

					const notEnough = foundBoostList.seedBag * seedBagPrice - Number(balance.bank);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Seed Bag**`,
							`**◎ Error:** You do not have enough <:coin:706659001164628008> in your bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString('en')}\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				balance.bank = Number(balance.bank) - foundBoostList.seedBag * seedBagPrice;
				balance.total = Number(balance.total) - foundBoostList.seedBag * seedBagPrice;

				this.client.setBalance.run(balance);

				const calc = Number(foundBoostList.seedBag) + Number(25);
				foundBoostList.seedBag = calc.toString();

				await db.prepare('UPDATE balance SET boosts = (@boosts) WHERE id = (@id);').run({
					boosts: JSON.stringify(foundBoostList),
					id: `${message.author.id}-${message.guild.id}`
				});

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setThumbnail('attachment://SeedBag.png')
					.addField(`**${this.client.user.username} - Shop - Seed Bag**`,
						`**◎ Success:** You have upgraded your seed bag, your new limit is \`${Number(foundBoostList.seedBag)}\`!`);
				message.channel.send({ embeds: [embed], files: ['./Storage/Images/Economy/SeedBag.png'] });
				return;
			}

			if (args[1] === 'fish' || args[1] === 'fishbag' || args[1] === 'fishbackpack') {
				if (!foundBoostList.fishBag) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Fish Bag**`,
							`**◎ Error:** You do not own a fish bag! You will be awarded one once you purchase a fishing rod.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (Number(foundBoostList.fishBag) >= Number(fishBagMax)) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Fish Bag**`,
							`**◎ Error:** You have already upgraded your fish bag to the maximum level!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (balance.bank < foundBoostList.fishBag * fishBagPrice) {
					this.client.utils.messageDelete(message, 10000);

					const notEnough = foundBoostList.fishBag * fishBagPrice - Number(balance.bank);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Fish Bag**`,
							`**◎ Error:** You do not have enough <:coin:706659001164628008> in your bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString('en')}\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				balance.bank = Number(balance.bank) - foundBoostList.fishBag * fishBagPrice;
				balance.total = Number(balance.total) - foundBoostList.fishBag * fishBagPrice;

				this.client.setBalance.run(balance);

				const calc = Number(foundBoostList.fishBag) + Number(25);
				foundBoostList.fishBag = calc.toString();

				await db.prepare('UPDATE balance SET boosts = (@boosts) WHERE id = (@id);').run({
					boosts: JSON.stringify(foundBoostList),
					id: `${message.author.id}-${message.guild.id}`
				});

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setThumbnail('attachment://FishBag.png')
					.addField(`**${this.client.user.username} - Shop - Fish Bag**`,
						`**◎ Success:** You have upgraded your fish bag, your new limit is \`${Number(foundBoostList.fishBag)}\`!`);
				message.channel.send({ embeds: [embed], files: ['./Storage/Images/Economy/FishBag.png'] });
				return;
			}

			if (args[1] === 'farm' || args[1] === 'farmbag' || args[1] === 'farmbackpack') {
				if (!foundBoostList.farmBag) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Farm Bag**`,
							`**◎ Error:** You do not own a farm bag! You will be awarded one once you purchase farming tools.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (Number(foundBoostList.farmBag) >= Number(farmBagMax)) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Farm Bag**`,
							`**◎ Error:** You have already upgraded your farm bag to the maximum level!!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (balance.bank < foundBoostList.farmBag * farmBagPrice) {
					this.client.utils.messageDelete(message, 10000);

					const notEnough = foundBoostList.farmBag * farmBagPrice - Number(balance.bank);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Farm Bag**`,
							`**◎ Error:** You do not have enough <:coin:706659001164628008> in your bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString('en')}\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				balance.bank = Number(balance.bank) - foundBoostList.farmBag * farmBagPrice;
				balance.total = Number(balance.total) - foundBoostList.farmBag * farmBagPrice;

				this.client.setBalance.run(balance);

				const calc = Number(foundBoostList.farmBag) + Number(25);
				foundBoostList.farmBag = calc.toString();

				await db.prepare('UPDATE balance SET boosts = (@boosts) WHERE id = (@id);').run({
					boosts: JSON.stringify(foundBoostList),
					id: `${message.author.id}-${message.guild.id}`
				});

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setThumbnail('attachment://FarmBag.png')
					.addField(`**${this.client.user.username} - Shop - Farm Bag**`,
						`**◎ Success:** You have upgraded your farm bag, your new limit is \`${Number(foundBoostList.farmBag)}\`!`);
				message.channel.send({ embeds: [embed], files: ['./Storage/Images/Economy/FarmBag.png'] });
				return;
			}

			if (args[1] === 'plot' || args[1] === 'farmplot' || args[1] === 'farmingplot') {
				if (!foundBoostList.farmPlot) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Farm Plot**`,
							`**◎ Error:** You do not own a farm plot! You will be awarded one once you purchase farming tools.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (Number(foundBoostList.farmPlot) >= Number(farmPlotMax)) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Farm Plot**`,
							`**◎ Error:** You have already upgraded your farm plot to the maximum level!!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (balance.bank < foundBoostList.farmPlot * farmPlotPrice) {
					this.client.utils.messageDelete(message, 10000);

					const notEnough = foundBoostList.farmPlot * farmPlotPrice - Number(balance.bank);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Farm Plot**`,
							`**◎ Error:** You do not have enough <:coin:706659001164628008> in your bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString('en')}\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				balance.bank = Number(balance.bank) - foundBoostList.farmPlot * farmPlotPrice;
				balance.total = Number(balance.total) - foundBoostList.farmPlot * farmPlotPrice;

				this.client.setBalance.run(balance);

				const calc = Number(foundBoostList.farmPlot) + Number(25);
				foundBoostList.farmPlot = calc.toString();

				await db.prepare('UPDATE balance SET boosts = (@boosts) WHERE id = (@id);').run({
					boosts: JSON.stringify(foundBoostList),
					id: `${message.author.id}-${message.guild.id}`
				});

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setThumbnail('attachment://FarmPlot.png')
					.addField(`**${this.client.user.username} - Shop - Farm Plot**`,
						`**◎ Success:** You have upgraded your farm plot, your new limit is \`${Number(foundBoostList.farmPlot)}\`!`);
				message.channel.send({ embeds: [embed], files: ['./Storage/Images/Economy/FarmPlot.png'] });
				return;
			}
		}

		if (args[0] === 'buy') {
			if (args[1] === undefined) {
				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Shop - Buy**`,
						`**◎ Farming Seeds: (Amount optional)**
						\u3000 \`${prefix}shop buy corn [amount]\` - 10 Seeds per pack - ${!foundItemList.cornSeeds ? `<:coin:706659001164628008> \`${cornSeedPrice.toLocaleString('en')}\`` : `<:coin:706659001164628008> \`${cornSeedPrice.toLocaleString('en')}\` - \`Owned ${foundItemList.cornSeeds.toLocaleString('en')}\``}
						\u3000 \`${prefix}shop buy wheat [amount]\` - 10 Seeds per pack - ${!foundItemList.wheatSeeds ? `<:coin:706659001164628008> \`${wheatSeedPrice.toLocaleString('en')}\`` : `<:coin:706659001164628008> \`${wheatSeedPrice.toLocaleString('en')}\`- \`Owned ${foundItemList.wheatSeeds.toLocaleString('en')}\``}
						\u3000 \`${prefix}shop buy potato [amount]\` - 10 Seeds per pack - ${!foundItemList.potatoSeeds ? `<:coin:706659001164628008> \`${potatoeSeedPrice.toLocaleString('en')}\`` : `<:coin:706659001164628008> \`${potatoeSeedPrice.toLocaleString('en')}\`- \`Owned ${foundItemList.potatoSeeds.toLocaleString('en')}\``}
						\u3000 \`${prefix}shop buy tomato [amount]\` - 10 Seeds per pack - ${!foundItemList.tomatoSeeds ? `<:coin:706659001164628008> \`${tomatoeSeedprice.toLocaleString('en')}\`` : `<:coin:706659001164628008> \`${tomatoeSeedprice.toLocaleString('en')}\`- \`Owned ${foundItemList.tomatoSeeds.toLocaleString('en')}\``}
						\u200b
						**◎ Permanent Items:**
						\u3000 ${!foundItemList.fishingRod ? `\`${prefix}shop buy rod\` - <:coin:706659001164628008> \`${fishingPrice.toLocaleString('en')}\`` : `Fishing Rod - \`Owned\``}
						\u3000 Fish Bag - ${!foundBoostList.fishBag ? `\`Not Owned\` - Buy fishing rod to aquire` : `\`Owned\` - Current capacity: \`${Number(currentTotalFish)}\`/\`${foundBoostList.fishBag}\``}
						\u3000 ${!foundItemList.farmingTools ? `\`${prefix}shop buy tools\` - <:coin:706659001164628008> \`${farmingPrice.toLocaleString('en')}\`` : `Farming Tools - \`Owned\``}
						\u3000 Seed Bag - ${!foundBoostList.seedBag ? `\`Not Owned\` - Buy farming tools to aquire` : `\`Owned\` - Current capacity: \`${Number(currentTotalSeeds)}\`/\`${foundBoostList.seedBag}\``}
						\u3000 Farm Bag - ${!foundBoostList.farmBag ? `\`Not Owned\` - Buy farming tools to aquire` : `\`Owned\` - Current capacity: \`${Number(currentTotalFarm)}\`/\`${foundBoostList.farmBag}\``}
						\u3000 Farm Plot - ${!foundBoostList.farmPlot ? `\`Not Owned\` - Buy farming tools to aquire` : `\`Owned\` - Current capacity: \`${Number(currentTotalPlot)}\`/\`${foundBoostList.farmPlot}\``}`);
				message.channel.send({ embeds: [embed] });
				return;
			}

			if (args[1] === 'corn' || args[1] === 'wheat' || args[1] === 'potato' || args[1] === 'tomato') {
				if (!foundItemList.farmingTools) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Seeds**`,
							`**◎ Error:** You must own farming tools before you can buy seeds!\nYou can buy them with \`${prefix}shop buy tools\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
			}

			if (args[1] === 'corn') {
				const cornAmt = args[2] ? Number(args[2]) : 1;

				if (cornAmt <= 0) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Corn Seeds**`,
							`**◎ Error:** Please enter a valid number.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (isNaN(cornAmt)) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Corn Seeds**`,
							`**◎ Error:** Please enter a valid number.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				let cornTot = 0;
				cornTot += Number(cornSeedPrice) * Number(cornAmt);

				if (balance.bank < cornTot) {
					this.client.utils.messageDelete(message, 10000);

					const notEnough = Number(cornTot) - Number(balance.bank);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Corn Seeds**`,
							`**◎ Error:** You do not have enough <:coin:706659001164628008> in your bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString('en')}\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				balance.bank = Number(balance.bank) - Number(cornTot);
				balance.total = Number(balance.total) - Number(cornTot);
				this.client.setBalance.run(balance);

				let calc = 0;
				if (foundItemList.cornSeeds) {
					calc = Number(foundItemList.cornSeeds) + Number(cornAmt) * 10;
				} else {
					calc = Number(cornAmt) * 10;
				}

				if (Number(currentTotalSeeds) + Number(cornAmt) * 10 > Number(foundBoostList.seedBag)) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Backpack Limit**`,
							`**◎ Error:** You do not have enough space in your seed backpack! You backpack is currently at \`${currentTotalSeeds}\`/\`${foundBoostList.seedBag}\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				foundItemList.cornSeeds = Number(calc).toString();

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setThumbnail('attachment://CornSeeds.png')
					.addField(`**${this.client.user.username} - Shop - Corn Seeds**`,
						`**◎ Success:** You have bought a pack of Corn Seeds.\nYou now have \`${calc}\` total Corn seeds.\n\nYour current backpack capacity is at \`${Number(currentTotalSeeds) + Number(cornAmt) * 10}\`/\`${foundBoostList.seedBag}\``);
				message.channel.send({ embeds: [embed], files: ['./Storage/Images/Economy/CornSeeds.png'] });

				await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
					items: JSON.stringify(foundItemList),
					id: `${message.author.id}-${message.guild.id}`
				});
				return;
			}

			if (args[1] === 'wheat') {
				const wheatAmt = args[2] ? Number(args[2]) : 1;

				if (wheatAmt <= 0) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Wheat Seeds**`,
							`**◎ Error:** Please enter a valid number.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (isNaN(wheatAmt)) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Wheat Seeds**`,
							`**◎ Error:** Please enter a valid number.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				let wheatTot = 0;
				wheatTot += Number(wheatSeedPrice) * Number(wheatAmt);

				if (balance.bank < wheatTot) {
					this.client.utils.messageDelete(message, 10000);

					const notEnough = Number(wheatTot) - Number(balance.bank);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Wheat Seeds**`,
							`**◎ Error:** You do not have enough <:coin:706659001164628008> in your bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString('en')}\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				balance.bank = Number(balance.bank) - Number(wheatTot);
				balance.total = Number(balance.total) - Number(wheatTot);
				this.client.setBalance.run(balance);

				let calc = 0;
				if (foundItemList.wheatSeeds) {
					calc = Number(foundItemList.wheatSeeds) + Number(wheatAmt) * 10;
				} else {
					calc = Number(wheatAmt) * 10;
				}

				if (Number(currentTotalSeeds) + Number(wheatAmt) * 10 > Number(foundBoostList.seedBag)) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Backpack Limit**`,
							`**◎ Error:** You do not have enough space in your seed backpack! You backpack is currently at \`${currentTotalSeeds}\`/\`${foundBoostList.seedBag}\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				foundItemList.wheatSeeds = Number(calc).toString();

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setThumbnail('attachment://WheatSeeds.png')
					.addField(`**${this.client.user.username} - Shop - Wheat Seeds**`,
						`**◎ Success:** You have bought a pack of Wheat Seeds.\nYou now have \`${calc}\` total Wheat seeds.\n\nYour current backpack capacity is at \`${Number(currentTotalSeeds) + Number(wheatAmt) * 10}\`/\`${foundBoostList.seedBag}\``);
				message.channel.send({ embeds: [embed], files: ['./Storage/Images/Economy/WheatSeeds.png'] });

				await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
					items: JSON.stringify(foundItemList),
					id: `${message.author.id}-${message.guild.id}`
				});
				return;
			}

			if (args[1] === 'potato') {
				const potatoeAmt = args[2] ? Number(args[2]) : 1;

				if (potatoeAmt <= 0) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Potato Seeds**`,
							`**◎ Error:** Please enter a valid number.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (isNaN(potatoeAmt)) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Potato Seeds**`,
							`**◎ Error:** Please enter a valid number.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				let potatoeTot = 0;
				potatoeTot += Number(potatoeSeedPrice) * Number(potatoeAmt);

				if (balance.bank < potatoeTot) {
					this.client.utils.messageDelete(message, 10000);

					const notEnough = Number(potatoeTot) - Number(balance.bank);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Potato Seeds**`,
							`**◎ Error:** You do not have enough <:coin:706659001164628008> in your bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString('en')}\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				balance.bank = Number(balance.bank) - Number(potatoeTot);
				balance.total = Number(balance.total) - Number(potatoeTot);
				this.client.setBalance.run(balance);

				let calc = 0;
				if (foundItemList.potatoSeeds) {
					calc = Number(foundItemList.potatoSeeds) + Number(potatoeAmt) * 10;
				} else {
					calc = Number(potatoeAmt) * 10;
				}

				if (Number(currentTotalSeeds) + Number(potatoeAmt) * 10 > Number(foundBoostList.seedBag)) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Backpack Limit**`,
							`**◎ Error:** You do not have enough space in your seed backpack! You backpack is currently at \`${currentTotalSeeds}\`/\`${foundBoostList.seedBag}\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				foundItemList.potatoSeeds = Number(calc).toString();

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setThumbnail('attachment://Potatoe.png')
					.addField(`**${this.client.user.username} - Shop - Potato Seeds**`,
						`**◎ Success:** You have bought a pack of Potato Seeds.\nYou now have \`${calc}\` total Potato seeds.\n\nYour current backpack capacity is at \`${Number(currentTotalSeeds) + Number(potatoeAmt) * 10}\`/\`${foundBoostList.seedBag}\``);
				message.channel.send({ embeds: [embed], files: ['./Storage/Images/Economy/Potatoe.png'] });

				await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
					items: JSON.stringify(foundItemList),
					id: `${message.author.id}-${message.guild.id}`
				});
				return;
			}

			if (args[1] === 'tomato') {
				const tomatoeAmt = args[2] ? Number(args[2]) : 1;

				if (tomatoeAmt <= 0) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Tomato Seeds**`,
							`**◎ Error:** Please enter a valid number.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (isNaN(tomatoeAmt)) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Tomato Seeds**`,
							`**◎ Error:** Please enter a valid number.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				let tomatoeTot = 0;
				tomatoeTot += Number(tomatoeSeedprice) * Number(tomatoeAmt);

				if (balance.bank < tomatoeTot) {
					this.client.utils.messageDelete(message, 10000);

					const notEnough = Number(tomatoeTot) - Number(balance.bank);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Tomato Seeds**`,
							`**◎ Error:** You do not have enough <:coin:706659001164628008> in your bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString('en')}\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				balance.bank = Number(balance.bank) - Number(tomatoeTot);
				balance.total = Number(balance.total) - Number(tomatoeTot);
				this.client.setBalance.run(balance);

				let calc = 0;
				if (foundItemList.tomatoSeeds) {
					calc = Number(foundItemList.tomatoSeeds) + Number(tomatoeAmt) * 10;
				} else {
					calc = Number(tomatoeAmt) * 10;
				}

				if (Number(currentTotalSeeds) + Number(tomatoeAmt) * 10 > Number(foundBoostList.seedBag)) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Backpack Limit**`,
							`**◎ Error:** You do not have enough space in your seed backpack! You backpack is currently at \`${currentTotalSeeds}\`/\`${foundBoostList.seedBag}\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				foundItemList.tomatoSeeds = Number(calc).toString();

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setThumbnail('attachment://Tomatoe.png')
					.addField(`**${this.client.user.username} - Shop - Tomato Seeds**`,
						`**◎ Success:** You have bought a pack of Tomato Seeds.\nYou now have \`${calc}\` total Tomato seeds.\n\nYour current backpack capacity is at \`${Number(currentTotalSeeds) + Number(tomatoeAmt) * 10}\`/\`${foundBoostList.seedBag}\``);
				message.channel.send({ embeds: [embed], files: ['./Storage/Images/Economy/Tomatoes.png'] });

				await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
					items: JSON.stringify(foundItemList),
					id: `${message.author.id}-${message.guild.id}`
				});
				return;
			}

			if (args[1] === 'rod' || args[1] === 'fishingrod') {
				if (foundItemList.fishingRod) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Fishing Rod**`,
							`**◎ Error:** You already own a fishing rod!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (balance.bank < fishingPrice) {
					this.client.utils.messageDelete(message, 10000);

					const notEnough = Number(fishingPrice) - Number(balance.bank);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Fishing Rod**`,
							`**◎ Error:** You do not have enough <:coin:706659001164628008> in your bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString('en')}\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				balance.bank = Number(balance.bank) - Number(fishingPrice);
				balance.total = Number(balance.total) - Number(fishingPrice);
				this.client.setBalance.run(balance);

				foundItemList.fishingRod = Number(1).toString();
				foundBoostList.fishBag = Number(initalSeedBag).toString();

				await db.prepare('UPDATE balance SET items = (@items), boosts = (@boosts) WHERE id = (@id);').run({
					items: JSON.stringify(foundItemList),
					boosts: JSON.stringify(foundBoostList),
					id: `${message.author.id}-${message.guild.id}`
				});

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setThumbnail('attachment://FishingRod.png')
					.addField(`**${this.client.user.username} - Shop - Fishing Rod**`,
						`**◎ Success:** You have bought a fishing rod!\nYou have also been awarded a starter Fish bag, it's capacity is \`${initialFishBag}\``);
				message.channel.send({ embeds: [embed], files: ['./Storage/Images/Economy/FishingRod.png'] });
				return;
			}

			if (args[1] === 'farmingtools' || args[1] === 'tools') {
				if (foundItemList.farmingTools) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Farming Tools**`,
							`**◎ Error:** You already own Farming Tools!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (balance.bank < farmingPrice) {
					this.client.utils.messageDelete(message, 10000);

					const notEnough = Number(farmingPrice) - Number(balance.bank);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Farming Tools**`,
							`**◎ Error:** You do not have enough <:coin:706659001164628008> in your bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString('en')}\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (balance.farmcool) {
					await db.prepare('UPDATE balance SET farmcool = (@farmcool) WHERE id = (@id);').run({
						farmcool: null,
						id: `${message.author.id}-${message.guild.id}`
					});
				}

				let fullPrice = 0;

				if (foundItemList.barley) fullPrice += Number(foundItemList.barley) * this.client.ecoPrices.barley;
				if (foundItemList.spinach) fullPrice += Number(foundItemList.spinach) * this.client.ecoPrices.spinach;
				if (foundItemList.strawberries) fullPrice += Number(foundItemList.strawberries) * this.client.ecoPrices.strawberries;
				if (foundItemList.lettuce) fullPrice += Number(foundItemList.lettuce) * this.client.ecoPrices.lettuce;

				balance.bank = Number(balance.bank) - Number(farmingPrice) + fullPrice;
				balance.total = Number(balance.total) - Number(farmingPrice) + fullPrice;
				this.client.setBalance.run(balance);

				foundItemList.farmingTools = Number(1).toString();
				foundBoostList.farmBag = Number(initalFarmBag).toString();
				foundBoostList.seedBag = Number(initalSeedBag).toString();
				foundBoostList.farmPlot = Number(initialFarmPlot).toString();

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setThumbnail('attachment://FarmingTool.png')
					.addField(`**${this.client.user.username} - Shop - Farming Tools**`,
						`**◎ Success:** You have bought Farming Tools${foundItemList.barley || foundItemList.spinach || foundItemList.strawberries || foundItemList.lettuce ? `.\nYou had some old crops, I have sold them for you and credited <:coin:706659001164628008> \`${fullPrice.toLocaleString('en')}\` to your account.` : `!`}\n\nYou have also been awarded a starter Farm bag, Plot and Seed bag\nFarm capacity: \`${initalFarmBag}\` Seed capacity: \`${initalSeedBag}\` Plot Capacity: \`${initialFarmPlot}\``);
				message.channel.send({ embeds: [embed], files: ['./Storage/Images/Economy/FarmingTool.png'] });

				if (foundItemList.barley) delete foundItemList.barley;
				if (foundItemList.spinach) delete foundItemList.spinach;
				if (foundItemList.strawberries) delete foundItemList.strawberries;
				if (foundItemList.lettuce) delete foundItemList.lettuce;

				await db.prepare('UPDATE balance SET items = (@items), boosts = (@boosts) WHERE id = (@id);').run({
					items: JSON.stringify(foundItemList),
					boosts: JSON.stringify(foundBoostList),
					id: `${message.author.id}-${message.guild.id}`
				});
				return;
			}
		}

		if (args[0] === 'sell') {
			if (args[1] === undefined) {
				let fields;

				if (!foundItemList.farmingTools) {
					fields = [
						`\u3000 Barley: Own ${foundItemList.barley === undefined ? `\`0\`` : `\`${foundItemList.barley}\` - <:coin:706659001164628008> \`${barleyPrice.toLocaleString('en')}\``}`,
						`\u3000 Spinach: Own ${foundItemList.spinach === undefined ? `\`0\`` : `\`${foundItemList.spinach}\` - <:coin:706659001164628008> \`${spinachPrice.toLocaleString('en')}\``}`,
						`\u3000 Strawberries: Own ${foundItemList.strawberries === undefined ? `\`0\`` : `\`${foundItemList.strawberries} \`- <:coin:706659001164628008> \`${strawberriesPrice.toLocaleString('en')}\``}`,
						`\u3000 Lettuce: Own ${foundItemList.lettuce === undefined ? `\`0\`` : `\`${foundItemList.lettuce}\` - <:coin:706659001164628008> \`${lettucePrice.toLocaleString('en')}\``}`
					];
				} else {
					fields = [
						`\u3000 Corn: Own ${!foundHarvestList.filter(key => key.cropType === 'corn').length ? `\`0\`` : `\`${foundHarvestList.filter(key => key.cropType === 'corn').length}\` - <:coin:706659001164628008> \`${cornPrice.toLocaleString('en')}\``}`,
						`\u3000 Wheat: Own ${!foundHarvestList.filter(key => key.cropType === 'wheat').length ? `\`0\`` : `\`${foundHarvestList.filter(key => key.cropType === 'wheat').length}\` - <:coin:706659001164628008> \`${wheatPrice.toLocaleString('en')}\``}`,
						`\u3000 Potatoes: Own ${!foundHarvestList.filter(key => key.cropType === 'potato').length ? `\`0\`` : `\`${foundHarvestList.filter(key => key.cropType === 'potato').length}\` - <:coin:706659001164628008> \`${potatoesPrice.toLocaleString('en')}\``}`,
						`\u3000 Tomatoes: Own ${!foundHarvestList.filter(key => key.cropType === 'tomato').length ? `\`0\`` : `\`${foundHarvestList.filter(key => key.cropType === 'tomato').length}\` - <:coin:706659001164628008> \`${tomatoesPrice.toLocaleString('en')}\``}`
					];

					if (foundItemList.barley || foundItemList.spinach || foundItemList.strawberries || foundItemList.lettuce) {
						const lowCrops = [
							`\u3000 Barley: Own ${foundItemList.barley === undefined ? `\`0\`` : `\`${foundItemList.barley}\` - <:coin:706659001164628008> \`${barleyPrice.toLocaleString('en')}\``}`,
							`\u3000 Spinach: Own ${foundItemList.spinach === undefined ? `\`0\`` : `\`${foundItemList.spinach}\` - <:coin:706659001164628008> \`${spinachPrice.toLocaleString('en')}\``}`,
							`\u3000 Strawberries: Own ${foundItemList.strawberries === undefined ? `\`0\`` : `\`${foundItemList.strawberries} \`- <:coin:706659001164628008> \`${strawberriesPrice.toLocaleString('en')}\``}`,
							`\u3000 Lettuce: Own ${foundItemList.lettuce === undefined ? `\`0\`` : `\`${foundItemList.lettuce}\` - <:coin:706659001164628008> \`${lettucePrice.toLocaleString('en')}\``}`
						];
						fields.push(lowCrops.join('\n'));
					}
				}

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Items**`,
						`**◎ Fish:**
						\u3000 Trout: Own ${foundItemList.trout === undefined ? `\`0\`` : `\`${foundItemList.trout}\` - <:coin:706659001164628008> \`${troutPrice.toLocaleString('en')}\``}
						\u3000 King Salmon: Own ${foundItemList.kingSalmon === undefined ? `\`0\`` : `\`${foundItemList.kingSalmon}\` - <:coin:706659001164628008> \`${salmonPrice.toLocaleString('en')}\``}
						\u3000 Swordfish: Own ${foundItemList.swordfish === undefined ? `\`0\`` : `\`${foundItemList.swordfish} \`- <:coin:706659001164628008> \`${swordFishPrice.toLocaleString('en')}\``}
						\u3000 Pufferfish: Own ${foundItemList.pufferfish === undefined ? `\`0\`` : `\`${foundItemList.pufferfish}\` - <:coin:706659001164628008> \`${pufferFishPrice.toLocaleString('en')}\``}
						\u200b
						**◎ Crops:**
						${fields.join('\n')}
						\u200b
						**◎ Treasure:**
						\u3000 Treasure Chest: Own ${foundItemList.treasure === undefined ? `\`0\`` : `${foundItemList.treasure} - <:coin:706659001164628008> \`${treasurePrice.toLocaleString('en')}\``}
						\u3000 Gold Bar: Own ${foundItemList.goldBar === undefined ? `\`0\`` : `\`${foundItemList.goldBar}\` - <:coin:706659001164628008> \`${goldBarPrice.toLocaleString('en')}\``}
						\u3000 Gold Nugget: Own ${foundItemList.goldNugget === undefined ? `\`0\`` : `\`${foundItemList.goldNugget}\` - <:coin:706659001164628008> \`${goldNuggetPrice.toLocaleString('en')}\``}
						\u200b
						**◎ Available Commands:**
						\u3000 \`${prefix}shop sell all\`
						\u3000 \`${prefix}shop sell fish\`
						\u3000 \`${prefix}shop sell farm\`
						\u3000 \`${prefix}shop sell treasure\``);
				message.channel.send({ embeds: [embed] });
				return;
			}

			if (args[1] === 'all') {
				if (!foundItemList.lettuce && !foundItemList.strawberries && !foundItemList.spinach && !foundItemList.barley && !foundPlotList.tomato && !foundPlotList.potato && !foundPlotList.wheat && !foundPlotList.corn && !foundItemList.trout && !foundItemList.kingSalmon && !foundItemList.swordfish && !foundItemList.pufferfish && !foundItemList.treasure && !foundItemList.goldBar && !foundItemList.goldNugget) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Sell All**`,
							`**◎ Error:** You do not have anything to sell!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				let fullPrice = 0;
				let itemCount = 0;

				if (foundItemList.lettuce) fullPrice += Number(foundItemList.lettuce) * this.client.ecoPrices.lettuce;
				if (foundItemList.strawberries) fullPrice += Number(foundItemList.strawberries) * this.client.ecoPrices.strawberries;
				if (foundItemList.spinach) fullPrice += Number(foundItemList.spinach) * this.client.ecoPrices.spinach;
				if (foundItemList.barley)fullPrice += Number(foundItemList.barley) * this.client.ecoPrices.barley;
				if (foundPlotList.tomato) fullPrice += Number(foundPlotList.tomato) * this.client.ecoPrices.tomatoes;
				if (foundPlotList.potato) fullPrice += Number(foundPlotList.potato) * this.client.ecoPrices.potatoes;
				if (foundPlotList.wheat) fullPrice += Number(foundPlotList.wheat) * this.client.ecoPrices.wheat;
				if (foundPlotList.corn)fullPrice += Number(foundPlotList.corn) * this.client.ecoPrices.corn;
				if (foundItemList.trout) fullPrice += Number(foundItemList.trout) * this.client.ecoPrices.trout;
				if (foundItemList.kingSalmon) fullPrice += Number(foundItemList.kingSalmon) * this.client.ecoPrices.kingSalmon;
				if (foundItemList.swordfish) fullPrice += Number(foundItemList.swordfish) * this.client.ecoPrices.swordfish;
				if (foundItemList.pufferfish)fullPrice += Number(foundItemList.pufferfish) * this.client.ecoPrices.pufferfish;
				if (foundItemList.treasure) fullPrice += Number(foundItemList.treasure) * this.client.ecoPrices.treasure;
				if (foundItemList.goldBar) fullPrice += Number(foundItemList.goldBar) * this.client.ecoPrices.goldBar;
				if (foundItemList.goldNugget) fullPrice += Number(foundItemList.goldNugget) * this.client.ecoPrices.goldNugget;


				if (foundItemList.treasure) itemCount += Number(foundItemList.treasure);
				if (foundItemList.trout) itemCount += Number(foundItemList.trout);
				if (foundItemList.kingSalmon) itemCount += Number(foundItemList.kingSalmon);
				if (foundItemList.swordfish) itemCount += Number(foundItemList.swordfish);
				if (foundItemList.pufferfish) itemCount += Number(foundItemList.pufferfish);
				if (foundItemList.lettuce) itemCount += Number(foundItemList.lettuce);
				if (foundItemList.strawberries) itemCount += Number(foundItemList.strawberries);
				if (foundItemList.spinach) itemCount += Number(foundItemList.spinach);
				if (foundItemList.barley) itemCount += Number(foundItemList.barley);
				if (foundPlotList.tomato) itemCount += Number(foundPlotList.tomato);
				if (foundPlotList.potato) itemCount += Number(foundPlotList.potato);
				if (foundPlotList.wheat) itemCount += Number(foundPlotList.wheat);
				if (foundPlotList.corn) itemCount += Number(foundPlotList.corn);
				if (foundItemList.goldBar) itemCount += Number(foundItemList.goldBar);
				if (foundItemList.goldNugget) itemCount += Number(foundItemList.goldNugget);

				const totalAdd = balance.total + fullPrice;

				balance.bank += fullPrice;
				balance.total = totalAdd;
				this.client.setBalance.run(balance);

				if (foundItemList.treasure) delete foundItemList.treasure;
				if (foundItemList.trout) delete foundItemList.trout;
				if (foundItemList.kingSalmon) delete foundItemList.kingSalmon;
				if (foundItemList.swordfish) delete foundItemList.swordfish;
				if (foundItemList.pufferfish) delete foundItemList.pufferfish;
				if (foundItemList.goldBar) delete foundItemList.goldBar;
				if (foundItemList.goldNugget) delete foundItemList.goldNugget;
				if (foundItemList.barley) delete foundItemList.barley;
				if (foundItemList.spinach) delete foundItemList.spinach;
				if (foundItemList.strawberries) delete foundItemList.strawberries;
				if (foundItemList.lettuce) delete foundItemList.lettuce;
				if (foundPlotList.tomato) delete foundPlotList.tomato;
				if (foundPlotList.potato) delete foundPlotList.potato;
				if (foundPlotList.wheat) delete foundPlotList.wheat;
				if (foundPlotList.corn) delete foundPlotList.corn;

				await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
					items: JSON.stringify(foundItemList),
					id: `${message.author.id}-${message.guild.id}`
				});

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Shop - Sell All**`,
						`**◎ Success:** You have sold \`${itemCount}\` items. You have received <:coin:706659001164628008> \`${fullPrice.toLocaleString('en')}\`\nYour new total is: <:coin:706659001164628008> \`${totalAdd.toLocaleString('en')}\``);
				message.channel.send({ embeds: [embed] });
				return;
			}

			if (args[1] === 'fish') {
				if (foundItemList.trout === undefined && foundItemList.kingSalmon === undefined && foundItemList.swordfish === undefined && foundItemList.pufferfish === undefined && foundItemList.treasure === undefined) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Sell Fish**`,
							`**◎ Error:** You do not have any fish!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				let fullPrice = 0;
				let fishCount = 0;

				if (foundItemList.trout) fullPrice += Number(foundItemList.trout) * this.client.ecoPrices.trout;
				if (foundItemList.kingSalmon) fullPrice += Number(foundItemList.kingSalmon) * this.client.ecoPrices.kingSalmon;
				if (foundItemList.swordfish) fullPrice += Number(foundItemList.swordfish) * this.client.ecoPrices.swordfish;
				if (foundItemList.pufferfish)fullPrice += Number(foundItemList.pufferfish) * this.client.ecoPrices.pufferfish;

				if (foundItemList.trout) fishCount += Number(foundItemList.trout);
				if (foundItemList.kingSalmon) fishCount += Number(foundItemList.kingSalmon);
				if (foundItemList.swordfish) fishCount += Number(foundItemList.swordfish);
				if (foundItemList.pufferfish) fishCount += Number(foundItemList.pufferfish);

				// if (foundItemList.treasure) i += Number(foundItemList.treasure);

				const totalAdd = balance.total + fullPrice;

				balance.bank += fullPrice;
				balance.total = totalAdd;
				this.client.setBalance.run(balance);

				if (foundItemList.trout) delete foundItemList.trout;
				if (foundItemList.kingSalmon) delete foundItemList.kingSalmon;
				if (foundItemList.swordfish) delete foundItemList.swordfish;
				if (foundItemList.pufferfish) delete foundItemList.pufferfish;

				await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
					items: JSON.stringify(foundItemList),
					id: `${message.author.id}-${message.guild.id}`
				});

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Shop - Sell Fish**`,
						`**◎ Success:** You have sold \`${fishCount}\` fish. You have received <:coin:706659001164628008> \`${fullPrice.toLocaleString('en')}\`\nYour new total is: <:coin:706659001164628008> \`${totalAdd.toLocaleString('en')}\``);
				message.channel.send({ embeds: [embed] });
				return;
			}

			if (args[1] === 'treasure') {
				if (foundItemList.treasure === undefined) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Sell Treasure**`,
							`**◎ Error:** You do not have any treasure!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				let fullPrice = 0;
				let treasureCount = 0;

				if (foundItemList.treasure) fullPrice += Number(foundItemList.treasure) * this.client.ecoPrices.treasure;
				if (foundItemList.goldBar) fullPrice += Number(foundItemList.treasure) * this.client.ecoPrices.goldBar;
				if (foundItemList.goldNugget) fullPrice += Number(foundItemList.goldNugget) * this.client.ecoPrices.goldNugget;

				if (foundItemList.treasure) treasureCount += Number(foundItemList.treasure);
				if (foundItemList.goldBar) treasureCount += Number(foundItemList.goldBar);
				if (foundItemList.goldNugget) treasureCount += Number(foundItemList.goldNugget);

				const totalAdd = balance.total + fullPrice;

				balance.bank += fullPrice;
				balance.total = totalAdd;
				this.client.setBalance.run(balance);

				if (foundItemList.treasure) delete foundItemList.treasure;
				if (foundItemList.goldBar) delete foundItemList.goldBar;
				if (foundItemList.goldNugget) delete foundItemList.goldNugget;

				await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
					items: JSON.stringify(foundItemList),
					id: `${message.author.id}-${message.guild.id}`
				});

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Shop - Sell Treasure**`,
						`**◎ Success:** You have sold \`${treasureCount}\` treasure. You have received <:coin:706659001164628008> \`${fullPrice.toLocaleString('en')}\`\nYour new total is: <:coin:706659001164628008> \`${totalAdd.toLocaleString('en')}\``);
				message.channel.send({ embeds: [embed] });
				return;
			}

			if (args[1] === 'farm' || args[1] === 'crops') {
				if (!foundItemList.lettuce && !foundItemList.strawberries && !foundItemList.spinach && !foundItemList.barley && !foundPlotList.tomato && !foundPlotList.potato && !foundPlotList.wheat && !foundPlotList.corn) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Sell Farm**`,
							`**◎ Error:** You do not have any farming produce!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				let fullPrice = 0;
				let itemCount = 0;

				if (foundItemList.lettuce) fullPrice += Number(foundItemList.lettuce) * this.client.ecoPrices.lettuce;
				if (foundItemList.strawberries) fullPrice += Number(foundItemList.strawberries) * this.client.ecoPrices.strawberries;
				if (foundItemList.spinach) fullPrice += Number(foundItemList.spinach) * this.client.ecoPrices.spinach;
				if (foundItemList.barley)fullPrice += Number(foundItemList.barley) * this.client.ecoPrices.barley;

				if (foundPlotList.tomato) fullPrice += Number(foundPlotList.tomato) * this.client.ecoPrices.tomatoes;
				if (foundPlotList.potato) fullPrice += Number(foundPlotList.potato) * this.client.ecoPrices.potatoes;
				if (foundPlotList.wheat) fullPrice += Number(foundPlotList.wheat) * this.client.ecoPrices.wheat;
				if (foundPlotList.corn)fullPrice += Number(foundPlotList.corn) * this.client.ecoPrices.corn;


				if (foundItemList.lettuce) itemCount += Number(foundItemList.lettuce);
				if (foundItemList.strawberries) itemCount += Number(foundItemList.strawberries);
				if (foundItemList.spinach) itemCount += Number(foundItemList.spinach);
				if (foundItemList.barley) itemCount += Number(foundItemList.barley);

				if (foundPlotList.tomato) itemCount += Number(foundPlotList.tomato);
				if (foundPlotList.potato) itemCount += Number(foundPlotList.potato);
				if (foundPlotList.wheat) itemCount += Number(foundPlotList.wheat);
				if (foundPlotList.corn) itemCount += Number(foundPlotList.corn);

				const totalAdd = balance.total + fullPrice;

				balance.bank += fullPrice;
				balance.total = totalAdd;
				this.client.setBalance.run(balance);

				if (foundItemList.barley) delete foundItemList.barley;
				if (foundItemList.spinach) delete foundItemList.spinach;
				if (foundItemList.strawberries) delete foundItemList.strawberries;
				if (foundItemList.lettuce) delete foundItemList.lettuce;

				if (foundPlotList.tomato) delete foundPlotList.tomato;
				if (foundPlotList.potato) delete foundPlotList.potato;
				if (foundPlotList.wheat) delete foundPlotList.wheat;
				if (foundPlotList.corn) delete foundPlotList.corn;

				await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
					items: JSON.stringify(foundItemList),
					id: `${message.author.id}-${message.guild.id}`
				});

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Shop - Sell Farm**`,
						`**◎ Success:** You have sold \`${itemCount}\` farm products. You have received <:coin:706659001164628008> \`${fullPrice.toLocaleString('en')}\`\nYour new total is: <:coin:706659001164628008> \`${totalAdd.toLocaleString('en')}\``);
				message.channel.send({ embeds: [embed] });
				return;
			}
		}
	}

};
