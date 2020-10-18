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
			description: 'Go Farming!',
			category: 'Economy'
		});
	}

	async run(message) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);

		let foundItemList;

		if (!balance.items) {
			foundItemList = {};
		} else {
			foundItemList = JSON.parse(balance.items);
		}

		let name;
		let price;

		if (balance.farmcool !== null) {
			if (Date.now() > balance.farmcool) {
				await db.prepare('UPDATE balance SET farmcool = (@farmcool) WHERE id = (@id);').run({
					farmcool: null,
					id: `${message.author.id}-${message.guild.id}`
				});
			} else {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Farm**`,
						`**◎ Error:** Please wait another \`${ms(balance.farmcool - new Date().getTime(), { long: true })}\` before using this command.`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
		}

		let amt;
		const farmChance = Math.random();
		if (farmChance < 0.0018) { // 0.18%
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor));

			const goldChance = Math.random();
			if (!balance.items || !foundItemList.farmingTools) {
				embed.setFooter(`Purchase farming tools to increase quality of produce! - ${prefix}shop buy tools`);

				if (goldChance < 0.80) { // 80% of this happening
					name = 'Gold Nugget';

					price = this.client.ecoPrices.goldNugget;
					if (foundItemList.goldNugget) {
						amt = Number(foundItemList.goldNugget) + Number(1);
					} else {
						amt = Number(1);
					}
					foundItemList.goldNugget = amt.toString();

					const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

					balance.farmcool = Math.round(endTime);
				} else {
					name = 'Gold Bar';

					price = this.client.ecoPrices.goldBar;
					if (foundItemList.goldBar) {
						amt = Number(foundItemList.goldBar) + Number(1);
					} else {
						amt = Number(1);
					}
					foundItemList.goldBar = amt.toString();

					const endTime = new Date().getTime() + this.client.ecoPrices.farmToolWinTime;

					balance.farmcool = Math.round(endTime);
				}
			} else if (foundItemList.farmingTools) { // Tool
				if (goldChance < 0.80) { // 80% of this happening
					name = 'Gold Bar';

					price = this.client.ecoPrices.goldBar;
					if (foundItemList.goldBar) {
						amt = Number(foundItemList.goldBar) + Number(1);
					} else {
						amt = Number(1);
					}
					foundItemList.goldBar = amt.toString();

					const endTime = new Date().getTime() + this.client.ecoPrices.farmToolWinTime;

					balance.farmcool = Math.round(endTime);
				} else {
					name = 'Gold Nugget';

					price = this.client.ecoPrices.goldNugget;
					if (foundItemList.goldNugget) {
						amt = Number(foundItemList.goldNugget) + Number(1);
					} else {
						amt = Number(1);
					}
					foundItemList.goldNugget = amt.toString();

					const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

					balance.farmcool = Math.round(endTime);
				}
			}

			this.client.setBalance.run(balance);

			await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
				items: JSON.stringify(foundItemList),
				id: `${message.author.id}-${message.guild.id}`
			});

			embed.addField(`**${this.client.user.username} - Farm**`,
				`**◎ Success:** You found a ${name}! You are extremely lucky, there is only a \`0.18%\` of finding this! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString('en')}\`\nYou now have \`${amt}\`.`);

			message.channel.send(embed);
			return;
		} else if (farmChance >= 0.0018 && farmChance < 0.0318) { // 3%
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor));

			if (!balance.items || !foundItemList.farmingTools) { // No Tool
				embed.setFooter(`Purchase farming tools to increase quality of produce! - ${prefix}shop buy tools`);

				name = 'Barley';

				price = this.client.ecoPrices.barley;
				if (foundItemList.barley) {
					amt = Number(foundItemList.barley) + Number(1);
				} else {
					amt = Number(1);
				}
				foundItemList.barley = amt.toString();

				const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

				balance.farmcool = Math.round(endTime);
			} else { // Tool
				name = 'Corn';

				price = this.client.ecoPrices.corn;
				if (foundItemList.corn) {
					amt = Number(foundItemList.corn) + Number(1);
				} else {
					amt = Number(1);
				}
				foundItemList.corn = amt.toString();

				const endTime = new Date().getTime() + this.client.ecoPrices.farmToolWinTime;

				balance.farmcool = Math.round(endTime);
			}

			this.client.setBalance.run(balance);

			await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
				items: JSON.stringify(foundItemList),
				id: `${message.author.id}-${message.guild.id}`
			});

			embed.addField(`**${this.client.user.username} - Farm**`,
				`**◎ Success:** You farmed ${name}! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString('en')}\`\nYou now have \`${amt}\`.`);
			message.channel.send(embed);
			return;
		} else if (farmChance >= 0.0318 && farmChance < 0.0918) { // 6%
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor));

			if (!balance.items || !foundItemList.farmingTools) { // No Tool
				embed.setFooter(`Purchase farming tools to increase quality of produce! - ${prefix}shop buy tools`);

				name = 'Spinach';

				price = this.client.ecoPrices.spinach;
				if (foundItemList.spinach) {
					amt = Number(foundItemList.spinach) + Number(1);
				} else {
					amt = Number(1);
				}
				foundItemList.spinach = amt.toString();

				const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

				balance.farmcool = Math.round(endTime);
			} else { // Tool
				name = 'Wheat';

				price = this.client.ecoPrices.wheat;
				if (foundItemList.wheat) {
					amt = Number(foundItemList.wheat) + Number(1);
				} else {
					amt = Number(1);
				}
				foundItemList.wheat = amt.toString();

				const endTime = new Date().getTime() + this.client.ecoPrices.farmToolWinTime;

				balance.farmcool = Math.round(endTime);
			}

			this.client.setBalance.run(balance);

			await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
				items: JSON.stringify(foundItemList),
				id: `${message.author.id}-${message.guild.id}`
			});

			embed.addField(`**${this.client.user.username} - Farm**`,
				`**◎ Success:** You farmed ${name}! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString('en')}\`\nYou now have \`${amt}\`.`);
			message.channel.send(embed);
			return;
		} else if (farmChance >= 0.0918 && farmChance < 0.3718) { // 28%
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor));

			if (!balance.items || !foundItemList.farmingTools) { // No Tool
				embed.setFooter(`Purchase farming tools to increase quality of produce! - ${prefix}shop buy tools`);

				name = 'Strawberries';

				price = this.client.ecoPrices.strawberries;
				if (foundItemList.strawberries) {
					amt = Number(foundItemList.strawberries) + Number(1);
				} else {
					amt = Number(1);
				}
				foundItemList.strawberries = amt.toString();

				const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

				balance.farmcool = Math.round(endTime);
			} else { // Tool
				name = 'Potatoes';

				price = this.client.ecoPrices.potatoes;
				if (foundItemList.potatoes) {
					amt = Number(foundItemList.potatoes) + Number(1);
				} else {
					amt = Number(1);
				}
				foundItemList.potatoes = amt.toString();

				const endTime = new Date().getTime() + this.client.ecoPrices.farmToolWinTime;

				balance.farmcool = Math.round(endTime);
			}

			this.client.setBalance.run(balance);

			await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
				items: JSON.stringify(foundItemList),
				id: `${message.author.id}-${message.guild.id}`
			});

			embed.addField(`**${this.client.user.username} - Farm**`,
				`**◎ Success:** You farmed ${name}! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString('en')}\`\nYou now have \`${amt}\`.`);
			message.channel.send(embed);
			return;
		} else if (farmChance >= 0.3718 && farmChance < 0.8718) { // 50%
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor));

			if (!balance.items || !foundItemList.farmingTools) { // No Tool
				embed.setFooter(`Purchase farming tools to increase quality of produce! - ${prefix}shop buy tools`);

				name = 'Lettuce';

				price = this.client.ecoPrices.lettuce;
				if (foundItemList.lettuce) {
					amt = Number(foundItemList.lettuce) + Number(1);
				} else {
					amt = Number(1);
				}
				foundItemList.lettuce = amt.toString();

				const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

				balance.farmcool = Math.round(endTime);
			} else { // Tool
				name = 'Tomatoes';

				price = this.client.ecoPrices.tomatoes;
				if (foundItemList.tomatoes) {
					amt = Number(foundItemList.tomatoes) + Number(1);
				} else {
					amt = Number(1);
				}
				foundItemList.tomatoes = amt.toString();

				const endTime = new Date().getTime() + this.client.ecoPrices.farmToolWinTime;

				balance.farmcool = Math.round(endTime);
			}

			this.client.setBalance.run(balance);

			await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
				items: JSON.stringify(foundItemList),
				id: `${message.author.id}-${message.guild.id}`
			});

			embed.addField(`**${this.client.user.username} - Farm**`,
				`**◎ Success:** You farmed ${name}! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString('en')}\`\nYou now have \`${amt}\`.`);
			message.channel.send(embed);
			return;
		} else { // 12.82&
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor));

			if (!balance.items || !foundItemList.farmingTools) { // No Tool
				embed.setFooter(`Purchase farming tools to increase quality of produce! - ${prefix}shop buy tools`);

				const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

				balance.farmcool = Math.round(endTime);
			} else { // Tool
				const endTime = new Date().getTime() + this.client.ecoPrices.farmToolWinTime;

				balance.farmcool = Math.round(endTime);
			}

			this.client.setBalance.run(balance);

			embed.addField(`**${this.client.user.username} - Farm**`,
				`**◎ Fail:** You farmed nothing!`);
			message.channel.send(embed);
			return;
		}
	}

};
