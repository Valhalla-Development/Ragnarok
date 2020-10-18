/* eslint-disable no-mixed-operators */
/* eslint-disable no-inline-comments */
const Command = require('../../Structures/Command');
const { MessageEmbed, MessageAttachment } = require('discord.js');
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

		const fishingPrice = this.client.ecoPrices.fishingRod;
		const farmingPrice = this.client.ecoPrices.farmingTools;

		if (!foundItemList) {
			foundItemList = {};
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

		if (foundItemList.trout !== undefined) troutPrice = this.client.ecoPrices.trout * Number(foundItemList.trout);
		if (foundItemList.kingSalmon !== undefined) salmonPrice = this.client.ecoPrices.kingSalmon * Number(foundItemList.kingSalmon);
		if (foundItemList.swordfish !== undefined) swordFishPrice = this.client.ecoPrices.swordfish * Number(foundItemList.swordfish);
		if (foundItemList.pufferfish !== undefined) pufferFishPrice = this.client.ecoPrices.pufferfish * Number(foundItemList.pufferfish);
		if (foundItemList.treasure !== undefined) treasurePrice = this.client.ecoPrices.treasure * Number(foundItemList.treasure);

		if (foundItemList.goldBar !== undefined) goldBarPrice = this.client.ecoPrices.goldBar * Number(foundItemList.goldBar);
		if (foundItemList.corn !== undefined) cornPrice = this.client.ecoPrices.corn * Number(foundItemList.corn);
		if (foundItemList.wheat !== undefined) wheatPrice = this.client.ecoPrices.wheat * Number(foundItemList.wheat);
		if (foundItemList.potatoes !== undefined) potatoesPrice = this.client.ecoPrices.potatoes * Number(foundItemList.potatoes);
		if (foundItemList.tomatoes !== undefined) tomatoesPrice = this.client.ecoPrices.tomatoes * Number(foundItemList.tomatoes);
		if (foundItemList.goldNugget !== undefined) goldNuggetPrice = this.client.ecoPrices.goldNugget * Number(foundItemList.goldNugget);
		if (foundItemList.barley !== undefined) barleyPrice = this.client.ecoPrices.barley * Number(foundItemList.barley);
		if (foundItemList.spinach !== undefined) spinachPrice = this.client.ecoPrices.spinach * Number(foundItemList.spinach);
		if (foundItemList.strawberries !== undefined) strawberriesPrice = this.client.ecoPrices.strawberries * Number(foundItemList.strawberries);
		if (foundItemList.lettuce !== undefined) lettucePrice = this.client.ecoPrices.lettuce * Number(foundItemList.lettuce);


		if (!args.length) { // add stealTimer purchase
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Shop**`, [
					`**◎ Available Commands:**`,
					`\u3000 \`${prefix}shop buy\``,
					`\u3000 \`${prefix}shop sell\``
				]);
			message.channel.send(embed);
			return;
		}

		if (args[0] === 'buy') {
			if (args[1] === undefined) {
				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Shop - Buy**`, [
						/* `**◎ Steal Success Multiplier:** \`Current Level: ${foundBoostsList.stealSuccess}\``, // When hit level 25, you can now steal from bank, but at a low percentage, will take bank if percentage is lower than cash -- max level 50
						`\u3000 Next Level Price: <:coin:706659001164628008> \`${stealPrice.toLocaleString('en')}\``,
						`\u200b`,
						`**◎ Work Multiplier:** \`Current Level: ${foundBoostsList.workMultiplier}\``,
						`\u3000 Next Level Price: <:coin:706659001164628008> \`${workPrice.toLocaleString('en')}\``,
						`\u200b`,
						`**◎ Points per Message Multiplier:** \`Current Level: ${foundBoostsList.perMesMultiplier}\``,
						`\u3000 Next Level Price: <:coin:706659001164628008> \`${pointMesPrice.toLocaleString('en')}\``,
						`\u200b`,
						`**◎ Auto Bank:** \`Current Level: ${foundBoostsList.autoBank}\``,
						`\u3000 Next Level Price: <:coin:706659001164628008> \`${autoBankPrice.toLocaleString('en')}\``,
						`\u200b`,*/
						`**◎ Permanent Items:**`,
						`\u3000 \`${prefix}shop buy rod\` ${!foundItemList.fishingRod ? `<:coin:706659001164628008> \`${fishingPrice.toLocaleString('en')}\`` : `- \`Owned\``}`,
						`\u3000 \`${prefix}shop buy tools\` ${!foundItemList.farmingTools ? `<:coin:706659001164628008> \`${fishingPrice.toLocaleString('en')}\`` : `- \`Owned\``}`
					]);
				message.channel.send(embed);
				return;
			}
			if (args[1] === 'rod' || args[1] === 'fishingrod') {
				if (foundItemList.fishingRod) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor(`${message.author.tag}`, message.author.avatarURL())
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Fishing Rod**`, [
							`**◎ Error:** You already own a fishing rod!`
						]);
					message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (balance.bank < fishingPrice) {
					this.client.utils.messageDelete(message, 10000);

					const notEnough = Number(fishingPrice) - Number(balance.bank);

					const embed = new MessageEmbed()
						.setAuthor(`${message.author.tag}`, message.author.avatarURL())
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Fishing Rod**`, [
							`**◎ Error:** You do not have enough <:coin:706659001164628008> in your bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString('en')}\``
						]);
					message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				balance.bank = Number(balance.bank) - Number(fishingPrice);
				balance.total = Number(balance.total) - Number(fishingPrice);
				this.client.setBalance.run(balance);

				foundItemList.fishingRod = Number(1).toString();

				await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
					items: JSON.stringify(foundItemList),
					id: `${message.author.id}-${message.guild.id}`
				});

				const fishingRodImage = new MessageAttachment('./Storage/Images/Economy/FishingRod.png', 'FishingRod.png');

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.attachFiles(fishingRodImage)
					.setThumbnail('attachment://FishingRod.png')
					.addField(`**${this.client.user.username} - Shop - Fishing Rod**`, [
						`**◎ Success:** You have bought a fishing rod!`
					]);
				message.channel.send(embed);
				return;
			}

			if (args[1] === 'farmingtools' || args[1] === 'tools') {
				if (foundItemList.farmingTools) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor(`${message.author.tag}`, message.author.avatarURL())
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Farming Tools**`, [
							`**◎ Error:** You already own Farming Tools!`
						]);
					message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (balance.bank < farmingPrice) {
					this.client.utils.messageDelete(message, 10000);

					const notEnough = Number(farmingPrice) - Number(balance.bank);

					const embed = new MessageEmbed()
						.setAuthor(`${message.author.tag}`, message.author.avatarURL())
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Farming Tools**`, [
							`**◎ Error:** You do not have enough <:coin:706659001164628008> in your bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString('en')}\``
						]);
					message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
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

				const toolsImage = new MessageAttachment('./Storage/Images/Economy/FarmingTool.png', 'FarmingTool.png');

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.attachFiles(toolsImage)
					.setThumbnail('attachment://FarmingTool.png')
					.addField(`**${this.client.user.username} - Shop - Farming Tools**`, [
						`**◎ Success:** You have bought Farming Tools${foundItemList.barley || foundItemList.spinach || foundItemList.strawberries || foundItemList.lettuce ? `.\nYou had some old crops, I have sold them for you and credited <:coin:706659001164628008> \`${fullPrice.toLocaleString('en')}\` to your account.` : `!`}`
					]);
				message.channel.send(embed);

				if (foundItemList.barley) delete foundItemList.barley;
				if (foundItemList.spinach) delete foundItemList.spinach;
				if (foundItemList.strawberries) delete foundItemList.strawberries;
				if (foundItemList.lettuce) delete foundItemList.lettuce;

				await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
					items: JSON.stringify(foundItemList),
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
						`\u3000 Corn: Own ${foundItemList.corn === undefined ? `\`0\`` : `\`${foundItemList.corn}\` - <:coin:706659001164628008> \`${cornPrice.toLocaleString('en')}\``}`,
						`\u3000 Wheat: Own ${foundItemList.wheat === undefined ? `\`0\`` : `\`${foundItemList.wheat}\` - <:coin:706659001164628008> \`${wheatPrice.toLocaleString('en')}\``}`,
						`\u3000 Potatoes: Own ${foundItemList.potatoes === undefined ? `\`0\`` : `\`${foundItemList.potatoes} \`- <:coin:706659001164628008> \`${potatoesPrice.toLocaleString('en')}\``}`,
						`\u3000 Tomatoes: Own ${foundItemList.tomatoes === undefined ? `\`0\`` : `\`${foundItemList.tomatoes}\` - <:coin:706659001164628008> \`${tomatoesPrice.toLocaleString('en')}\``}`
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
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Items**`, [
						`**◎ Fish:**`,
						`\u3000 Trout: Own ${foundItemList.trout === undefined ? `\`0\`` : `\`${foundItemList.trout}\` - <:coin:706659001164628008> \`${troutPrice.toLocaleString('en')}\``}`,
						`\u3000 King Salmon: Own ${foundItemList.kingSalmon === undefined ? `\`0\`` : `\`${foundItemList.kingSalmon}\` - <:coin:706659001164628008> \`${salmonPrice.toLocaleString('en')}\``}`,
						`\u3000 Swordfish: Own ${foundItemList.swordfish === undefined ? `\`0\`` : `\`${foundItemList.swordfish} \`- <:coin:706659001164628008> \`${swordFishPrice.toLocaleString('en')}\``}`,
						`\u3000 Pufferfish: Own ${foundItemList.pufferfish === undefined ? `\`0\`` : `\`${foundItemList.pufferfish}\` - <:coin:706659001164628008> \`${pufferFishPrice.toLocaleString('en')}\``}`,
						`\u200b`,
						`**◎ Crops:**`,
						`${fields.join('\n')}`,
						`\u200b`,
						`**◎ Treasure:**`,
						`\u3000 Treasure Chest: Own ${foundItemList.treasure === undefined ? `\`0\`` : `${foundItemList.treasure} - <:coin:706659001164628008> \`${treasurePrice.toLocaleString('en')}\``}`,
						`\u3000 Gold Bar: Own ${foundItemList.goldBar === undefined ? `\`0\`` : `\`${foundItemList.goldBar}\` - <:coin:706659001164628008> \`${goldBarPrice.toLocaleString('en')}\``}`,
						`\u3000 Gold Nugget: Own ${foundItemList.goldNugget === undefined ? `\`0\`` : `\`${foundItemList.goldNugget}\` - <:coin:706659001164628008> \`${goldNuggetPrice.toLocaleString('en')}\``}`,
						`\u200b`,
						`**◎ Available Commands:**`,
						`\u3000 \`${prefix}shop sell fish\``,
						`\u3000 \`${prefix}shop sell treasure\``
					]);
				message.channel.send(embed);
				return;
			}

			if (args[1] === 'all') {
				if (!foundItemList.lettuce && !foundItemList.strawberries && !foundItemList.spinach && !foundItemList.barley && !foundItemList.tomatoes && !foundItemList.potatoes && !foundItemList.wheat && !foundItemList.corn && !foundItemList.trout && !foundItemList.kingSalmon && !foundItemList.swordfish && !foundItemList.pufferfish && !foundItemList.treasure && !foundItemList.goldBar && !foundItemList.goldNugget) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor(`${message.author.tag}`, message.author.avatarURL())
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Sell All**`, [
							`**◎ Error:** You do not have anything to sell!`
						]);
					message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				let fullPrice = 0;
				let itemCount = 0;

				if (foundItemList.lettuce) fullPrice += Number(foundItemList.lettuce) * this.client.ecoPrices.lettuce;
				if (foundItemList.strawberries) fullPrice += Number(foundItemList.strawberries) * this.client.ecoPrices.strawberries;
				if (foundItemList.spinach) fullPrice += Number(foundItemList.spinach) * this.client.ecoPrices.spinach;
				if (foundItemList.barley)fullPrice += Number(foundItemList.barley) * this.client.ecoPrices.barley;
				if (foundItemList.tomatoes) fullPrice += Number(foundItemList.tomatoes) * this.client.ecoPrices.tomatoes;
				if (foundItemList.potatoes) fullPrice += Number(foundItemList.potatoes) * this.client.ecoPrices.potatoes;
				if (foundItemList.wheat) fullPrice += Number(foundItemList.wheat) * this.client.ecoPrices.wheat;
				if (foundItemList.corn)fullPrice += Number(foundItemList.corn) * this.client.ecoPrices.corn;
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
				if (foundItemList.tomatoes) itemCount += Number(foundItemList.tomatoes);
				if (foundItemList.potatoes) itemCount += Number(foundItemList.potatoes);
				if (foundItemList.wheat) itemCount += Number(foundItemList.wheat);
				if (foundItemList.corn) itemCount += Number(foundItemList.corn);
				if (foundItemList.goldBar) itemCount += Number(foundItemList.goldBar);
				if (foundItemList.goldNugget) itemCount += Number(foundItemList.goldNugget);

				const totalAdd = balance.total + fullPrice;
				const addAut = {
					id: `${message.author.id}-${message.guild.id}`,
					user: message.author.id,
					guild: message.guild.id,
					hourly: balance.hourly,
					daily: balance.daily,
					weekly: balance.weekly,
					monthly: balance.monthly,
					yearly: balance.yearly,
					stealcool: balance.stealcool,
					boosts: balance.boosts,
					cash: balance.cash,
					bank: balance.bank + fullPrice,
					total: totalAdd,
					fishcool: balance.fishcool,
					farmcool: balance.farmcool,
					items: balance.items,
					claimNewUser: balance.claimNewUser
				};

				this.client.setBalance.run(addAut);

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
				if (foundItemList.tomatoes) delete foundItemList.tomatoes;
				if (foundItemList.potatoes) delete foundItemList.potatoes;
				if (foundItemList.wheat) delete foundItemList.wheat;
				if (foundItemList.corn) delete foundItemList.corn;

				await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
					items: JSON.stringify(foundItemList),
					id: `${message.author.id}-${message.guild.id}`
				});

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Shop - Sell All**`, [
						`**◎ Success:** You have sold \`${itemCount}\` items. You have received <:coin:706659001164628008> \`${fullPrice.toLocaleString('en')}\`\nYour new total is: <:coin:706659001164628008> \`${totalAdd.toLocaleString('en')}\``
					]);
				message.channel.send(embed);
				return;
			}

			if (args[1] === 'fish') {
				if (foundItemList.trout === undefined && foundItemList.kingSalmon === undefined && foundItemList.swordfish === undefined && foundItemList.pufferfish === undefined && foundItemList.treasure === undefined) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor(`${message.author.tag}`, message.author.avatarURL())
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Sell Fish**`, [
							`**◎ Error:** You do not have any fish!`
						]);
					message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
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
				const addAut = {
					id: `${message.author.id}-${message.guild.id}`,
					user: message.author.id,
					guild: message.guild.id,
					hourly: balance.hourly,
					daily: balance.daily,
					weekly: balance.weekly,
					monthly: balance.monthly,
					yearly: balance.yearly,
					stealcool: balance.stealcool,
					boosts: balance.boosts,
					cash: balance.cash,
					bank: balance.bank + fullPrice,
					total: totalAdd,
					fishcool: balance.fishcool,
					farmcool: balance.farmcool,
					items: balance.items,
					claimNewUser: balance.claimNewUser
				};

				this.client.setBalance.run(addAut);

				if (foundItemList.trout) delete foundItemList.trout;
				if (foundItemList.kingSalmon) delete foundItemList.kingSalmon;
				if (foundItemList.swordfish) delete foundItemList.swordfish;
				if (foundItemList.pufferfish) delete foundItemList.pufferfish;

				await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
					items: JSON.stringify(foundItemList),
					id: `${message.author.id}-${message.guild.id}`
				});

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Shop - Sell Fish**`, [
						`**◎ Success:** You have sold \`${fishCount}\` fish. You have received <:coin:706659001164628008> \`${fullPrice.toLocaleString('en')}\`\nYour new total is: <:coin:706659001164628008> \`${totalAdd.toLocaleString('en')}\``
					]);
				message.channel.send(embed);
				return;
			}

			if (args[1] === 'treasure') {
				if (foundItemList.treasure === undefined) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor(`${message.author.tag}`, message.author.avatarURL())
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Sell Treasure**`, [
							`**◎ Error:** You do not have any treasure!`
						]);
					message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
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
				const addAut = {
					id: `${message.author.id}-${message.guild.id}`,
					user: message.author.id,
					guild: message.guild.id,
					hourly: balance.hourly,
					daily: balance.daily,
					weekly: balance.weekly,
					monthly: balance.monthly,
					yearly: balance.yearly,
					stealcool: balance.stealcool,
					boosts: balance.boosts,
					cash: balance.cash,
					bank: balance.bank + fullPrice,
					total: totalAdd,
					fishcool: balance.fishcool,
					farmcool: balance.farmcool,
					items: balance.items,
					claimNewUser: balance.claimNewUser
				};

				this.client.setBalance.run(addAut);

				if (foundItemList.treasure) delete foundItemList.treasure;
				if (foundItemList.goldBar) delete foundItemList.goldBar;
				if (foundItemList.goldNugget) delete foundItemList.goldNugget;

				await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
					items: JSON.stringify(foundItemList),
					id: `${message.author.id}-${message.guild.id}`
				});

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Shop - Sell Treasure**`, [
						`**◎ Success:** You have sold \`${treasureCount}\` treasure. You have received <:coin:706659001164628008> \`${fullPrice.toLocaleString('en')}\`\nYour new total is: <:coin:706659001164628008> \`${totalAdd.toLocaleString('en')}\``
					]);
				message.channel.send(embed);
				return;
			}

			if (args[1] === 'farm' || args[1] === 'crops') {
				if (!foundItemList.lettuce && !foundItemList.strawberries && !foundItemList.spinach && !foundItemList.barley && !foundItemList.tomatoes && !foundItemList.potatoes && !foundItemList.wheat && !foundItemList.corn) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor(`${message.author.tag}`, message.author.avatarURL())
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Shop - Sell Farm**`, [
							`**◎ Error:** You do not have any farming produce!`
						]);
					message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				let fullPrice = 0;
				let itemCount = 0;

				if (foundItemList.lettuce) fullPrice += Number(foundItemList.lettuce) * this.client.ecoPrices.lettuce;
				if (foundItemList.strawberries) fullPrice += Number(foundItemList.strawberries) * this.client.ecoPrices.strawberries;
				if (foundItemList.spinach) fullPrice += Number(foundItemList.spinach) * this.client.ecoPrices.spinach;
				if (foundItemList.barley)fullPrice += Number(foundItemList.barley) * this.client.ecoPrices.barley;

				if (foundItemList.tomatoes) fullPrice += Number(foundItemList.tomatoes) * this.client.ecoPrices.tomatoes;
				if (foundItemList.potatoes) fullPrice += Number(foundItemList.potatoes) * this.client.ecoPrices.potatoes;
				if (foundItemList.wheat) fullPrice += Number(foundItemList.wheat) * this.client.ecoPrices.wheat;
				if (foundItemList.corn)fullPrice += Number(foundItemList.corn) * this.client.ecoPrices.corn;


				if (foundItemList.lettuce) itemCount += Number(foundItemList.lettuce);
				if (foundItemList.strawberries) itemCount += Number(foundItemList.strawberries);
				if (foundItemList.spinach) itemCount += Number(foundItemList.spinach);
				if (foundItemList.barley) itemCount += Number(foundItemList.barley);

				if (foundItemList.tomatoes) itemCount += Number(foundItemList.tomatoes);
				if (foundItemList.potatoes) itemCount += Number(foundItemList.potatoes);
				if (foundItemList.wheat) itemCount += Number(foundItemList.wheat);
				if (foundItemList.corn) itemCount += Number(foundItemList.corn);

				const totalAdd = balance.total + fullPrice;
				const addAut = {
					id: `${message.author.id}-${message.guild.id}`,
					user: message.author.id,
					guild: message.guild.id,
					hourly: balance.hourly,
					daily: balance.daily,
					weekly: balance.weekly,
					monthly: balance.monthly,
					yearly: balance.yearly,
					stealcool: balance.stealcool,
					boosts: balance.boosts,
					cash: balance.cash,
					bank: balance.bank + fullPrice,
					total: totalAdd,
					fishcool: balance.fishcool,
					farmcool: balance.farmcool,
					items: balance.items,
					claimNewUser: balance.claimNewUser
				};

				this.client.setBalance.run(addAut);

				if (foundItemList.barley) delete foundItemList.barley;
				if (foundItemList.spinach) delete foundItemList.spinach;
				if (foundItemList.strawberries) delete foundItemList.strawberries;
				if (foundItemList.lettuce) delete foundItemList.lettuce;

				if (foundItemList.tomatoes) delete foundItemList.tomatoes;
				if (foundItemList.potatoes) delete foundItemList.potatoes;
				if (foundItemList.wheat) delete foundItemList.wheat;
				if (foundItemList.corn) delete foundItemList.corn;

				await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
					items: JSON.stringify(foundItemList),
					id: `${message.author.id}-${message.guild.id}`
				});

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Shop - Sell Farm**`, [
						`**◎ Success:** You have sold \`${itemCount}\` farm products. You have received <:coin:706659001164628008> \`${fullPrice.toLocaleString('en')}\`\nYour new total is: <:coin:706659001164628008> \`${totalAdd.toLocaleString('en')}\``
					]);
				message.channel.send(embed);
				return;
			}
		}
	}

};
