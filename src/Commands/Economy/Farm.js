/* eslint-disable no-mixed-operators */
/* eslint-disable no-inline-comments */
const Command = require('../../Structures/Command');
const { MessageEmbed, MessageAttachment } = require('discord.js');
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
				balance.farmcool = null;
			} else {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Farm**`,
						`**◎ Error:** Please wait another \`${ms(balance.farmcool - new Date().getTime(), { long: true })}\` before using this command.`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
		}

		const freeLimit = this.client.ecoPrices.freeFarmLimit;
		let currentTotalFarm = 0;

		if (foundItemList.barley) {
			currentTotalFarm += Number(foundItemList.barley);
		} else {
			currentTotalFarm += Number(0);
		}
		if (foundItemList.spinach) {
			currentTotalFarm += Number(foundItemList.spinach);
		} else {
			currentTotalFarm += Number(0);
		}
		if (foundItemList.strawberries) {
			currentTotalFarm += Number(foundItemList.strawberries);
		} else {
			currentTotalFarm += Number(0);
		}
		if (foundItemList.lettuce) {
			currentTotalFarm += Number(foundItemList.lettuce);
		} else {
			currentTotalFarm += Number(0);
		}

		if (!foundItemList.farmingTools) {
			if (currentTotalFarm >= Number(freeLimit)) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Farm**`,
						`**◎ Error:** Your farm bag is full! You can sell your produce with \`${prefix}shop sell\``)
					.setFooter(`Consider purchasing farming tools to increase your limit.`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
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
			embed.setFooter(`Planting crops yields a larger return! Check it out with - ${prefix}plant`);

			if (goldChance < 0.80) { // 80% of this happening
				const goldNuggetImage = new MessageAttachment('./Storage/Images/Economy/GoldNugget.png', 'GoldNugget.png');

				embed.attachFiles(goldNuggetImage);
				embed.setThumbnail('attachment://GoldNugget.png');

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

			this.client.setBalance.run(balance);

			await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
				items: JSON.stringify(foundItemList),
				id: `${message.author.id}-${message.guild.id}`
			});

			embed.addField(`**${this.client.user.username} - Farm**`,
				`**◎ Success:** You found a ${name}! You are extremely lucky, there is only a \`0.18%\` of finding this! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString('en')}\`\nYou now have \`${amt}\`.`);

			message.channel.send({ embeds: [embed] });
			return;
		} else if (farmChance >= 0.0018 && farmChance < 0.0318) { // 3%
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor));

			const barleyImage = new MessageAttachment('./Storage/Images/Economy/Barley.png', 'Barley.png');

			embed.setFooter(`Planting crops yields a larger return! Check it out with - ${prefix}plant`);
			embed.attachFiles(barleyImage);
			embed.setThumbnail('attachment://Barley.png');

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

			this.client.setBalance.run(balance);

			await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
				items: JSON.stringify(foundItemList),
				id: `${message.author.id}-${message.guild.id}`
			});

			embed.addField(`**${this.client.user.username} - Farm**`,
				`**◎ Success:** You farmed ${name}! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString('en')}\`\nYou now have \`${amt}\`.`);
			message.channel.send({ embeds: [embed] });
			return;
		} else if (farmChance >= 0.0318 && farmChance < 0.0918) { // 6%
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor));

			const spinachImage = new MessageAttachment('./Storage/Images/Economy/Spinach.png', 'Spinach.png');

			embed.attachFiles(spinachImage);
			embed.setThumbnail('attachment://Spinach.png');

			embed.setFooter(`Planting crops yields a larger return! Check it out with - ${prefix}plant`);

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

			this.client.setBalance.run(balance);

			await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
				items: JSON.stringify(foundItemList),
				id: `${message.author.id}-${message.guild.id}`
			});

			embed.addField(`**${this.client.user.username} - Farm**`,
				`**◎ Success:** You farmed ${name}! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString('en')}\`\nYou now have \`${amt}\`.`);
			message.channel.send({ embeds: [embed] });
			return;
		} else if (farmChance >= 0.0918 && farmChance < 0.3718) { // 28%
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor));

			const strawberryImage = new MessageAttachment('./Storage/Images/Economy/Strawberry.png', 'Strawberry.png');

			embed.attachFiles(strawberryImage);
			embed.setThumbnail('attachment://Strawberry.png');

			embed.setFooter(`Planting crops yields a larger return! Check it out with - ${prefix}plant`);

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

			this.client.setBalance.run(balance);

			await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
				items: JSON.stringify(foundItemList),
				id: `${message.author.id}-${message.guild.id}`
			});

			embed.addField(`**${this.client.user.username} - Farm**`,
				`**◎ Success:** You farmed ${name}! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString('en')}\`\nYou now have \`${amt}\`.`);
			message.channel.send({ embeds: [embed] });
			return;
		} else if (farmChance >= 0.3718 && farmChance < 0.8718) {
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor));

			const lettuceImage = new MessageAttachment('./Storage/Images/Economy/Lettuce.png', 'Lettuce.png');

			embed.attachFiles(lettuceImage);
			embed.setThumbnail('attachment://Lettuce.png');

			embed.setFooter(`Planting crops yields a larger return! Check it out with - ${prefix}plant`);

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

			this.client.setBalance.run(balance);

			await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
				items: JSON.stringify(foundItemList),
				id: `${message.author.id}-${message.guild.id}`
			});

			embed.addField(`**${this.client.user.username} - Farm**`,
				`**◎ Success:** You farmed ${name}! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString('en')}\`\nYou now have \`${amt}\`.`);
			message.channel.send({ embeds: [embed] });
			return;
		} else { // 12.82%
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor));

			embed.setFooter(`Purchase farming tools to never fail farming! - ${prefix}shop buy tools`);

			const endTime = new Date().getTime() + this.client.ecoPrices.farmFailTime;

			balance.farmcool = Math.round(endTime);

			this.client.setBalance.run(balance);

			embed.addField(`**${this.client.user.username} - Farm**`,
				`**◎ Fail:** You farmed nothing!`);
			message.channel.send({ embeds: [embed] });
			return;
		}
	}

};
