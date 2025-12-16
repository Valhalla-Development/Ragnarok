import { Category } from '@discordx/utilities';
import {
    ApplicationCommandOptionType,
    ChannelType,
    type CommandInteraction,
    codeBlock,
    PermissionsBitField,
} from 'discord.js';
import { type Client, Discord, Guard, Slash, SlashOption } from 'discordx';
import { BotHasPerm } from '../../guards/BotHasPerm.js';
import { RagnarokEmbed } from '../../utils/Util.js';

@Discord()
@Category('Moderation')
export class Purge {
    /**
     * Deletes specified number of messages from the channel
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param amount - The number of messages to delete
     */
    @Slash({
        description: 'Deletes specified number of messages from the channel',
        defaultMemberPermissions: [PermissionsBitField.Flags.ManageMessages],
    })
    @Guard(BotHasPerm([PermissionsBitField.Flags.ManageMessages]))
    async purge(
        @SlashOption({
            description: 'Amount of messages to delete',
            name: 'amount',
            required: true,
            type: ApplicationCommandOptionType.Number,
            minValue: 1,
            maxValue: 50,
        })
        amount: number,
        interaction: CommandInteraction,
        client: Client
    ): Promise<void> {
        if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
            return;
        }

        try {
            const fetch = await interaction.channel.messages.fetch({ limit: Number(amount) });
            await interaction.channel.bulkDelete(fetch, true);

            await RagnarokEmbed(
                client,
                interaction,
                'Success',
                `${Number(amount)} message${Number(amount) > 1 ? 's were' : ' was'} removed.`,
                true
            );
        } catch (error) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                `An error occurred\n${codeBlock('text', `${error}`)}`,
                true
            );
        }
    }
}
