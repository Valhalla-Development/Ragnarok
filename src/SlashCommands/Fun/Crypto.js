/* eslint-disable no-nested-ternary */
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import fetch from 'node-fetch';
import cryptocurrencies from 'cryptocurrencies';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('crypto')
  .setDescription('Fetches search results from r/AirReps')
  .addStringOption((option) => option.setName('crypto').setDescription('The type of crypto you would like to lookup').setRequired(true))
  .addStringOption((option) => option.setName('currency').setDescription('The currency you wish to conver to'));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Fetches specified crypto price.',
      category: 'Fun',
      options: data,
      usage: '<crypto> [currency]'
    });
  }

  async run(interaction) {
    const symbolDict = {
      USD: '$',
      BTC: '₿',
      ETH: 'Ξ',
      LTC: 'Ł',
      EUR: '€',
      JPY: '¥',
      RUB: '₽',
      AED: 'د.إ',
      BDT: '৳',
      BHD: 'BD',
      CNY: '¥',
      CZK: 'Kč',
      DKK: 'kr.',
      GBP: '£',
      HUF: 'Ft',
      IDR: 'Rp',
      ILS: '₪',
      INR: '₹',
      KRW: '₩',
      KWD: 'KD',
      LKR: 'රු',
      MMK: 'K',
      MYR: 'RM',
      NOK: 'kr',
      PHP: '₱',
      PKR: 'Rs',
      PLN: 'zł',
      SAR: 'SR',
      SEK: 'kr',
      THB: '฿',
      TRY: '₺',
      VEF: 'Bs.',
      VND: '₫',
      ZAR: 'R',
      XDR: 'SDR',
      XAG: 'XAG',
      XAU: 'XAU'
    };

    const parseCrypto = interaction.options.getString('crypto');
    let parseCurrency;

    if (interaction.options.getString('currency')) parseCurrency = interaction.options.getString('currency');

    const cryptoType = cryptocurrencies[parseCrypto.toUpperCase()];

    if (!cryptoType) {
      const noinEmbed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Crypto**`, value: '**◎ Error:** Please enter a valid cryptocurrency!' });
      interaction.reply({ ephemeral: true, embeds: [noinEmbed] });
      return;
    }

    const rawResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${
        parseCurrency ? parseCurrency.toLowerCase() : 'usd'
      }&ids=${cryptoType.toLowerCase()}`
    );

    const content = await rawResponse.json();

    if (!content[0] || !content[0].id) {
      const noinEmbed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Crypto**`, value: '**◎ Error:** Please enter a valid cryptocurrency!' });
      interaction.reply({ ephemeral: true, embeds: [noinEmbed] });
      return;
    }

    const currency = parseCurrency ? `${symbolDict[parseCurrency.toUpperCase()]}` : '$';

    const currentPrice = content[0].current_price
      ? content[0].current_price > 1
        ? `${currency}${content[0].current_price.toLocaleString('en')}`
        : `${currency}${content[0].current_price}`
      : 'N/A';
    const marketCap = content[0].market_cap ? `${currency}${content[0].market_cap.toLocaleString('en')}` : 'N/A';
    const high24 = content[0].high_24h ? `${currency}${content[0].high_24h.toLocaleString('en')}` : 'N/A';
    const low24 = content[0].low_24h ? `${currency}${content[0].low_24h.toLocaleString('en')}` : 'N/A';
    const pricech24 = content[0].price_change_24h ? `${currency}${content[0].price_change_24h.toLocaleString('en')}` : 'N/A';
    const priceper24 = content[0].price_change_percentage_24h ? `${content[0].price_change_percentage_24h.toLocaleString('en')}%` : 'N/A';
    const { image } = content[0];

    const successEmb = new EmbedBuilder();

    if (image) {
      successEmb.setThumbnail(content[0].image);
    }
    successEmb.setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() });
    successEmb.setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor));
    successEmb.addFields({
      name: `**Crypto - ${this.client.utils.capitalise(content[0].id)} ${parseCurrency ? `(${parseCurrency.toUpperCase()})` : '(USD)'}**`,
      value: `**◎ Name:** \`${this.client.utils.capitalise(content[0].id)}\` **(${content[0].symbol.toUpperCase()})**
			**◎ Current Price:** \`${currentPrice}\`
			**◎ History:**
			\u3000 Market Cap: \`${marketCap}\`
			\u3000 High (24hr): \`${high24}\`
			\u3000 Low (24hr): \`${low24}\`
			\u3000 Price Change (24hr): \`${pricech24}\`
			\u3000 Price Change Percentage (24hr): \`${priceper24}\``
    });
    interaction.reply({ embeds: [successEmb] });
  }
};

export default SlashCommandF;
