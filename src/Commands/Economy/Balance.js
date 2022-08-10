const Command = require('../../Structures/Command');
const { EmbedBuilder } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const converter = require('number-to-words-en');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['bal', 'coins', 'money'],
			description: 'Displays balance of message author/tagged user.',
			category: 'Economy',
			usage: '[@user]'
		});
	}

	async run(message, args) {
		let user;
		try {
			user = message.mentions.users.size ? message.mentions.members.first().user : args[0] ? message.guild.members.cache.find(usr => usr.displayName === args.join(' ')).user : message.author;
		} catch {
			user = null;
		}

		if (user === null) {
			this.client.utils.messageDelete(message, 10000);

			const limitE = new EmbedBuilder()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Balance**`,
					`**◎ Error:** I could not find the specified user!`);
			message.channel.send({ embeds: [limitE] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (user.bot) return;

		const balance = this.client.getBalance.get(`${user.id}-${message.guild.id}`);

		if (!balance) {
			this.client.utils.messageDelete(message, 10000);

			const limitE = new EmbedBuilder()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Balance**`,
					`**◎ Error:** ${user} does not have any balance!`);
			message.channel.send({ embeds: [limitE] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const userRank = db.prepare('SELECT count(*) FROM balance WHERE total >= ? AND guild = ? AND user ORDER BY total DESC').all(balance.total, message.guild.id);

		const rankPos = converter.toOrdinal(`${userRank[0]['count(*)']}`);

		const date = new Date().getTime();

		if (user.id === message.author.id) {
			let foundItemList = JSON.parse(balance.items);
			let foundBoostList = JSON.parse(balance.boosts);
			let foundPlotList = JSON.parse(balance.farmPlot);
			let foundHarvestList = JSON.parse(balance.harvestedCrops);

			let claimUserTime;
			if (balance.claimNewUser) {
				const endTime = balance.claimNewUser;
				claimUserTime = Math.round(endTime / 1000);
			}

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

			const embed1 = new EmbedBuilder()
				.setAuthor({ name: `${user.username}'s Balance`, iconURL: user.avatarURL() })
				.setDescription(`Leaderboard Rank: \`${rankPos}\``)
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addFields({ name: 'Cash', value: `<:coin:706659001164628008> \`${balance.cash.toLocaleString('en')}\``, inline: true },
					{ name: 'Bank', value: `<:coin:706659001164628008> \`${balance.bank.toLocaleString('en')}\``, inline: true },
					{ name: 'Total', value: `<:coin:706659001164628008> \`${balance.total.toLocaleString('en')}\``, inline: true },
					{ name: 'Steal Cooldown', value: `${Date.now() > balance.stealcool ? `\`Available!\`` : `\`${ms(balance.stealcool - date, { long: true })}\``}`, inline: true },
					{ name: 'Fish Cooldown', value: `${!foundItemList.fishingRod ? `\`Rod Not Owned\`` : Date.now() > balance.fishcool ? `\`Available!\`` : `\`${ms(balance.fishcool - date, { long: true })}\``}`, inline: true },
					{ name: 'Farm Cooldown', value: `${Date.now() > balance.farmcool ? `\`Available!\`` : `\`${ms(balance.farmcool - date, { long: true })}\``}`, inline: true },
					{ name: 'Seed Bag', value: `${foundBoostList.seedBag ? `\`${Number(currentTotalSeeds).toLocaleString('en')}/${Number(foundBoostList.seedBag).toLocaleString('en')}\`` : `\`Not Owned\``}`, inline: true },
					{ name: 'Fish Bag', value: `${foundBoostList.fishBag ? `\`${Number(currentTotalFish).toLocaleString('en')}/${Number(foundBoostList.fishBag).toLocaleString('en')}\`` : `\`Not Owned\``}`, inline: true },
					{ name: 'Farm Bag', value: `${foundBoostList.farmBag ? `\`${Number(currentTotalFarm).toLocaleString('en')}/${Number(foundBoostList.farmBag).toLocaleString('en')}\`` : `\`Not Owned\``}`, inline: true },
					{ name: 'Farm Plot', value: `${foundBoostList.farmPlot ? `\`${foundPlotList.length.toLocaleString('en')}/${Number(foundBoostList.farmPlot).toLocaleString('en')}\`` : `\`Not Owned\``}`, inline: true },
					{ name: '**◎ Claim Cooldown**', value: `\n**Hourly:** ${balance.claimNewUser ? Date.now() > balance.claimNewUser ? `\`Available\`` : `<t:${claimUserTime}:R>` : Date.now() > balance.hourly ? `\`Available!\`` : `\`${ms(balance.hourly - date, { long: true })}\``}
					\n**Daily:** ${balance.claimNewUser ? Date.now() > balance.claimNewUser ? `\`Available\`` : `<t:${claimUserTime}:R>` : Date.now() > balance.daily ? `\`Available!\`` : `\`${ms(balance.daily - date, { long: true })}\``}
					\n**Weekly:** ${balance.claimNewUser ? Date.now() > balance.claimNewUser ? `\`Available\`` : `<t:${claimUserTime}:R>` : Date.now() > balance.weekly ? `\`Available!\`` : `\`${ms(balance.weekly - date, { long: true })}\``}
					\n**Monthly:** ${balance.claimNewUser ? Date.now() > balance.claimNewUser ? `\`Available\`` : `<t:${claimUserTime}:R>` : Date.now() > balance.monthly ? `\`Available!\`` : `\`${ms(balance.monthly - date, { long: true })}\``}` });
			message.channel.send({ embeds: [embed1] });
			return;
		}
		const embed1 = new EmbedBuilder()
			.setAuthor({ name: `${user.username}'s Balance`, iconURL: user.avatarURL() })
			.setDescription(`Leaderboard Rank: \`${rankPos}\``)
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addFields({ name: 'Cash', value: `<:coin:706659001164628008> \`${balance.cash.toLocaleString('en')}\``, inline: true },
				{ name: 'Bank', value: `<:coin:706659001164628008> \`${balance.bank.toLocaleString('en')}\``, inline: true },
				{ name: 'Total', value: `<:coin:706659001164628008> \`${balance.total.toLocaleString('en')}\``, inline: true })
			.setTimestamp();
		message.channel.send({ embeds: [embed1] });
	}

};
