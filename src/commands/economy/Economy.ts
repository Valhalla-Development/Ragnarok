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
import { getOrCreateBalance } from '../../utils/economy/Profile.js';
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
                'Session expired. Please run /economy again to refresh your controls.',
                true
            );
            return;
        }

        const button = interaction.customId.split('_');

        const actionMap = new Map([
            ['home', async () => this.instance?.home(interaction)],
            ['baltop', async () => this.instance?.baltop(interaction)],
            ['deposit', async () => this.instance?.deposit(interaction)],
            ['withdraw', async () => this.instance?.withdraw(interaction)],
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
                'Session expired. Please run /economy again to refresh your controls.',
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

    @ModalComponent({ id: 'economy_withdraw_modal' })
    async withdrawModal(interaction: ModalSubmitInteraction): Promise<void> {
        if (!this.instance) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Session expired. Please run /economy again to refresh your controls.',
                true
            );
            return;
        }

        if (this.user !== interaction.user.id) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Only the command executor can submit this form.',
                true
            );
            return;
        }

        const amountInput = interaction.fields.getTextInputValue('withdrawAmount');
        const amount = Number(amountInput.replace(/,/g, ''));
        await this.instance.processWithdraw(interaction, amount);
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
                'Session expired. Please run /economy again to refresh your controls.',
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

        // Heist mechanics
        const authorBalance = await getOrCreateBalance(interaction);
        const targetBalance = await getOrCreateBalance(
            interaction,
            selectedUser.id,
            interaction.guild!.id
        );

        if (!authorBalance) {
            await RagnarokComponent(
                interaction,
                'Error',
                'You do not have an economy profile yet. Start chatting to create one.',
                true
            );
            return;
        }

        if (!targetBalance) {
            await RagnarokComponent(
                interaction,
                'Error',
                `${selectedUser} does not have an economy account. They will get one automatically when they speak.`,
                true
            );
            return;
        }

        const now = Date.now();
        if (authorBalance.StealCool && now < authorBalance.StealCool) {
            await RagnarokComponent(
                interaction,
                'Error',
                `Please wait <t:${Math.round(authorBalance.StealCool / 1000)}:R> before attempting another heist.`,
                true
            );
            return;
        }

        if (targetBalance.Cash < 10) {
            await RagnarokComponent(
                interaction,
                'Error',
                'The targeted user does not have enough cash to steal!',
                true
            );
            return;
        }

        const successChance = Math.random() < 0.75;
        const successMessages = [
            `You held ${selectedUser} at gun-point and stole <:coin:706659001164628008>`,
            `You stabbed ${selectedUser} and took <:coin:706659001164628008>`,
            `You tricked ${selectedUser} into giving you <:coin:706659001164628008>`,
            `You pick-pocketed ${selectedUser} and snagged <:coin:706659001164628008>`,
            `You pulled off a daring heist on ${selectedUser} and secured <:coin:706659001164628008>`,
            `You hacked ${selectedUser}'s wallet and siphoned <:coin:706659001164628008>`,
        ];

        const failMessages = [
            `${selectedUser} over-powered you and took <:coin:706659001164628008>`,
            `${selectedUser} knew karate and reversed the mugging, costing you <:coin:706659001164628008>`,
            `You were outsmarted by ${selectedUser} and lost <:coin:706659001164628008>`,
            `${selectedUser} had backup and you dropped <:coin:706659001164628008> while fleeing`,
            `You slipped up and ${selectedUser} nabbed <:coin:706659001164628008> from you`,
        ];

        if (successChance) {
            const maxPerc = (targetBalance.Cash * 85) / 100;
            const minPerc = (targetBalance.Cash * 35) / 100;
            const stealAmount =
                Math.floor(Math.random() * (maxPerc - minPerc + 1)) + Math.floor(minPerc);

            targetBalance.Cash -= stealAmount;
            targetBalance.Total -= stealAmount;

            authorBalance.Cash += stealAmount;
            authorBalance.Total += stealAmount;
            authorBalance.StealCool = now + 120_000; // 2 minutes

            await targetBalance.save();
            await authorBalance.save();

            const msg =
                successMessages[Math.floor(Math.random() * successMessages.length)] +
                ` \`${stealAmount.toLocaleString('en')}\`.`;

            await RagnarokComponent(interaction, 'Success', msg, true);
        } else {
            const bank = authorBalance.Bank ?? 0;
            const maxPerc = (bank * 10) / 100;
            const minPerc = (bank * 5) / 100;
            const lossAmount =
                bank > 0
                    ? Math.max(
                          0,
                          Math.floor(Math.random() * (maxPerc - minPerc + 1)) + Math.floor(minPerc)
                      )
                    : 0;

            targetBalance.Bank += lossAmount;
            targetBalance.Total += lossAmount;

            authorBalance.Bank -= lossAmount;
            authorBalance.Total -= lossAmount;
            authorBalance.StealCool = now + 240_000; // 4 minutes

            await targetBalance.save();
            await authorBalance.save();

            const msg =
                failMessages[Math.floor(Math.random() * failMessages.length)] +
                (lossAmount > 0
                    ? ` \`${lossAmount.toLocaleString('en')}\`.`
                    : ' but you had no funds to lose.');

            await RagnarokComponent(interaction, 'Error', msg, true);
        }
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
                'Session expired. Please run /economy again to refresh your controls.',
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
