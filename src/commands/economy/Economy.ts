import {
    ButtonComponent, Client, Discord, ModalComponent, Slash,
} from 'discordx';
import { ButtonInteraction, CommandInteraction, ModalSubmitInteraction } from 'discord.js';
import { Category } from '@discordx/utilities';
import {
    baltop, claim, coinflip, deposit, home,
} from '../../utils/Economy.js';

@Discord()
@Category('Economy')
export class Economy {
    private coinflipAmount: string | null = null;

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

        const actionMap = new Map([
            ['home', async () => home(interaction, client)],
            ['baltop', async () => baltop(interaction, client)],
            ['deposit', async () => deposit(interaction, client)],
            ['claim', async () => claim(interaction, client)],
        ]);

        const selectedAction = actionMap.get(button[1]);

        if (selectedAction) {
            await selectedAction();
        }

        if (button[1] === 'coinflip') {
            await coinflip(interaction, client, button[2] ? this.coinflipAmount : null, button[2] || null);
        }
    }

    /**
     * Handles modal submit event
     * @param interaction - The ModalSubmitInteraction object that represents the user's interaction with the modal.
     * @param client - The Discord client.
     */
    @ModalComponent({ id: 'coinflipAmount' })
    async modalSubmit(interaction: ModalSubmitInteraction, client: Client): Promise<void> {
        await interaction.deferReply();
        const amount = interaction.fields.getTextInputValue('amountField');
        this.coinflipAmount = amount;
        await coinflip(interaction, client, amount);
        await interaction.deleteReply();
    }
}
