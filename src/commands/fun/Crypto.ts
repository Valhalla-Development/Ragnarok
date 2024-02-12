import {
    Client, Discord, Slash, SlashOption,
} from 'discordx';
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Category } from '@discordx/utilities';
// @ts-expect-error no type file available for this package
import cryptocurrencies from 'cryptocurrencies';
import axios from 'axios';
import { capitalise, color } from '../../utils/Util.js';

@Discord()
@Category('Fun')
export class Crypto {
    /**
     * Fetches specified crypto price
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param crypto - Crypto price to fetch
     * @param currency - Optional currency to use (defaults to USD)
     */
    @Slash({ description: 'Fetches specified crypto price' })
    async crypto(
        @SlashOption({
            description: 'Crypto price to fetch',
            name: 'crypto',
            required: true,
            type: ApplicationCommandOptionType.String,
        })
            crypto: string,
        @SlashOption({
            description: 'Currency to use',
            name: 'currency',
            type: ApplicationCommandOptionType.String,
        })
            currency: string,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        await interaction.deferReply();

        const symbolDict: { [key: string]: string } = {
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
            XAU: 'XAU',
        };

        const currencyUpperCase = currency ? currency.toUpperCase() : 'USD';
        const cryptoUpperCase = crypto.toUpperCase();

        if (currency && !symbolDict[currency.toUpperCase()]) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.user.tag}`, iconURL: `${interaction.user.avatarURL()}` })
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .addFields({ name: `**${client.user?.username} - Crypto**`, value: '**◎ Error:** Please enter a valid currency!' });

            await interaction.editReply({ embeds: [embed] });
            return;
        }

        const cryptoType = cryptocurrencies[cryptoUpperCase];
        if (!cryptoType) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.user.tag}`, iconURL: `${interaction.user.avatarURL()}` })
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .addFields({ name: `**${client.user?.username} - Crypto**`, value: '**◎ Error:** Please enter a valid cryptocurrency!' });

            await interaction.editReply({ embeds: [embed] });
            return;
        }

        // Fetch cryptocurrency data from the API
        try {
            const rawResponse = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
                params: {
                    vs_currency: currencyUpperCase.toLowerCase(),
                    ids: cryptoType.toLowerCase(),
                },
            });

            const content = rawResponse.data;

            // Check if the response contains valid data
            if (!Array.isArray(content) || content.length === 0 || !content[0].id) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `${interaction.user.tag}`, iconURL: `${interaction.user.avatarURL()}` })
                    .setColor(color(interaction.guild!.members.me!.displayHexColor))
                    .addFields({ name: `**${client.user?.username} - Crypto**`, value: '**◎ Error:** Please enter a valid cryptocurrency!' });

                await interaction.editReply({ embeds: [embed] });
                return;
            }

            // Extract relevant data from the response
            const {
                current_price: currentPrice = 'N/A',
                market_cap: marketCap = 'N/A',
                high_24h: high24 = 'N/A',
                low_24h: low24 = 'N/A',
                price_change_24h: pricech24 = 'N/A',
                price_change_percentage_24h: priceper24 = 'N/A',
                image,
                id,
                symbol,
            } = content[0];

            const parseCurrency = symbolDict[currencyUpperCase];

            // Build and send the success embed
            const successEmb = new EmbedBuilder()
                .setAuthor({ name: `${interaction.user.tag}`, iconURL: `${interaction.user.avatarURL()}` })
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .setThumbnail(image)
                .addFields({
                    name: `**Crypto - ${capitalise(id)} (${currencyUpperCase})**`,
                    value: `**◎ Name:** \`${capitalise(id)}\` **(${symbol.toUpperCase()})**
            **◎ Current Price:** \`${parseCurrency}${currentPrice.toLocaleString('en')}\`
            **◎ History:**
            \u3000 Market Cap: \`${parseCurrency}${marketCap.toLocaleString('en')}\`
            \u3000 High (24hr): \`${parseCurrency}${high24.toLocaleString('en')}\`
            \u3000 Low (24hr): \`${parseCurrency}${low24.toLocaleString('en')}\`
            \u3000 Price Change (24hr): \`${parseCurrency}${pricech24.toLocaleString('en')}\`
            \u3000 Price Change Percentage (24hr): \`${priceper24.toLocaleString('en')}%\``,
                });

            await interaction.editReply({ embeds: [successEmb] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.user.tag}`, iconURL: `${interaction.user.avatarURL()}` })
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .addFields({ name: `**${client.user?.username} - Crypto**`, value: '**◎ Error:** An error occurred while processing your request!' });

            await interaction.editReply({ embeds: [embed] });
        }
    }
}
