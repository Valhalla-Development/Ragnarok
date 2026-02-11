import type {
    ButtonInteraction,
    CommandInteraction,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
} from 'discord.js';
import type { HydratedDocument } from 'mongoose';
import Balance, { type BalanceInterface } from '../../mongo/Balance.js';
import { ecoPrices } from './Config.js';

export type BalanceDoc = HydratedDocument<BalanceInterface>;

type AnyInteraction =
    | CommandInteraction
    | ButtonInteraction
    | ModalSubmitInteraction
    | StringSelectMenuInteraction
    | UserSelectMenuInteraction;

/**
 * Fetches or creates a Balance profile for a user in a guild.
 * Seeds basic fields and applies schema defaults.
 */
export async function getOrCreateBalance(
    interaction: AnyInteraction,
    userId = interaction.user.id,
    guildId = interaction.guild!.id
): Promise<BalanceDoc> {
    const idJoined = `${userId}-${guildId}`;

    const balance = await Balance.findOneAndUpdate(
        { IdJoined: idJoined },
        {
            $setOnInsert: {
                IdJoined: idJoined,
                UserId: userId,
                GuildId: guildId,
                Cash: 0,
                Bank: 500,
                Total: 500,
                ClaimNewUser: Date.now() + ecoPrices.claims.newUserTime,
            },
        },
        {
            upsert: true,
            returnDocument: 'after',
            setDefaultsOnInsert: true,
        }
    );

    return balance as BalanceDoc;
}
