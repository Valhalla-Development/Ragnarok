import {
    Client, Discord, Slash, SlashOption,
} from 'discordx';
import { ApplicationCommandOptionType, CommandInteraction, GuildMember } from 'discord.js';
import { Category } from '@discordx/utilities';
import Balance from '../../mongo/Balance.js';
import { RagnarokEmbed } from '../../utils/Util.js';

@Discord()
@Category('Economy')
export class Give {
    /**
     * Give money to specified user from your Bank
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param user - User to give money to
     * @param amount - Amount to give the user
     */
    @Slash({ description: 'Give money to specified user from your Bank' })
    async give(
        @SlashOption({
            description: 'User to give money to',
            name: 'user',
            type: ApplicationCommandOptionType.User,
            required: true,
        })
            user: GuildMember,
        @SlashOption({
            description: 'Amount to give the user',
            name: 'amount',
            type: ApplicationCommandOptionType.Number,
            required: true,
            minValue: 10,
        })
            amount: number,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        const balance = await Balance.findOneAndUpdate(
            { IdJoined: `${interaction.user.id}-${interaction.guild!.id}` },
            { $setOnInsert: { IdJoined: `${interaction.user.id}-${interaction.guild!.id}` } },
            {
                upsert: true,
                new: true,
            },
        );

        const otherB = await Balance.findOneAndUpdate(
            { IdJoined: `${user.id}-${interaction.guild!.id}` },
            { $setOnInsert: { IdJoined: `${user.id}-${interaction.guild!.id}` } },
            {
                upsert: true,
                new: true,
            },
        );

        if (!balance) {
            await RagnarokEmbed(client, interaction, 'Error', 'An error occurred, please try again.', true);
            return;
        }

        if (user.id === interaction.user.id) {
            await RagnarokEmbed(client, interaction, 'Error', 'You can\'t give yourself money. <:wut:745408596233289839>', true);
            return;
        }

        if (!otherB) {
            await RagnarokEmbed(client, interaction, 'Error', `${user} does not have an economy account. They will instantly open one when they send a message within this guild.`, true);
            return;
        }

        if (balance.Bank === 0) {
            await RagnarokEmbed(client, interaction, 'Error', 'You only have <:coin:706659001164628008>', true);
            return;
        }

        if (amount > balance.Bank) {
            await RagnarokEmbed(client, interaction, 'Error', `\`${balance.Bank.toLocaleString('en')}\`\nPlease try again with a valid amount.`, true);
            return;
        }

        otherB.Bank += amount;
        otherB.Total += amount;
        await otherB.save();

        balance.Bank -= amount;
        balance.Total -= amount;
        await balance.save();

        await RagnarokEmbed(client, interaction, 'Success', `You have paid ${user} the sum of: <:coin:706659001164628008> \`${amount.toLocaleString('en')}\``);
    }
}
