import { Category } from '@discordx/utilities';
import { ApplicationCommandOptionType, type CommandInteraction } from 'discord.js';
import { type Client, Discord, Slash, SlashOption } from 'discordx';
import Balance from '../../mongo/Balance.js';
import { RagnarokEmbed } from '../../utils/Util.js';

@Discord()
@Category('Economy')
export class Withdraw {
    /**
     * Withdraw money from the bank
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param amount - Amount to withdraw
     */
    @Slash({ description: 'Withdraw money from the bank' })
    async withdraw(
        @SlashOption({
            description: 'Amount to withdraw',
            name: 'amount',
            type: ApplicationCommandOptionType.Number,
            required: true,
            minValue: 10,
        })
        amount: number,
        interaction: CommandInteraction,
        client: Client
    ): Promise<void> {
        const balance = await Balance.findOneAndUpdate(
            { IdJoined: `${interaction.user.id}-${interaction.guild!.id}` },
            { $setOnInsert: { IdJoined: `${interaction.user.id}-${interaction.guild!.id}` } },
            {
                upsert: true,
                new: true,
            }
        );

        if (!balance?.Bank) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'You do not have enough money in your bank for this action.',
                true
            );
            return;
        }

        if (amount > balance.Bank) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                `You only have <:coin:706659001164628008> \`${balance.Bank.toLocaleString('en')}\`. Please try again with a valid amount.`,
                true
            );
            return;
        }

        balance.Cash += amount;
        balance.Bank -= amount;
        await balance.save();

        await RagnarokEmbed(
            client,
            interaction,
            'Success',
            `You have withdrawn <:coin:706659001164628008> \`${amount.toLocaleString('en')}\``,
            true
        );
    }
}
