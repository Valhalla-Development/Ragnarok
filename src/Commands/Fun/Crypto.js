const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const cryptocurrencies = require('cryptocurrencies');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['cryptocurrency'],
			description: 'Fetches specified crypto price.',
			category: 'Fun',
			usage: '<crypto> [currency]'
		});
	}

	async run(message, args) {
		const symbolDict = {
			USD: '$', BTC: '₿', ETH: 'Ξ', LTC: 'Ł', EUR: '€', JPY: '¥', RUB: '₽',
			AED: 'د.إ', BDT: '৳', BHD: 'BD', CNY: '¥', CZK: 'Kč', DKK: 'kr.', GBP: '£',
			HUF: 'Ft', IDR: 'Rp', ILS: '₪', INR: '₹', KRW: '₩', KWD: 'KD', LKR: 'රු',
			MMK: 'K', MYR: 'RM', NOK: 'kr', PHP: '₱', PKR: 'Rs', PLN: 'zł', SAR: 'SR',
			SEK: 'kr', THB: '฿', TRY: '₺', VEF: 'Bs.', VND: '₫', ZAR: 'R', XDR: 'SDR',
			XAG: 'XAG', XAU: 'XAU'
		};

		if (!args[0]) {
			this.client.utils.messageDelete(message, 10000);

			const noinEmbed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Crypto**`,
					`**◎ Error:** Please enter a valid cryptocurrency!`);
			message.channel.send(noinEmbed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const cryptoType = cryptocurrencies[args[0].toUpperCase()] || args[0];

		if (!cryptoType) {
			this.client.utils.messageDelete(message, 10000);

			const noinEmbed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Crypto**`,
					`**◎ Error:** Please enter a valid cryptocurrency!`);
			message.channel.send(noinEmbed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const rawResponse = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${args[1] ? args[1].toLowerCase() : 'usd'}&ids=${cryptoType.toLowerCase()}`);

		const content = await rawResponse.json();

		if (!content[0] || !content[0].id) {
			this.client.utils.messageDelete(message, 10000);

			const noinEmbed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Crypto**`,
					`**◎ Error:** Please enter a valid cryptocurrency!`);
			message.channel.send(noinEmbed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const currency = args[1] ? `${symbolDict[args[1].toUpperCase()]}` : `$`;

		const currentPrice = content[0].current_price ? content[0].current_price > 1 ? `${currency}${content[0].current_price.toLocaleString('en')}` : `${currency}${content[0].current_price}` : 'N/A';
		const marketCap = content[0].market_cap ? `${currency}${content[0].market_cap.toLocaleString('en')}` : 'N/A';
		const high24 = content[0].high_24h ? `${currency}${content[0].high_24h.toLocaleString('en')}` : 'N/A';
		const low24 = content[0].low_24h ? `${currency}${content[0].low_24h.toLocaleString('en')}` : 'N/A';
		const pricech24 = content[0].price_change_24h ? `${currency}${content[0].price_change_24h.toLocaleString('en')}` : 'N/A';
		const priceper24 = content[0].price_change_percentage_24h ? `${content[0].price_change_percentage_24h.toLocaleString('en')}%` : 'N/A';
		const { image } = content[0];

		const successEmb = new MessageEmbed();

		if (image) {
			successEmb.setThumbnail(content[0].image);
		}
		successEmb.setAuthor(`${message.author.tag}`, message.author.avatarURL());
		successEmb.setColor(this.client.utils.color(message.guild.me.displayHexColor));
		successEmb.addField(`**Crypto - ${this.client.utils.capitalise(content[0].id)} ${args[1] ? `(${args[1].toUpperCase()})` : '(USD)'}**`,
			`**◎ Name:** \`${this.client.utils.capitalise(content[0].id)}\` **(${content[0].symbol.toUpperCase()})**
			**◎ Current Price:** \`${currentPrice}\`
			**◎ History:**
			\u3000 Market Cap: \`${marketCap}\`
			\u3000 High (24hr): \`${high24}\`
			\u3000 Low (24hr): \`${low24}\`
			\u3000 Price Change (24hr): \`${pricech24}\`
			\u3000 Price Change Percentage (24hr): \`${priceper24}\``);
		message.channel.send(successEmb);
	}

};
