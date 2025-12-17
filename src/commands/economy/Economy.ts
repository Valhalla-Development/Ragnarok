import { Category } from '@discordx/utilities';
import {
    type ButtonInteraction,
    type CommandInteraction,
    ContainerBuilder,
    MessageFlags,
    type ModalSubmitInteraction,
    TextDisplayBuilder,
    type UserSelectMenuInteraction,
} from 'discord.js';
import {
    ButtonComponent,
    type Client,
    Discord,
    ModalComponent,
    SelectMenuComponent,
    Slash,
} from 'discordx';
import { Economy } from '../../utils/Economy.js';
import { RagnarokComponent } from '../../utils/Util.js';

@Discord()
@Category('Economy')
export class EconomyCommand {
    private coinflipAmount: string | null = null;

    private instance: Economy | null = null;

    private user: string | null = null;

    /**
     * Access to the economy module.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'Access to the economy module' })
    async economy(interaction: CommandInteraction): Promise<void> {
        const economyInstance = new Economy();
        this.instance = economyInstance;
        this.user = interaction.user.id;

        await economyInstance.home(interaction);
    }

    /**
     * Fetch the selected page
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @ButtonComponent({ id: /^economy_.*/ })
    async buttonInteraction(interaction: ButtonInteraction, client: Client) {
        if (this.user !== interaction.user.id) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Only the command executor can select an option.',
                true
            );
            return;
        }

        if (!this.instance) {
            await RagnarokComponent(
                interaction,
                'Error',
                'An error occurred, please try running the economy command again.',
                true
            );
            return;
        }

        const button = interaction.customId.split('_');

        const actionMap = new Map([
            ['home', async () => this.instance?.home(interaction)],
            ['baltop', async () => this.instance?.baltop(interaction)],
            ['deposit', async () => this.instance?.deposit(interaction)],
            ['claim', async () => this.instance?.claim(interaction)],
            ['items', async () => this.instance?.items(interaction)],
            [
                'coinflip',
                async () => {
                    await this.instance?.coinflip(
                        interaction,
                        client,
                        button[2] ? this.coinflipAmount : null,
                        button[2] || null
                    );
                },
            ],
            ['heist', async () => this.instance?.heist(interaction)],
            ['farm', async () => this.instance?.farm(interaction, client)],
            ['fish', async () => this.instance?.fish(interaction, client)],
            ['harvest', async () => this.instance?.harvest(interaction, client)],
        ]);

        const selectedAction = actionMap.get(button[1] as string);

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
            await RagnarokComponent(
                interaction,
                'Error',
                'An error occurred, please try running the economy command again.',
                true
            );
            return;
        }

        await interaction.deferReply();
        const amount = interaction.fields.getTextInputValue('amountField');
        this.coinflipAmount = amount;
        await this.instance.coinflip(interaction, client, amount);
        await interaction.deleteReply();
    }

    /**
     * Handles heist target selection
     * @param interaction - The UserSelectMenuInteraction object
     * @param client - The Discord client
     */
    @SelectMenuComponent({ id: 'heist_target_select' })
    async heistTargetSelect(interaction: UserSelectMenuInteraction): Promise<void> {
        if (!this.instance) {
            await RagnarokComponent(
                interaction,
                'Error',
                'An error occurred, please try running the economy command again.',
                true
            );
            return;
        }

        if (this.user !== interaction.user.id) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Only the command executor can select a target.',
                true
            );
            return;
        }

        const selectedUser = interaction.users.first();
        if (!selectedUser) {
            await RagnarokComponent(interaction, 'Error', 'No user selected.', true);
            return;
        }

        if (selectedUser.id === interaction.user.id) {
            await RagnarokComponent(
                interaction,
                'Error',
                "You can't target yourself in a heist!",
                true
            );
            return;
        }

        if (selectedUser.bot) {
            await RagnarokComponent(
                interaction,
                'Error',
                "You can't target bots in a heist!",
                true
            );
            return;
        }

        // TODO: Implement heist mechanics
    }

    /**
     * Handles baltop navigation
     * @param interaction - The ButtonInteraction object
     * @param client - The Discord client
     */
    @ButtonComponent({ id: /^baltop:nav:.+$/ })
    async baltopNavigate(interaction: ButtonInteraction): Promise<void> {
        if (!this.instance) {
            await RagnarokComponent(
                interaction,
                'Error',
                'An error occurred, please try running the economy command again.',
                true
            );
            return;
        }

        const parts = interaction.customId.split(':');
        // Format: ['baltop','nav','<dir>','<guildId>','<page>']
        if (parts.length < 5) {
            await interaction.update({
                components: [
                    new ContainerBuilder().addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('❌ Invalid navigation data.')
                    ),
                ],
                flags: MessageFlags.IsComponentsV2,
            });
            return;
        }

        const guildId = parts[3]!;
        const pageStr = parts[4]!;

        if (guildId !== interaction.guild!.id) {
            return;
        }

        const page = Number.parseInt(pageStr, 10);
        const { handleBaltop } = await import('../../utils/economy/Leaderboard.js');
        await handleBaltop(interaction, this.instance.homeButton, Number.isNaN(page) ? 0 : page);
    }
}
