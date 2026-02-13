import {
    ActionRowBuilder,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    type CommandInteraction,
    ContainerBuilder,
    MessageFlags,
    ModalBuilder,
    type ModalSubmitInteraction,
    SeparatorSpacingSize,
    StringSelectMenuBuilder,
    type StringSelectMenuInteraction,
    TextDisplayBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import '@colors/colors';
import type { Client } from 'discordx';
import { handleDeposit, handleWithdraw } from './economy/Bank.js';
import { handleClaim } from './economy/Claims.js';
import { ecoPrices } from './economy/Config.js';
import { handleFarm } from './economy/Farm.js';
import { handleFish } from './economy/Fish.js';
import { handleCoinflip } from './economy/Gamble.js';
import { showGambleMenu } from './economy/GambleMenu.js';
import { handleHarvest } from './economy/Harvest.js';
import { handleHeist } from './economy/Heist.js';
import { handleHome } from './economy/Home.js';
import { handleItems } from './economy/Items.js';
import { handleBaltop } from './economy/Leaderboard.js';
import { type CropType, runPlantAction } from './economy/PlantService.js';
import { getOrCreateBalance } from './economy/Profile.js';
import { runShopAction, type ShopItem, type ShopMode } from './economy/ShopService.js';

export class Economy {
    homeButton: ButtonBuilder;
    baltopButton: ButtonBuilder;
    claimButton: ButtonBuilder;
    depositButton: ButtonBuilder;
    withdrawButton: ButtonBuilder;
    gambleButton: ButtonBuilder;
    coinflipButton: ButtonBuilder;
    heistButton: ButtonBuilder;
    farmButton: ButtonBuilder;
    fishButton: ButtonBuilder;
    harvestButton: ButtonBuilder;
    itemsButton: ButtonBuilder;
    shopButton: ButtonBuilder;
    plantButton: ButtonBuilder;
    rows: ActionRowBuilder<ButtonBuilder>[] = [];
    homeContainer: ContainerBuilder | null = null;
    private shopQuantity = 1;
    private shopMode: ShopMode = 'buy';
    private selectedShopItem: ShopItem | null = null;
    private selectedCrop: CropType = 'corn';
    private selectedPlantAmount = 1;
    userId: string;
    coinflipAmount: string | null = null;

    constructor(userId: string) {
        this.userId = userId;

        this.homeButton = new ButtonBuilder()
            .setEmoji('↩️')
            .setLabel('Back')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`economy_home_${userId}`);

        this.baltopButton = new ButtonBuilder()
            .setLabel('Leaderboard')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`economy_baltop_${userId}`);

        this.claimButton = new ButtonBuilder()
            .setLabel('Claim Rewards')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`economy_claim_${userId}`);

        this.depositButton = new ButtonBuilder()
            .setLabel('Deposit Cash')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`economy_deposit_${userId}`);

        this.withdrawButton = new ButtonBuilder()
            .setLabel('Withdraw Cash')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`economy_withdraw_${userId}`);

        this.gambleButton = new ButtonBuilder()
            .setLabel('Gamble')
            .setEmoji('🎲')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`economy_gamble_${userId}`);

        this.coinflipButton = new ButtonBuilder()
            .setLabel('Coin Flip')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`economy_coinflip_${userId}`);

        this.heistButton = new ButtonBuilder()
            .setLabel('Start Heist')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`economy_heist_${userId}`);

        this.farmButton = new ButtonBuilder()
            .setLabel('Plant Crops')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`economy_farm_${userId}`);

        this.fishButton = new ButtonBuilder()
            .setLabel('Go Fishing')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`economy_fish_${userId}`);

        this.harvestButton = new ButtonBuilder()
            .setLabel('Harvest Crops')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`economy_harvest_${userId}`);

        this.itemsButton = new ButtonBuilder()
            .setLabel('View Inventory')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`economy_items_${userId}`);

        this.shopButton = new ButtonBuilder()
            .setLabel('Shop')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`economy_shop_${userId}`);

        this.plantButton = new ButtonBuilder()
            .setLabel('Plant')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`economy_plant_${userId}`);

        const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            this.homeButton,
            this.baltopButton,
            this.claimButton,
            this.depositButton,
            this.withdrawButton
        );

        const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            this.gambleButton,
            this.farmButton,
            this.fishButton,
            this.harvestButton,
            this.shopButton
        );

        this.rows.push(row1, row2);

        // Bind methods to class instance
        this.home = this.home.bind(this);
        this.baltop = this.baltop.bind(this);
        this.deposit = this.deposit.bind(this);
        this.claim = this.claim.bind(this);
        this.coinflip = this.coinflip.bind(this);
        this.heist = this.heist.bind(this);
        this.farm = this.farm.bind(this);
        this.fish = this.fish.bind(this);
        this.harvest = this.harvest.bind(this);
        this.items = this.items.bind(this);
        this.withdraw = this.withdraw.bind(this);
        this.processWithdraw = this.processWithdraw.bind(this);
        this.shop = this.shop.bind(this);
        this.processShopAction = this.processShopAction.bind(this);
        this.setShopQuantity = this.setShopQuantity.bind(this);
        this.plant = this.plant.bind(this);
        this.setPlantCrop = this.setPlantCrop.bind(this);
        this.setPlantAmount = this.setPlantAmount.bind(this);
        this.processPlant = this.processPlant.bind(this);
    }

    /**
     * Get the button instances for other modules
     */
    private getButtons() {
        return {
            baltopButton: this.baltopButton,
            gambleButton: this.gambleButton,
            depositButton: this.depositButton,
            heistButton: this.heistButton,
            fishButton: this.fishButton,
            farmButton: this.farmButton,
            itemsButton: this.itemsButton,
            claimButton: this.claimButton,
            withdrawButton: this.withdrawButton,
            shopButton: this.shopButton,
            plantButton: this.plantButton,
            harvestButton: this.harvestButton,
        };
    }

    /**
     * Asynchronously handles the home interaction (Command or Button).
     */
    async home(interaction: CommandInteraction | ButtonInteraction) {
        await handleHome(interaction, this.getButtons());
    }

    /**
     * Asynchronously handles the baltop button interaction.
     */
    async baltop(interaction: ButtonInteraction) {
        await handleBaltop(interaction, this.homeButton);
    }

    /**
     * Asynchronously handles the deposit button interaction.
     */
    async deposit(interaction: ButtonInteraction) {
        await handleDeposit(interaction, this.getButtons());
    }

    /**
     * Displays the withdraw modal so the user can specify an amount.
     */
    async withdraw(interaction: ButtonInteraction) {
        const withdrawModal = new ModalBuilder()
            .setTitle('Withdraw Cash')
            .setCustomId(`economy_withdraw_modal_${this.userId}`);

        const amountField = new TextInputBuilder()
            .setCustomId('withdrawAmount')
            .setLabel('Amount to withdraw')
            .setPlaceholder('100')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        withdrawModal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(amountField)
        );

        await interaction.showModal(withdrawModal);
    }

    /**
     * Processes the withdraw modal submission by updating balances.
     */
    async processWithdraw(interaction: ModalSubmitInteraction, amount: number) {
        await handleWithdraw(interaction, amount, this.getButtons());
    }

    /**
     * Asynchronously handles the claim button interaction.
     */
    async claim(interaction: ButtonInteraction) {
        await handleClaim(interaction, this.claimButton, this.rows, this.getButtons());
    }

    /**
     * Asynchronously handles the coinflip interaction.
     */
    async coinflip(
        interaction: ModalSubmitInteraction | ButtonInteraction,
        client: Client,
        amount: string | null = null,
        option: string | null = null
    ) {
        if (amount) {
            this.coinflipAmount = amount;
        }

        await handleCoinflip(
            interaction,
            client,
            this.coinflipButton,
            this.homeButton,
            this.rows,
            this.getButtons(),
            amount ?? this.coinflipAmount,
            option,
            this.userId
        );
    }

    /**
     * Shows the gambling menu (currently: Coin Flip).
     * Coin flip behavior itself is unchanged; selecting it will run the existing modal-based flow.
     */
    async gamble(interaction: ButtonInteraction): Promise<void> {
        await showGambleMenu(interaction, {
            homeButton: this.homeButton,
            coinflipButton: this.coinflipButton,
        });
    }

    /**
     * Asynchronously handles the farm interaction.
     */
    async farm(interaction: ButtonInteraction, client: Client) {
        await handleFarm(
            interaction,
            client,
            this.farmButton,
            this.homeButton,
            this.rows,
            this.getButtons()
        );
    }

    /**
     * Asynchronously handles the fish interaction.
     */
    async fish(interaction: ButtonInteraction, client: Client) {
        await handleFish(
            interaction,
            client,
            this.fishButton,
            this.homeButton,
            this.rows,
            this.getButtons()
        );
    }

    /**
     * Asynchronously handles the inventory interaction.
     */
    async items(interaction: ButtonInteraction) {
        await handleItems(interaction, this.homeButton);
    }

    /**
     * Asynchronously handles the heist interaction.
     */
    async heist(interaction: ButtonInteraction) {
        await handleHeist(interaction, this.homeButton);
    }

    /**
     * Asynchronously handles the harvest interaction.
     */
    async harvest(interaction: ButtonInteraction, client: Client) {
        await handleHarvest(interaction, client, this.harvestButton, this.homeButton, this.rows);
    }

    async shop(
        interaction: ButtonInteraction | StringSelectMenuInteraction,
        statusMessage: string | null = null
    ): Promise<void> {
        const balance = await getOrCreateBalance(interaction);
        const shopOptions = this.getShopOptionsForMode(balance);
        const hasShopOptions = shopOptions.length > 0;
        const bankBalance = Number(balance.Bank ?? 0).toLocaleString('en');
        const selectedSeedPrice = this.getSelectedSeedPackPrice();
        const showQtyMenu = this.shopMode === 'buy';

        const container = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('# 🛒 Shop'))
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    [
                        `> Mode: \`${this.shopMode}\``,
                        `> Bank: 💰 \`${bankBalance}\``,
                        this.shopMode === 'buy'
                            ? `> Seed pack quantity: \`${this.shopQuantity}\` pack${this.shopQuantity > 1 ? 's' : ''}${
                                  selectedSeedPrice > 0
                                      ? ` (${this.coinFmt(selectedSeedPrice * this.shopQuantity)})`
                                      : ''
                              }`
                            : '',
                        hasShopOptions ? '' : '> Nothing available in this mode right now.',
                        statusMessage ? `> ${statusMessage}` : '',
                    ]
                        .filter(Boolean)
                        .join('\n')
                )
            )
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents((row) =>
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`economy_shop_mode_buy_${this.userId}`)
                        .setLabel('Buy')
                        .setStyle(
                            this.shopMode === 'buy' ? ButtonStyle.Success : ButtonStyle.Primary
                        ),
                    new ButtonBuilder()
                        .setCustomId(`economy_shop_mode_sell_${this.userId}`)
                        .setLabel('Sell')
                        .setStyle(
                            this.shopMode === 'sell' ? ButtonStyle.Success : ButtonStyle.Primary
                        ),
                    new ButtonBuilder()
                        .setCustomId(`economy_shop_mode_upgrade_${this.userId}`)
                        .setLabel('Upgrade')
                        .setStyle(
                            this.shopMode === 'upgrade' ? ButtonStyle.Success : ButtonStyle.Primary
                        )
                )
            )
            .addActionRowComponents((row) =>
                row.addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`economy_shop_action_select_${this.userId}`)
                        .setPlaceholder(`Select ${this.shopMode} option`)
                        .setDisabled(!hasShopOptions)
                        .addOptions(
                            ...(hasShopOptions
                                ? shopOptions
                                : [{ label: 'No options available', value: 'none' }])
                        )
                )
            );

        if (showQtyMenu) {
            container.addActionRowComponents((row) =>
                row.addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`economy_shop_qty_select_${this.userId}`)
                        .setPlaceholder(
                            selectedSeedPrice > 0
                                ? 'Seed pack quantity (with prices)'
                                : 'Select a seed first for quantity pricing'
                        )
                        .setDisabled(selectedSeedPrice <= 0)
                        .addOptions(...this.getShopQuantityOptions(selectedSeedPrice))
                )
            );
        }

        container
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents((row) =>
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`economy_shop_confirm_${this.userId}`)
                        .setLabel(
                            this.shopMode === 'buy'
                                ? 'Buy Now'
                                : this.shopMode === 'sell'
                                  ? 'Sell Now'
                                  : 'Upgrade Now'
                        )
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(!(this.selectedShopItem && hasShopOptions)),
                    ButtonBuilder.from(this.homeButton.toJSON())
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(false)
                )
            );

        await this.render(interaction, container);
    }

    async processShopAction(
        interaction: StringSelectMenuInteraction,
        value: string
    ): Promise<void> {
        if (value === 'none') {
            this.selectedShopItem = null;
            await this.shop(interaction, 'No action available in this mode.');
            return;
        }

        const item = value as ShopItem | undefined;
        if (!item) {
            await this.shop(interaction, 'Invalid shop selection.');
            return;
        }
        this.selectedShopItem = item;
        await this.shop(interaction);
    }

    async processShopConfirm(interaction: ButtonInteraction): Promise<void> {
        if (!this.selectedShopItem) {
            await this.shop(interaction, 'Pick an item first.');
            return;
        }
        const balance = await getOrCreateBalance(interaction);
        const result = await runShopAction(
            balance,
            this.shopMode,
            this.selectedShopItem,
            this.shopQuantity
        );
        await this.shop(interaction, `${result.ok ? '✅' : '⛔'} ${result.message}`);
    }

    async setShopQuantity(interaction: StringSelectMenuInteraction, value: string): Promise<void> {
        const qty = Number(value);
        this.shopQuantity = Number.isFinite(qty) && qty > 0 ? qty : 1;
        await this.shop(interaction);
    }

    async setShopMode(interaction: ButtonInteraction, mode: ShopMode): Promise<void> {
        this.shopMode = mode;
        this.selectedShopItem = null;
        await this.shop(interaction);
    }

    async plant(
        interaction: ButtonInteraction | StringSelectMenuInteraction,
        statusMessage: string | null = null
    ): Promise<void> {
        const balance = await getOrCreateBalance(interaction);
        const maxPlantable = this.getMaxPlantable(balance, this.selectedCrop);
        const amountOptions = this.getPlantAmountOptions(maxPlantable);

        if (maxPlantable > 0 && this.selectedPlantAmount > maxPlantable) {
            this.selectedPlantAmount = maxPlantable;
        }

        const container = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('# 🌱 Plant'))
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    [
                        `> Crop: \`${this.selectedCrop}\``,
                        `> Amount: \`${this.selectedPlantAmount}\``,
                        `> Max available now: \`${maxPlantable}\``,
                        statusMessage ? `> ${statusMessage}` : '',
                    ]
                        .filter(Boolean)
                        .join('\n')
                )
            )
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents((row) =>
                row.addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`economy_plant_crop_select_${this.userId}`)
                        .setPlaceholder('Select crop')
                        .addOptions(
                            { label: 'Corn', value: 'corn', default: this.selectedCrop === 'corn' },
                            {
                                label: 'Wheat',
                                value: 'wheat',
                                default: this.selectedCrop === 'wheat',
                            },
                            {
                                label: 'Potato',
                                value: 'potato',
                                default: this.selectedCrop === 'potato',
                            },
                            {
                                label: 'Tomato',
                                value: 'tomato',
                                default: this.selectedCrop === 'tomato',
                            }
                        )
                )
            )
            .addActionRowComponents((row) =>
                row.addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`economy_plant_amount_select_${this.userId}`)
                        .setPlaceholder('Select amount')
                        .setDisabled(maxPlantable <= 0)
                        .addOptions(...amountOptions)
                )
            )
            .addActionRowComponents((row) =>
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`economy_plant_confirm_${this.userId}`)
                        .setLabel('Plant Now')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(maxPlantable <= 0),
                    ButtonBuilder.from(this.homeButton.toJSON())
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(false)
                )
            );

        await this.render(interaction, container);
    }

    async setPlantCrop(interaction: StringSelectMenuInteraction, crop: CropType): Promise<void> {
        this.selectedCrop = crop;
        await this.plant(interaction);
    }

    async setPlantAmount(interaction: StringSelectMenuInteraction, amount: string): Promise<void> {
        const value = Number(amount);
        this.selectedPlantAmount = Number.isFinite(value) && value > 0 ? value : 1;
        await this.plant(interaction);
    }

    async processPlant(interaction: ButtonInteraction): Promise<void> {
        const balance = await getOrCreateBalance(interaction);
        const result = await runPlantAction(balance, this.selectedCrop, this.selectedPlantAmount);
        await this.plant(interaction, `${result.ok ? '✅' : '⛔'} ${result.message}`);
    }

    private async render(
        interaction: ButtonInteraction | StringSelectMenuInteraction,
        container: ContainerBuilder
    ): Promise<void> {
        await interaction.deferReply();
        await interaction.deleteReply();
        await interaction.message?.edit({
            components: [container],
            files: [],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    private getShopOptionsForMode(
        balance: Awaited<ReturnType<typeof getOrCreateBalance>>
    ): { label: string; value: string; description?: string; default?: boolean }[] {
        const items = balance.Items;
        const boosts = balance.Boosts;

        if (this.shopMode === 'buy') {
            const qty = this.shopQuantity;
            return [
                {
                    label: 'Fishing Rod',
                    value: 'rod',
                    default: this.selectedShopItem === 'rod',
                    description: items?.FishingRod
                        ? 'Owned'
                        : `Cost ${this.coinFmt(ecoPrices.fishing.items.fishingRod)}`,
                },
                {
                    label: 'Farming Tools',
                    value: 'tools',
                    default: this.selectedShopItem === 'tools',
                    description: items?.FarmingTools
                        ? 'Owned'
                        : `Cost ${this.coinFmt(ecoPrices.farming.items.farmingTools)}`,
                },
                {
                    label: 'Corn Seeds',
                    value: 'corn',
                    default: this.selectedShopItem === 'corn',
                    description: `${qty} pack${qty > 1 ? 's' : ''} (${qty * 10} seeds) • ${this.coinFmt(ecoPrices.boosts.seeds.cornSeed * qty)}`,
                },
                {
                    label: 'Wheat Seeds',
                    value: 'wheat',
                    default: this.selectedShopItem === 'wheat',
                    description: `${qty} pack${qty > 1 ? 's' : ''} (${qty * 10} seeds) • ${this.coinFmt(ecoPrices.boosts.seeds.wheatSeed * qty)}`,
                },
                {
                    label: 'Potato Seeds',
                    value: 'potato',
                    default: this.selectedShopItem === 'potato',
                    description: `${qty} pack${qty > 1 ? 's' : ''} (${qty * 10} seeds) • ${this.coinFmt(ecoPrices.boosts.seeds.potatoSeed * qty)}`,
                },
                {
                    label: 'Tomato Seeds',
                    value: 'tomato',
                    default: this.selectedShopItem === 'tomato',
                    description: `${qty} pack${qty > 1 ? 's' : ''} (${qty * 10} seeds) • ${this.coinFmt(ecoPrices.boosts.seeds.tomatoSeed * qty)}`,
                },
            ];
        }
        if (this.shopMode === 'sell') {
            const fishCount =
                Number(items?.Trout ?? 0) +
                Number(items?.KingSalmon ?? 0) +
                Number(items?.SwordFish ?? 0) +
                Number(items?.PufferFish ?? 0);
            const fishValue =
                Number(items?.Trout ?? 0) * ecoPrices.fishing.rewards.trout +
                Number(items?.KingSalmon ?? 0) * ecoPrices.fishing.rewards.kingSalmon +
                Number(items?.SwordFish ?? 0) * ecoPrices.fishing.rewards.swordfish +
                Number(items?.PufferFish ?? 0) * ecoPrices.fishing.rewards.pufferfish;
            const farmCount =
                Number(items?.Barley ?? 0) +
                Number(items?.Spinach ?? 0) +
                Number(items?.Strawberries ?? 0) +
                Number(items?.Lettuce ?? 0) +
                (balance.HarvestedCrops?.length ?? 0);
            const farmLooseValue =
                Number(items?.Barley ?? 0) * ecoPrices.farming.farmingWithoutTools.barley +
                Number(items?.Spinach ?? 0) * ecoPrices.farming.farmingWithoutTools.spinach +
                Number(items?.Strawberries ?? 0) *
                    ecoPrices.farming.farmingWithoutTools.strawberries +
                Number(items?.Lettuce ?? 0) * ecoPrices.farming.farmingWithoutTools.lettuce;
            const harvestedValue = (balance.HarvestedCrops ?? []).reduce((total, crop) => {
                const base = this.getCropBaseSellPrice(crop.CropType);
                return total + Math.floor(base * (1 - Number(crop.Decay ?? 0) / 100));
            }, 0);
            const farmValue = farmLooseValue + harvestedValue;
            const treasureCount =
                Number(items?.Treasure ?? 0) +
                Number(items?.GoldBar ?? 0) +
                Number(items?.GoldNugget ?? 0);
            const treasureValue =
                Number(items?.Treasure ?? 0) * ecoPrices.fishing.rewards.treasure +
                Number(items?.GoldBar ?? 0) * ecoPrices.farming.rewards.goldBar +
                Number(items?.GoldNugget ?? 0) * ecoPrices.farming.farmingWithoutTools.goldNugget;
            const allCount = fishCount + farmCount + treasureCount;
            const allValue = fishValue + farmValue + treasureValue;

            const options: {
                label: string;
                value: string;
                description?: string;
                default?: boolean;
            }[] = [];
            if (allCount > 0) {
                options.push({
                    label: 'Sell All',
                    value: 'all',
                    default: this.selectedShopItem === 'all',
                    description: `${allCount.toLocaleString('en')} items | ${this.coinFmt(allValue)}`,
                });
            }
            if (fishCount > 0) {
                options.push({
                    label: 'Sell Fish',
                    value: 'fish',
                    default: this.selectedShopItem === 'fish',
                    description: `${fishCount.toLocaleString('en')} fish | ${this.coinFmt(fishValue)}`,
                });
            }
            if (farmCount > 0) {
                options.push({
                    label: 'Sell Farm',
                    value: 'farm',
                    default: this.selectedShopItem === 'farm',
                    description: `${farmCount.toLocaleString('en')} farm items | ${this.coinFmt(farmValue)}`,
                });
            }
            if (treasureCount > 0) {
                options.push({
                    label: 'Sell Treasure',
                    value: 'treasure',
                    default: this.selectedShopItem === 'treasure',
                    description: `${treasureCount.toLocaleString('en')} treasure | ${this.coinFmt(treasureValue)}`,
                });
            }
            return options;
        }

        const upgradeTargets: {
            label: string;
            value: ShopItem;
            current: number;
            limit: number;
            price: number;
        }[] = [
            {
                label: 'Seed Bag',
                value: 'seedbag',
                current: Number(boosts?.SeedBag ?? 0),
                limit: ecoPrices.boosts.seedBagLimit,
                price: ecoPrices.boosts.seedBagPrice,
            },
            {
                label: 'Fish Bag',
                value: 'fishbag',
                current: Number(boosts?.FishBag ?? 0),
                limit: ecoPrices.fishing.items.fishBagLimit,
                price: ecoPrices.fishing.items.fishBagPrice,
            },
            {
                label: 'Farm Bag',
                value: 'farmbag',
                current: Number(boosts?.FarmBag ?? 0),
                limit: ecoPrices.farming.items.farmBagLimit,
                price: ecoPrices.farming.items.farmBagPrice,
            },
            {
                label: 'Farm Plot',
                value: 'plot',
                current: Number(boosts?.FarmPlot ?? 0),
                limit: ecoPrices.farming.items.farmPlotLimit,
                price: ecoPrices.farming.items.farmPlotPrice,
            },
        ];

        const capacityUpgrades = upgradeTargets
            .filter((x) => x.current > 0 && x.current < x.limit)
            .map((x) => ({
                label: x.label,
                value: x.value,
                default: this.selectedShopItem === x.value,
                description: `${x.current}/${x.limit} | Next ${this.coinFmt(x.current * x.price * 3)}`,
            }));

        const autoDepositOwned = Boolean(boosts?.AutoDeposit);
        if (!autoDepositOwned) {
            capacityUpgrades.push({
                label: 'Auto Deposit (Heist)',
                value: 'autodeposit',
                default: this.selectedShopItem === 'autodeposit',
                description: `Heist wins go straight to bank | ${this.coinFmt(ecoPrices.boosts.autoDepositPrice)}`,
            });
        }

        return capacityUpgrades;
    }

    private getMaxPlantable(
        balance: Awaited<ReturnType<typeof getOrCreateBalance>>,
        crop: CropType
    ): number {
        const seedByCrop: Record<CropType, number> = {
            corn: Number(balance.Items?.CornSeeds ?? 0),
            wheat: Number(balance.Items?.WheatSeeds ?? 0),
            potato: Number(balance.Items?.PotatoSeeds ?? 0),
            tomato: Number(balance.Items?.TomatoSeeds ?? 0),
        };

        const seedCount = seedByCrop[crop];
        const plotCap = Number(balance.Boosts?.FarmPlot ?? 0);
        const usedPlots = balance.FarmPlot?.length ?? 0;
        const freePlots = Math.max(0, plotCap - usedPlots);

        return Math.max(0, Math.min(seedCount, freePlots));
    }

    private getPlantAmountOptions(
        maxPlantable: number
    ): { label: string; value: string; default?: boolean }[] {
        if (maxPlantable <= 0) {
            return [{ label: 'No available amount', value: '0' }];
        }

        const base = [1, 5, 10, 25].filter((n) => n <= maxPlantable);
        const merged = [...new Set([...base, maxPlantable])];
        const selected =
            this.selectedPlantAmount <= maxPlantable ? this.selectedPlantAmount : maxPlantable;

        return merged.map((n) => ({
            label: `x${n}`,
            value: `${n}`,
            default: n === selected,
        }));
    }

    private getShopQuantityOptions(
        selectedSeedPackPrice: number
    ): { label: string; value: string; default?: boolean; description?: string }[] {
        const qtyOptions = [1, 5, 10];
        return qtyOptions.map((qty) => ({
            label: `${qty} pack${qty > 1 ? 's' : ''}`,
            value: `${qty}`,
            default: this.shopQuantity === qty,
            description: `${qty * 10} seeds • ${this.coinFmt(selectedSeedPackPrice * qty)}`,
        }));
    }

    private getSelectedSeedPackPrice(): number {
        if (!this.selectedShopItem) {
            return 0;
        }
        if (this.selectedShopItem === 'corn') {
            return ecoPrices.boosts.seeds.cornSeed;
        }
        if (this.selectedShopItem === 'wheat') {
            return ecoPrices.boosts.seeds.wheatSeed;
        }
        if (this.selectedShopItem === 'potato') {
            return ecoPrices.boosts.seeds.potatoSeed;
        }
        if (this.selectedShopItem === 'tomato') {
            return ecoPrices.boosts.seeds.tomatoSeed;
        }
        return 0;
    }

    private getCropBaseSellPrice(cropType: string): number {
        if (cropType === 'corn') {
            return ecoPrices.farming.rewards.corn;
        }
        if (cropType === 'wheat') {
            return ecoPrices.farming.rewards.wheat;
        }
        if (cropType === 'potato') {
            return ecoPrices.farming.rewards.potatoes;
        }
        if (cropType === 'tomato') {
            return ecoPrices.farming.rewards.tomatoes;
        }
        return 0;
    }

    private coinFmt(value: number): string {
        return `💰 ${Math.max(0, Math.floor(value)).toLocaleString('en')}`;
    }

    /**
     * Get the economy prices configuration
     */
    getEcoPrices() {
        return ecoPrices;
    }
}

export * from './economy/Bank.js';
export * from './economy/Claims.js';
export { ecoPrices } from './economy/Config.js';
export * from './economy/Farm.js';
export * from './economy/Fish.js';
export * from './economy/Gamble.js';
export * from './economy/Harvest.js';
export * from './economy/Heist.js';
export * from './economy/Home.js';
export * from './economy/Items.js';
export * from './economy/Leaderboard.js';
// Export all the types and config for external use
export * from './economy/Types.js';
