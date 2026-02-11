import { Category } from '@discordx/utilities';
import { ApplicationCommandOptionType, type CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { getOrCreateBalance } from '../../utils/economy/Profile.js';
import { RagnarokComponent } from '../../utils/Util.js';

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
        interaction: CommandInteraction
    ): Promise<void> {
        const balance = await getOrCreateBalance(interaction);

        if (!balance?.Bank) {
            await RagnarokComponent(
                interaction,
                'Error',
                'You do not have enough money in your bank for this action.',
                true
            );
            return;
        }

        if (amount > balance.Bank) {
            await RagnarokComponent(
                interaction,
                'Error',
                `You only have 💰 \`${balance.Bank.toLocaleString('en')}\`. Please try again with a valid amount.`,
                true
            );
            return;
        }

        balance.Cash += amount;
        balance.Bank -= amount;
        await balance.save();

        await RagnarokComponent(
            interaction,
            'Success',
            `You have withdrawn 💰 \`${amount.toLocaleString('en')}\``,
            true
        );
    }
}
