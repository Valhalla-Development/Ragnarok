import { Category } from '@discordx/utilities';
import {
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    type CommandInteraction,
    ContainerBuilder,
    MessageFlags,
    type ModalSubmitInteraction,
    SeparatorSpacingSize,
    type StringSelectMenuInteraction,
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
import { clearEconomyViewTimer } from '../../utils/economy/SessionTimers.js';
import { RagnarokComponent } from '../../utils/Util.js';

@Discord()
@Category('Economy')
export class EconomyCommand {
    private readonly sessions = new Map<string, Economy>();

    /**
     * Access to the economy module.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'Access to the economy module' })
    async economy(interaction: CommandInteraction): Promise<void> {
        const economyInstance = new Economy(interaction.user.id);
        this.sessions.set(interaction.user.id, economyInstance);

        await economyInstance.home(interaction);
    }

    /**
     * Fetch the selected page
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @ButtonComponent({ id: /^economy_.*/ })
    async buttonInteraction(interaction: ButtonInteraction, client: Client) {
        clearEconomyViewTimer(interaction.message?.id);

        const customIdParts = interaction.customId.split('_');
        const userId = customIdParts.at(-1);

        if (userId !== interaction.user.id) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Only the command executor can select an option.',
                true
            );
            return;
        }

        const instance = this.sessions.get(userId);

        if (!instance) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Session expired. Please run /economy again to refresh your controls.',
                true
            );
            return;
        }

        if (interaction.customId.startsWith('economy_plant_confirm')) {
            await instance.processPlant(interaction);
            return;
        }
        if (interaction.customId.startsWith('economy_shop_confirm')) {
            await instance.processShopConfirm(interaction);
            return;
        }

        if (interaction.customId.startsWith('economy_shop_mode_')) {
            const mode = customIdParts[3]; // economy_shop_mode_buy_userId
            if (mode === 'buy' || mode === 'sell' || mode === 'upgrade') {
                await instance.setShopMode(interaction, mode as 'buy' | 'sell' | 'upgrade');
                return;
            }
        }

        const button = customIdParts[1];
        if (!button) {
            return;
        }

        const actionMap = new Map([
            ['home', async () => instance.home(interaction)],
            ['baltop', async () => instance.baltop(interaction)],
            ['deposit', async () => instance.deposit(interaction)],
            ['withdraw', async () => instance.withdraw(interaction)],
            ['claim', async () => instance.claim(interaction)],
            ['items', async () => instance.items(interaction)],
            ['gamble', async () => instance.gamble(interaction)],
            [
                'coinflip',
                async () => {
                    await instance.coinflip(interaction, client, null, customIdParts[2] || null);
                },
            ],
            ['heist', async () => instance.heist(interaction)],
            ['farm', async () => instance.farm(interaction, client)],
            ['fish', async () => instance.fish(interaction, client)],
            ['harvest', async () => instance.harvest(interaction, client)],
            ['shop', async () => instance.shop(interaction)],
            ['plant', async () => instance.plant(interaction)],
        ]);

        const selectedAction = actionMap.get(button);

        if (selectedAction) {
            await selectedAction();
        }
    }

    /**
     * Handles modal submit event
     * @param interaction - The ModalSubmitInteraction object that represents the user's interaction with the modal.
     * @param client - The Discord client.
     */
    @ModalComponent({ id: /^coinflipAmount/ })
    async modalSubmit(interaction: ModalSubmitInteraction, client: Client): Promise<void> {
        clearEconomyViewTimer(interaction.message?.id);

        const customIdParts = interaction.customId.split('_');
        const userId = customIdParts.at(-1);

        if (userId !== interaction.user.id) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Only the command executor can submit this form.',
                true
            );
            return;
        }

        const instance = this.sessions.get(userId);

        if (!instance) {
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
        await instance.coinflip(interaction, client, amount);
        await interaction.deleteReply();
    }

    @ModalComponent({ id: /^economy_withdraw_modal_.*/ })
    async withdrawModal(interaction: ModalSubmitInteraction): Promise<void> {
        clearEconomyViewTimer(interaction.message?.id);

        const customIdParts = interaction.customId.split('_');
        const userId = customIdParts.at(-1);

        if (userId !== interaction.user.id) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Only the command executor can submit this form.',
                true
            );
            return;
        }

        const instance = this.sessions.get(userId);

        if (!instance) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Session expired. Please run /economy again to refresh your controls.',
                true
            );
            return;
        }

        const amountInput = interaction.fields.getTextInputValue('withdrawAmount');
        const amount = Number(amountInput.replace(/,/g, ''));
        await instance.processWithdraw(interaction, amount);
    }

    @SelectMenuComponent({ id: /^economy_shop_action_select_.*/ })
    async onShopActionSelect(interaction: StringSelectMenuInteraction): Promise<void> {
        clearEconomyViewTimer(interaction.message?.id);

        const customIdParts = interaction.customId.split('_');
        const userId = customIdParts.at(-1);

        if (userId !== interaction.user.id) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Only the command executor can select an option.',
                true
            );
            return;
        }

        const instance = this.sessions.get(userId);

        if (!instance) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Session expired. Please run /economy again to refresh your controls.',
                true
            );
            return;
        }

        const selected = interaction.values[0];
        if (!selected) {
            await instance.shop(interaction, 'No option selected.');
            return;
        }
        await instance.processShopAction(interaction, selected);
    }

    @SelectMenuComponent({ id: /^economy_shop_qty_select_.*/ })
    async onShopQuantitySelect(interaction: StringSelectMenuInteraction): Promise<void> {
        clearEconomyViewTimer(interaction.message?.id);

        const customIdParts = interaction.customId.split('_');
        const userId = customIdParts.at(-1);

        if (userId !== interaction.user.id) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Only the command executor can select an option.',
                true
            );
            return;
        }

        const instance = this.sessions.get(userId);

        if (!instance) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Session expired. Please run /economy again to refresh your controls.',
                true
            );
            return;
        }

        const selected = interaction.values[0];
        if (!selected) {
            await instance.shop(interaction);
            return;
        }
        await instance.setShopQuantity(interaction, selected);
    }

    @SelectMenuComponent({ id: /^economy_plant_crop_select_.*/ })
    async onPlantCropSelect(interaction: StringSelectMenuInteraction): Promise<void> {
        clearEconomyViewTimer(interaction.message?.id);

        const customIdParts = interaction.customId.split('_');
        const userId = customIdParts.at(-1);

        if (userId !== interaction.user.id) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Only the command executor can select an option.',
                true
            );
            return;
        }

        const instance = this.sessions.get(userId);

        if (!instance) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Session expired. Please run /economy again to refresh your controls.',
                true
            );
            return;
        }

        const selected = interaction.values[0];
        if (!(selected && ['corn', 'wheat', 'potato', 'tomato'].includes(selected))) {
            await instance.plant(interaction, 'Invalid crop selection.');
            return;
        }
        await instance.setPlantCrop(
            interaction,
            selected as 'corn' | 'wheat' | 'potato' | 'tomato'
        );
    }

    @SelectMenuComponent({ id: /^economy_plant_amount_select_.*/ })
    async onPlantAmountSelect(interaction: StringSelectMenuInteraction): Promise<void> {
        clearEconomyViewTimer(interaction.message?.id);

        const customIdParts = interaction.customId.split('_');
        const userId = customIdParts.at(-1);

        if (userId !== interaction.user.id) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Only the command executor can select an option.',
                true
            );
            return;
        }

        const instance = this.sessions.get(userId);

        if (!instance) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Session expired. Please run /economy again to refresh your controls.',
                true
            );
            return;
        }

        const selected = interaction.values[0];
        if (!selected) {
            await instance.plant(interaction);
            return;
        }
        await instance.setPlantAmount(interaction, selected);
    }

    /**
     * Handles heist target selection
     * @param interaction - The UserSelectMenuInteraction object
     * @param client - The Discord client
     */
    @SelectMenuComponent({ id: /^heist_target_select_.*/ })
    async heistTargetSelect(interaction: UserSelectMenuInteraction): Promise<void> {
        clearEconomyViewTimer(interaction.message?.id);

        const customIdParts = interaction.customId.split('_');
        const userId = customIdParts.at(-1);

        if (userId !== interaction.user.id) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Only the command executor can select a target.',
                true
            );
            return;
        }

        const instance = this.sessions.get(userId);

        if (!instance) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Session expired. Please run /economy again to refresh your controls.',
                true
            );
            return;
        }

        const economyInstance = instance;

        const showHeistResult = async (statusLabel: string, statusMessage: string) => {
            const resultContainer = new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## 🏴‍☠️ ${statusLabel}`)
                )
                .addSeparatorComponents((separator) =>
                    separator.setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> ${statusMessage}`))
                .addSeparatorComponents((separator) =>
                    separator.setSpacing(SeparatorSpacingSize.Small)
                )
                .addActionRowComponents((row) =>
                    row.addComponents(
                        ButtonBuilder.from(economyInstance.homeButton.toJSON())
                            .setDisabled(false)
                            .setStyle(ButtonStyle.Primary)
                    )
                );

            await interaction.deferReply();
            await interaction.deleteReply();

            if (!interaction.message) {
                return;
            }

            await interaction.message.edit({
                components: [resultContainer],
                files: [],
                flags: MessageFlags.IsComponentsV2,
            });
        };

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

        if (Number(targetBalance.Cash ?? 0) < 10) {
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
            `You held ${selectedUser} at gun-point and stole 💰`,
            `You stabbed ${selectedUser} and took 💰`,
            `You tricked ${selectedUser} into giving you 💰`,
            `You pick-pocketed ${selectedUser} and snagged 💰`,
            `You pulled off a daring heist on ${selectedUser} and secured 💰`,
            `You hacked ${selectedUser}'s wallet and siphoned 💰`,
        ];

        const failMessages = [
            `${selectedUser} over-powered you and took 💰`,
            `${selectedUser} knew karate and reversed the mugging, costing you 💰`,
            `You were outsmarted by ${selectedUser} and lost 💰`,
            `${selectedUser} had backup and you dropped 💰 while fleeing`,
            `You slipped up and ${selectedUser} nabbed 💰 from you`,
        ];

        if (successChance) {
            const targetCash = Number(targetBalance.Cash ?? 0);
            const maxPerc = (targetCash * 85) / 100;
            const minPerc = (targetCash * 35) / 100;
            const stealAmount =
                Math.floor(Math.random() * (maxPerc - minPerc + 1)) + Math.floor(minPerc);

            targetBalance.Cash = targetCash - stealAmount;
            targetBalance.Total = Number(targetBalance.Total ?? 0) - stealAmount;

            const hasAutoDeposit = Boolean(authorBalance.Boosts?.AutoDeposit);
            if (hasAutoDeposit) {
                authorBalance.Bank = Number(authorBalance.Bank ?? 0) + stealAmount;
            } else {
                authorBalance.Cash = Number(authorBalance.Cash ?? 0) + stealAmount;
            }
            authorBalance.Total = Number(authorBalance.Total ?? 0) + stealAmount;
            authorBalance.StealCool = now + 120_000; // 2 minutes

            await targetBalance.save();
            await authorBalance.save();

            const msg =
                successMessages[Math.floor(Math.random() * successMessages.length)] +
                ` \`${stealAmount.toLocaleString('en')}\`.` +
                (hasAutoDeposit ? ' Auto-deposited to bank.' : '');

            await showHeistResult('Heist Victory', `✅ ${msg}`);
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

            targetBalance.Bank = Number(targetBalance.Bank ?? 0) + lossAmount;
            targetBalance.Total = Number(targetBalance.Total ?? 0) + lossAmount;

            authorBalance.Bank = bank - lossAmount;
            authorBalance.Total = Number(authorBalance.Total ?? 0) - lossAmount;
            authorBalance.StealCool = now + 240_000; // 4 minutes

            await targetBalance.save();
            await authorBalance.save();

            const msg =
                failMessages[Math.floor(Math.random() * failMessages.length)] +
                (lossAmount > 0
                    ? ` \`${lossAmount.toLocaleString('en')}\`.`
                    : ' but you had no funds to lose.');

            await showHeistResult('Heist Defeat', `❌ ${msg}`);
        }
    }
}
