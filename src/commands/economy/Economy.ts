import {
    ButtonComponent, Client, Discord, Slash,
} from 'discordx';
import { ButtonInteraction, CommandInteraction } from 'discord.js';
import { Category } from '@discordx/utilities';
import { home } from '../../utils/Economy.js';

@Discord()
@Category('Economy')
export class Economy {
    /**
     * Access to the economy module.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'Access to the economy module' })
    async economy(interaction: CommandInteraction, client: Client): Promise<void> {
        await home(interaction, client);
    }

    /**
     * Fetch the selected page
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @ButtonComponent({ id: /^economy_.*/ })
    async buttonInteraction(interaction: ButtonInteraction, client: Client) {
        const button = interaction.customId.split('_');

        if (button[1] === 'home') await home(interaction, client);
    }
}
