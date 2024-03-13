import {
    ButtonComponent, Client, Discord, ModalComponent, Slash,
} from 'discordx';
import { ButtonInteraction, CommandInteraction, ModalSubmitInteraction } from 'discord.js';
import { Category } from '@discordx/utilities';
import { Economy } from '../../utils/Economy.js';
import { RagnarokEmbed } from '../../utils/Util.js';

@Discord()
@Category('Economy')
export class EconomyCommand {
    private coinflipAmount: string | null = null;

    private instance: Economy | null = null;

    /**
     * Access to the economy module.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'Access to the economy module' })
    async economy(interaction: CommandInteraction, client: Client): Promise<void> {
        const economyInstance = new Economy();
        this.instance = economyInstance;

        await economyInstance.home(interaction, client);
    }

    /**
     * Fetch the selected page
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @ButtonComponent({ id: /^economy_.*/ })
    async buttonInteraction(interaction: ButtonInteraction, client: Client) {
        if (!this.instance) {
            await RagnarokEmbed(client, interaction, 'Error', 'An error occurred, please try running the economy command again.', true);
            return;
        }

        const button = interaction.customId.split('_');

        const actionMap = new Map([
            ['home', async () => this.instance?.home(interaction, client)],
            ['baltop', async () => this.instance?.baltop(interaction, client)],
            ['deposit', async () => this.instance?.deposit(interaction, client)],
            ['claim', async () => this.instance?.claim(interaction, client)],
            ['coinflip', async () => {
                await this.instance?.coinflip(interaction, client, button[2] ? this.coinflipAmount : null, button[2] || null);
            }],
        ]);

        const selectedAction = actionMap.get(button[1]);

        if (selectedAction) {
            await selectedAction();
        }
    }

    /**
     * Handles modal submit event
     * @param interaction - The ModalSubmitInteraction object that represents the user's interaction with the modal.
     * @param client - The Discord client.
     */
    @ModalComponent({ id: 'coinflipAmount' })
    async modalSubmit(interaction: ModalSubmitInteraction, client: Client): Promise<void> {
        if (!this.instance) {
            await RagnarokEmbed(client, interaction, 'Error', 'An error occurred, please try running the economy command again.', true);
            return;
        }

        await interaction.deferReply();
        const amount = interaction.fields.getTextInputValue('amountField');
        this.coinflipAmount = amount;
        await this.instance.coinflip(interaction, client, amount);
        await interaction.deleteReply();
    }
}
