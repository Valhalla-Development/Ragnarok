import { Category } from '@discordx/utilities';
import axios from 'axios';
// @ts-expect-error no type file available for this package
import cryptocurrencies from 'cryptocurrencies';
import {
    ApplicationCommandOptionType,
    type CommandInteraction,
    ContainerBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { capitalise, RagnarokComponent } from '../../utils/Util.js';

@Discord()
@Category('Fun')
export class Crypto {
    /**
     * Fetches specified cryptocurrency price
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param crypto - Crypto price to fetch
     * @param currency - Optional currency to use (defaults to USD)
     */
    @Slash({ description: 'Fetches specified cryptocurrency price' })
    async crypto(
        @SlashOption({
            description: 'Specify the cryptocurrency to fetch price for',
            name: 'crypto',
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        crypto: string,
        @SlashOption({
            description: 'Specify the currency to use (optional)',
            name: 'currency',
            type: ApplicationCommandOptionType.String,
        })
        currency: string,
        interaction: CommandInteraction
    ): Promise<void> {
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
            await RagnarokComponent(interaction, 'Error', 'Please enter a valid currency!', true);
            return;
        }

        const cryptoType = cryptocurrencies[cryptoUpperCase];
        if (!cryptoType) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Please enter a valid cryptocurrency!',
                true
            );
            return;
        }

        await interaction.deferReply();

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
                await RagnarokComponent(
                    interaction,
                    'Error',
                    'Please enter a valid cryptocurrency!'
                );
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
                id,
                symbol,
            } = content[0];

            const parseCurrency = symbolDict[currencyUpperCase];

            const header = new TextDisplayBuilder().setContent(
                [
                    '# 💹 Crypto Snapshot',
                    `> **${capitalise(id)} (${symbol.toUpperCase()})**`,
                    `> 💰 Price: ${parseCurrency}${currentPrice.toLocaleString('en')}`,
                    `> 📊 Change 24h: ${parseCurrency}${pricech24.toLocaleString('en')} (${priceper24.toLocaleString('en')}%)`,
                ].join('\n')
            );

            const history = new TextDisplayBuilder().setContent(
                [
                    '## 🧾 Market History',
                    '',
                    `> 💸 Market Cap: ${parseCurrency}${marketCap.toLocaleString('en')}`,
                    `> 🔼 High (24h): ${parseCurrency}${high24.toLocaleString('en')}`,
                    `> 🔽 Low (24h): ${parseCurrency}${low24.toLocaleString('en')}`,
                    `> 🔃 Updated: <t:${Math.round(Date.now() / 1000)}:R>`,
                ].join('\n')
            );

            const container = new ContainerBuilder()
                .addTextDisplayComponents(header)
                .addSeparatorComponents((separator) =>
                    separator.setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(history)
                .addSeparatorComponents((separator) =>
                    separator.setSpacing(SeparatorSpacingSize.Small)
                );

            await interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
            });
        } catch (_error) {
            await RagnarokComponent(
                interaction,
                'Error',
                'An error occurred while processing your request.'
            );
        }
    }
}
