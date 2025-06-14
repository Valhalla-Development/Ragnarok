import {
    type APIEmbed,
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    type CommandInteraction,
    EmbedBuilder,
    ModalBuilder,
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import '@colors/colors';
import type { Client } from 'discordx';
// @ts-expect-error no type file available for this package
import converter from 'number-to-words-en';
import prettyMilliseconds from 'pretty-ms';
import Balance, { type BalanceInterface } from '../mongo/Balance.js';
import { RagnarokEmbed, capitalise, color, pagination } from '../utils/Util.js';

interface EcoPrices {
    Hourly: { min: number; max: number };
    Daily: { min: number; max: number };
    Weekly: { min: number; max: number };
    Monthly: { min: number; max: number };
}

interface Claim {
    Hourly?: number;
    Daily?: number;
    Weekly?: number;
    Monthly?: number;
}

interface Items {
    Trout: number;
    KingSalmon: number;
    SwordFish: number;
    PufferFish: number;
    Treasure: number;
    GoldBar: number;
    GoldNugget: number;
    Barley: number;
    Spinach: number;
    Strawberries: number;
    Lettuce: number;
    CornSeeds: number;
    WheatSeeds: number;
    PotatoSeeds: number;
    TomatoSeeds: number;
    FarmingTools: boolean;
    FishingRod: boolean;
}

interface CropData {
    CropStatus: string;
    CropType: string;
    Decay: number;
    CropGrowTime: number | string;
    LastUpdateTime?: number;
}

interface HarvestResult {
    crops: CropData[];
    totalValue: number;
    displayEntries: string[];
}

export class Economy {
    homeButton;

    baltopButton;

    claimButton;

    depositButton;

    coinflipButton;

    farmButton;

    fishButton;

    harvestButton;

    rows: ActionRowBuilder<ButtonBuilder>[] = [];

    ecoPrices;

    homeEmbed: EmbedBuilder | null = null;

    // Add timeout duration property (in milliseconds)
    private readonly commandTimeout = 10000; // 10 seconds

    constructor() {
        this.homeButton = new ButtonBuilder()
            .setLabel('Home')
            .setStyle(ButtonStyle.Success)
            .setCustomId('economy_home');

        this.baltopButton = new ButtonBuilder()
            .setLabel('Baltop')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_baltop');

        this.claimButton = new ButtonBuilder()
            .setLabel('Claim')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_claim');

        this.depositButton = new ButtonBuilder()
            .setLabel('Deposit')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_deposit');

        this.coinflipButton = new ButtonBuilder()
            .setLabel('Coin Flip')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_coinflip');

        this.farmButton = new ButtonBuilder()
            .setLabel('Farm')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_farm');

        this.fishButton = new ButtonBuilder()
            .setLabel('Fish')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_fish');

        this.harvestButton = new ButtonBuilder()
            .setLabel('Harvest')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_harvest');

        const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            this.homeButton,
            this.baltopButton,
            this.claimButton,
            this.depositButton,
            this.coinflipButton
        );

        const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            this.farmButton,
            this.fishButton,
            this.harvestButton
        );

        this.rows.push(row1, row2);

        // Bind methods to class instance
        this.home = this.home.bind(this);
        this.baltop = this.baltop.bind(this);
        this.deposit = this.deposit.bind(this);
        this.claim = this.claim.bind(this);
        this.coinflip = this.coinflip.bind(this);

        this.ecoPrices = {
            // Messaging Rewards
            messaging: {
                minPerMessage: 10,
                maxPerMessage: 30,
            },

            // User Claims
            claims: {
                hourly: { min: 150, max: 400 },
                daily: { min: 400, max: 800 },
                weekly: { min: 2000, max: 3000 },
                monthly: { min: 10000, max: 15000 },
                newUserTime: 172800000, // 2 Days
            },

            // Fishing
            fishing: {
                items: {
                    fishBagFirst: 200,
                    fishBagLimit: 1500,
                    fishBagPrice: 800, // Upgrade adds 30 to capacity
                    fishingRod: 25000,
                },
                rewards: {
                    treasure: 75000,
                    pufferfish: 5000,
                    swordfish: 2500,
                    kingSalmon: 1000,
                    trout: 400,
                },
                cooldowns: {
                    fishWinTime: 240000, // 4 Minutes
                    fishFailTime: 480000, // 8 Minutes
                },
            },

            // Farming
            farming: {
                items: {
                    farmPlotFirst: 150,
                    farmPlotLimit: 1200,
                    farmPlotPrice: 800, // Upgrade adds 30 to capacity
                    farmingTools: 20000,
                    farmBagFirst: 150,
                    farmBagLimit: 12000,
                    farmBagPrice: 800, // Upgrade adds 30 to capacity
                },
                rewards: {
                    goldBar: 30000,
                    corn: 800,
                    wheat: 600,
                    potatoes: 500,
                    tomatoes: 450,
                },
                plantingTimes: {
                    cornPlant: 480000, // 8 minutes
                    wheatPlant: 360000, // 6 minutes
                    potatoPlant: 180000, // 3 minutes
                    tomatoPlant: 120000, // 2 minutes
                },
                decayRate: 0.015, // Lowered decay rate for better long-term value
                farmingWithoutTools: {
                    goldNugget: 15000,
                    barley: 600,
                    spinach: 400,
                    strawberries: 200,
                    lettuce: 150,
                },
                cooldowns: {
                    farmWinTime: 240000, // 4 Minutes
                    farmFailTime: 480000, // 8 Minutes
                },
                freeFarmLimit: 10,
            },

            // Boosts
            boosts: {
                seedBagFirst: 150,
                seedBagLimit: 1200,
                seedBagPrice: 800, // Upgrade adds 30 to capacity
                seeds: {
                    cornSeed: 5000, // 15 per pack
                    wheatSeed: 4000,
                    potatoSeed: 3500,
                    tomatoSeed: 3200,
                },
            },
        };
    }

    /**
     * This method sets the state of a button.
     * @param button - The button to set the state for.
     */
    setButtonState(button: ButtonBuilder) {
        // Loop through all buttons in the rows
        for (const row of this.rows) {
            for (const otherButton of row.components) {
                // If the button is not the provided 'button', set its style to primary and enable it
                if (otherButton !== button) {
                    otherButton.setStyle(ButtonStyle.Primary);
                    otherButton.setDisabled(false);
                }
            }
        }

        // Disable the provided 'button' and set its style to success.
        button.setDisabled(true);
        button.setStyle(ButtonStyle.Success);
    }

    /**
     * Asynchronously updates the home embed based on user interaction.
     * @param interaction - The interaction (Command, Button, or Modal) triggering the update.
     * @param client - The Discord client.
     */
    async updateHomeEmbed(
        interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction,
        client: Client
    ) {
        // Fetch user balance based on their ID and guild ID
        const balance = await Balance.findOne({
            IdJoined: `${interaction.user.id}-${interaction.guild!.id}`,
        });

        // If balance is not found, show an error message and return
        if (!balance) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'An error occurred, please try again.',
                true
            );
            return;
        }

        // Fetch user leaderboard rank
        const userRank: BalanceInterface[] = await Balance.find({
            GuildId: interaction.guild!.id,
        }).sort({ Total: -1 });
        const userPos = userRank.find(
            (b) => b.IdJoined === `${interaction.user.id}-${interaction.guild!.id}`
        );

        const rankPos = converter.toOrdinal(userRank.indexOf(userPos!) + 1);

        // Map item types to their respective names
        const itemTypes = new Map<string, string[]>([
            ['seeds', ['CornSeeds', 'WheatSeeds', 'PotatoSeeds', 'TomatoSeeds']],
            ['fish', ['Trout', 'KingSalmon', 'Swordfish', 'Pufferfish']],
            ['crops', ['corn', 'wheat', 'potato', 'tomato']],
        ]);

        // Calculate claim cooldown time in seconds
        const claimUserTime = balance.ClaimNewUser ? Math.round(balance.ClaimNewUser / 1000) : 0;

        // Function to calculate total count of items of a specific type
        function calculateTotal(itemType: string, bal: BalanceInterface): number {
            const types = itemTypes.get(itemType);
            if (!types) {
                return 0; // Handle unknown itemType
            }

            return types.reduce((acc, type) => {
                const itemQuantity = bal?.Items?.[type as keyof typeof bal.Items] || 0;
                return acc + (typeof itemQuantity === 'number' ? itemQuantity : 0);
            }, 0);
        }

        // Sum up seed counts
        const currentTotalSeeds = calculateTotal('seeds', balance);

        // Sum up fish counts
        const currentTotalFish = calculateTotal('fish', balance);

        // Count harvested crops
        const currentTotalFarm = balance.HarvestedCrops?.length
            ? balance.HarvestedCrops.filter((crop: { CropType: string }) =>
                  itemTypes.get('crops')?.includes(crop.CropType)
              ).length
            : 0;

        // Construct the home embed
        this.homeEmbed = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.displayName}'s Balance`,
                iconURL: `${interaction.user.displayAvatarURL()}`,
            })
            .setDescription(`Leaderboard Rank: \`${rankPos}\``)
            .setColor(color(interaction.guild!.members.me!.displayHexColor))
            .addFields(
                {
                    name: 'Cash',
                    value: `<:coin:706659001164628008> \`${balance.Cash.toLocaleString('en')}\``,
                    inline: true,
                },
                {
                    name: 'Bank',
                    value: `<:coin:706659001164628008> \`${balance.Bank.toLocaleString('en')}\``,
                    inline: true,
                },
                {
                    name: 'Total',
                    value: `<:coin:706659001164628008> \`${balance.Total.toLocaleString('en')}\``,
                    inline: true,
                },
                {
                    name: 'Cooldowns',
                    value: `
                Steal: ${Date.now() > balance.StealCool ? '`Available!`' : `<t:${Math.round(balance.StealCool / 1000)}:R>`}
                Fish: ${balance.Items?.FishingRod ? `${Date.now() > balance.FishCool ? '`Available!`' : `<t:${Math.round(balance.FishCool / 1000)}:R>`}` : '`Rod Not Owned`'}
                Farm: ${Date.now() > balance.FarmCool ? '`Available!`' : `<t:${Math.round(balance.FarmCool / 1000)}:R>`}
            `,
                    inline: false,
                },
                {
                    name: 'Boosts',
                    value: `
                Seed: ${
                    balance.Boosts?.SeedBag
                        ? `\`${Number(currentTotalSeeds).toLocaleString('en')}\`/\`${Number(
                              balance.Boosts.SeedBag
                          ).toLocaleString('en')}\``
                        : '`Seed Not Owned`'
                }
                Fish: ${
                    balance.Boosts?.FishBag
                        ? `\`${Number(currentTotalFish).toLocaleString('en')}\`/\`${Number(
                              balance.Boosts.FishBag
                          ).toLocaleString('en')}\``
                        : '`Fish Not Owned`'
                }
                Farm: ${
                    balance.Boosts?.FarmBag
                        ? `\`${Number(currentTotalFarm).toLocaleString('en')}\`/\`${Number(
                              balance.Boosts.FarmBag
                          ).toLocaleString('en')}\``
                        : '`Farm Not Owned`'
                }
                Farm Plot: ${
                    balance.Boosts?.FarmPlot
                        ? `\`${balance.FarmPlot.length.toLocaleString('en')}\`/\`${Number(
                              balance.Boosts.FarmPlot
                          ).toLocaleString('en')}\``
                        : '`Not Owned`'
                }
            `,
                    inline: false,
                },
                {
                    name: '**Claim Cooldowns**',
                    value: `
                Hourly: ${balance.ClaimNewUser ? (Date.now() > balance.ClaimNewUser ? '`Available`' : `<t:${claimUserTime}:R>`) : Date.now() > balance.Hourly ? '`Available!`' : `<t:${Math.round(balance.Hourly / 1000)}:R>`}
                Daily: ${balance.ClaimNewUser ? (Date.now() > balance.ClaimNewUser ? '`Available`' : `<t:${claimUserTime}:R>`) : Date.now() > balance.Daily ? '`Available!`' : `<t:${Math.round(balance.Daily / 1000)}:R>`}
                Weekly: ${balance.ClaimNewUser ? (Date.now() > balance.ClaimNewUser ? '`Available`' : `<t:${claimUserTime}:R>`) : Date.now() > balance.Weekly ? '`Available!`' : `<t:${Math.round(balance.Weekly / 1000)}:R>`}
                Monthly: ${balance.ClaimNewUser ? (Date.now() > balance.ClaimNewUser ? '`Available`' : `<t:${claimUserTime}:R>`) : Date.now() > balance.Monthly ? '`Available!`' : `<t:${Math.round(balance.Monthly / 1000)}:R>`}
            `,
                }
            );
    }

    /**
     * Asynchronously handles the home interaction (Command or Button).
     * @param interaction - The interaction (Command or Button) triggering the home function.
     * @param client - The Discord client.
     */
    async home(interaction: CommandInteraction | ButtonInteraction, client: Client) {
        // Update the home embed based on the interaction
        await this.updateHomeEmbed(interaction, client);

        // Set the state of the home button
        this.setButtonState(this.homeButton);

        // If the interaction is a ButtonInteraction, update the original message
        if (interaction instanceof ButtonInteraction) {
            await interaction.deferReply(); // Defer the original reply to prevent timeout
            await interaction.deleteReply();

            // Edit the original message with the updated embed and components
            await interaction.message.edit({
                embeds: [this.homeEmbed!],
                components: [...this.rows],
            });
        } else {
            // If the interaction is a CommandInteraction, reply with the updated embed and components
            await interaction.reply({
                embeds: [this.homeEmbed!],
                components: [...this.rows],
            });
        }
    }

    /**
     * Asynchronously handles the baltop button interaction.
     * @param interaction - The ButtonInteraction triggering the baltop function.
     * @param client - The Discord client.
     */
    async baltop(interaction: ButtonInteraction, client: Client) {
        // Fetch top 10 balances from the database sorted by total balance
        const top10: BalanceInterface[] = await Balance.find({ GuildId: interaction.guild!.id })
            .sort({ Total: -1 })
            .limit(10);

        // If no data found, show an error message and return
        if (!top10 || top10.length === 0) {
            await RagnarokEmbed(client, interaction, 'Error', 'No data found.', true);
            return;
        }

        // Defer the original reply to prevent timeout and delete the original reply
        await interaction.deferReply();
        await interaction.deleteReply();

        let userNames = '';
        let balance = '';

        // Iterate over the top 10 balances and fetch corresponding member data
        await Promise.all(
            top10.map(async (data, index: number) => {
                let fetchUser = interaction.guild!.members.cache.get(data.UserId);

                if (!fetchUser) {
                    try {
                        fetchUser = await interaction.guild!.members.fetch(data.UserId);
                    } catch {
                        // Do nothing because I am a monster
                    }
                }

                // If user data is found, append user name and balance to respective strings
                if (fetchUser) {
                    userNames += `\`${index + 1}\` ${fetchUser}\n`;
                    balance += `<:coin:706659001164628008> \`${data.Total}\`\n`;
                }
            })
        );

        // Construct the embed with leaderboard information
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `Leaderboard for ${interaction.guild!.name}`,
                iconURL: `${interaction.guild!.iconURL({ extension: 'png' })}`,
            })
            .setColor(color(interaction.guild!.members.me!.displayHexColor))
            .addFields(
                {
                    name: 'Top 10',
                    value: userNames,
                    inline: true,
                },
                {
                    name: 'Balance',
                    value: balance,
                    inline: true,
                }
            );

        // Set the state of the baltop button
        this.setButtonState(this.baltopButton);

        // Update the original message with the updated embed and components
        await interaction.message.edit({
            embeds: [embed],
            components: [...this.rows],
        });
    }

    /**
     * Asynchronously handles the deposit button interaction.
     * @param interaction - The ButtonInteraction triggering the deposit function.
     * @param client - The Discord client.
     */
    async deposit(interaction: ButtonInteraction, client: Client) {
        // Set the state of the deposit button first
        this.setButtonState(this.depositButton);

        // Fetch user's balance based on their ID and guild ID
        const balance = await Balance.findOne({
            IdJoined: `${interaction.user.id}-${interaction.guild!.id}`,
        });

        // If balance is not found or user has no cash, show an error message and return
        if (!balance || balance.Cash === 0) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'You do not have any cash to deposit.',
                true
            );
            return;
        }

        // Calculate total amount in the bank after deposit
        const bankCalc = balance.Cash + balance.Bank;

        // Show success message for the deposit
        await RagnarokEmbed(
            client,
            interaction,
            'Success',
            `You have deposited <:coin:706659001164628008> \`${balance.Cash.toLocaleString('en')}\` to your bank.`,
            true
        );

        // Update balance: Set cash to 0, update bank balance and total balance
        balance.Cash = 0;
        balance.Bank = bankCalc;
        balance.Total = bankCalc;

        // Save the updated balance to the database
        await balance.save();
    }

    /**
     * Asynchronously handles the claim button interaction.
     * @param interaction - The ButtonInteraction triggering the claim function.
     * @param client - The Discord client.
     */
    async claim(interaction: ButtonInteraction, client: Client) {
        // Set the state of the claim button first
        this.setButtonState(this.claimButton);

        // Fetch user's balance based on their ID and guild ID
        const balance = await Balance.findOne({
            IdJoined: `${interaction.user.id}-${interaction.guild!.id}`,
        });

        // If balance is not found, show an error message and return
        if (!balance) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'An error occurred, please try again.',
                true
            );
            return;
        }

        // Check if user has new user claim cooldown
        if (balance.ClaimNewUser) {
            if (Date.now() > balance.ClaimNewUser) {
                balance.ClaimNewUser = 0;
            } else {
                const nowInSecond = Math.round(balance.ClaimNewUser / 1000);
                await RagnarokEmbed(
                    client,
                    interaction,
                    'Error',
                    `Your Economy profile is too new! Please wait another <t:${nowInSecond}:R> before using this command.`,
                    true
                );
                return;
            }
        }

        // Check and reset other claim cooldowns if necessary
        const keys: (keyof Claim)[] = ['Hourly', 'Daily', 'Weekly', 'Monthly'];

        for (const key of keys) {
            if (balance[key] && Date.now() > balance[key]) {
                balance[key] = 0;
            }
        }

        // Check if there is anything to claim
        if (Date.now() < Math.min(balance.Hourly, balance.Daily, balance.Weekly, balance.Monthly)) {
            await RagnarokEmbed(client, interaction, 'Error', ' You have nothing to claim!', true);
            return;
        }

        // Calculate the total claim price and update balance
        let fullPrice = 0;

        const periods = ['Hourly', 'Daily', 'Weekly', 'Monthly'];
        const prices: EcoPrices = {
            Hourly: this.ecoPrices.claims.hourly,
            Daily: this.ecoPrices.claims.daily,
            Weekly: this.ecoPrices.claims.weekly,
            Monthly: this.ecoPrices.claims.monthly,
        };

        for (const period of periods) {
            if (!balance[period as keyof typeof balance]) {
                const priceRange = prices[period as keyof EcoPrices];
                fullPrice +=
                    Math.floor(Math.random() * (priceRange.max - priceRange.min + 1)) +
                    priceRange.min;
            }
        }

        const endTime = Date.now();

        balance.Hourly = balance.Hourly ? balance.Hourly : endTime + 3600000;
        balance.Daily = balance.Daily ? balance.Daily : endTime + 86400000;
        balance.Weekly = balance.Weekly ? balance.Weekly : endTime + 604800000;
        balance.Monthly = balance.Monthly ? balance.Monthly : endTime + 2629800000;
        balance.Bank += fullPrice;
        balance.Total += fullPrice;

        await balance.save();

        // Show success message with claimed amount and new total
        const newTot = balance.Total + fullPrice;

        await RagnarokEmbed(
            client,
            interaction,
            'Success',
            `You have claimed all available claims! <:coin:706659001164628008> \`${fullPrice.toLocaleString('en')}\` has been credited to your Bank.\n Your new total is <:coin:706659001164628008> \`${newTot.toLocaleString('en')}\``,
            true
        );
    }

    /**
     * Asynchronously handles the coinflip interaction.
     * @param interaction - The ModalSubmitInteraction or ButtonInteraction triggering the coinflip function.
     * @param client - The Discord client.
     * @param amount - The amount to bet, default is null.
     * @param option - The chosen option (heads or tails), default is null.
     */
    async coinflip(
        interaction: ModalSubmitInteraction | ButtonInteraction,
        client: Client,
        amount: string | null = null,
        option: string | null = null
    ) {
        // Set the state of the coinflip button first if it's a button interaction
        if (interaction instanceof ButtonInteraction) {
            this.setButtonState(this.coinflipButton);
        }

        // Fetch user's balance based on their ID and guild ID
        const balance = await Balance.findOne({
            IdJoined: `${interaction.user.id}-${interaction.guild!.id}`,
        });

        // If balance is not found, show an error message and return
        if (!balance) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'An error occurred, please try again.',
                true
            );
            return;
        }

        // If no amount and option are provided and the interaction is a ButtonInteraction, show a modal for specifying an amount
        if (!amount && !option && interaction instanceof ButtonInteraction) {
            const coinflipModal = new ModalBuilder()
                .setTitle('Coin Flip Amount')
                .setCustomId('coinflipAmount');

            const amountField = new TextInputBuilder()
                .setCustomId('amountField')
                .setLabel('Amount to bet')
                .setPlaceholder('2850')
                .setStyle(TextInputStyle.Short)
                .setMinLength(2)
                .setRequired(true);

            const coinRow = new ActionRowBuilder<TextInputBuilder>().addComponents(amountField);

            coinflipModal.addComponents(coinRow);

            await interaction.showModal(coinflipModal);
            return;
        }

        // Define buttons for heads, tails, and cancel
        const headsButton = new ButtonBuilder()
            .setLabel('Heads!')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_coinflip_heads');

        const tailsButton = new ButtonBuilder()
            .setLabel('Tails!')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_coinflip_tails');

        const cancelButton = new ButtonBuilder()
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)
            .setCustomId('economy_home');

        const coinRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            headsButton,
            tailsButton,
            cancelButton
        );

        // If no option provided, check for valid amount and sufficient balance, then start the coin flip
        if (option) {
            // If option is provided, determine win or loss, update balance, and display result
            const flip = ['heads', 'tails'];
            const answer = flip[Math.floor(Math.random() * flip.length)];

            const win = new EmbedBuilder()
                .setAuthor({
                    name: `${interaction.user.displayName}`,
                    iconURL: `${interaction.user.avatarURL()}`,
                })
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .addFields({
                    name: `**${client.user?.username} - Coin Flip**`,
                    value: `**◎** ${interaction.user} won! <:coin:706659001164628008> \`${Number(
                        amount
                    ).toLocaleString('en')}\` has been credited to your Bank!`,
                });

            const lose = new EmbedBuilder()
                .setAuthor({
                    name: `${interaction.user.displayName}`,
                    iconURL: `${interaction.user.avatarURL()}`,
                })
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .addFields({
                    name: `**${client.user?.username} - Coin Flip**`,
                    value: `**◎** ${interaction.user} lost <:coin:706659001164628008> \`${Number(
                        amount
                    ).toLocaleString('en')}\``,
                });

            headsButton.setDisabled(true);
            tailsButton.setDisabled(true);

            // Update balance based on win or loss
            if (option === answer) {
                balance.Bank += Number(amount);
                balance.Total += Number(amount);
            } else {
                balance.Bank -= Number(amount);
                balance.Total -= Number(amount);
            }

            await interaction.deferReply();
            await interaction.deleteReply();

            // Display result message with the appropriate embed
            await interaction.message?.edit({
                components: [coinRow],
                embeds: [option === answer ? win : lose],
            });
            await balance.save();

            // Update home embed after the coin flip
            await this.updateHomeEmbed(interaction, client);

            // If interaction is a ButtonInteraction and home embed exists, update the message with home embed after a delay
            if (interaction instanceof ButtonInteraction && this.homeEmbed) {
                setTimeout(async () => {
                    // Reset all buttons to primary style and enabled
                    for (const row of this.rows) {
                        for (const button of row.components) {
                            button.setStyle(ButtonStyle.Primary);
                            button.setDisabled(false);
                        }
                    }
                    // Set home button to success style and disabled
                    this.homeButton.setStyle(ButtonStyle.Success);
                    this.homeButton.setDisabled(true);

                    await interaction.message?.edit({
                        components: [...this.rows],
                        embeds: [this.homeEmbed as APIEmbed],
                    });
                }, this.commandTimeout);
            }
        } else {
            if (Number.isNaN(Number(amount))) {
                await RagnarokEmbed(
                    client,
                    interaction,
                    'Error',
                    'The specified amount was not a valid number.',
                    true
                );
                return;
            }

            if (Number(amount) > balance.Bank) {
                await RagnarokEmbed(
                    client,
                    interaction,
                    'Error',
                    `You do not have enough to bet <:coin:706659001164628008> \`${Number(
                        amount
                    ).toLocaleString('en')}\`, you have <:coin:706659001164628008> \`${Number(
                        balance.Bank
                    ).toLocaleString('en')}\` available in your Bank.`,
                    true
                );
                return;
            }

            const initial = new EmbedBuilder()
                .setAuthor({
                    name: `${interaction.user.displayName}`,
                    iconURL: `${interaction.user.avatarURL()}`,
                })
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .addFields({
                    name: `**${client.user?.username} - Coin Flip**`,
                    value: `**◎** ${interaction.user} bet <:coin:706659001164628008> \`${Number(
                        amount
                    ).toLocaleString('en')}\``,
                });

            await interaction.message?.edit({
                embeds: [initial],
                components: [coinRow],
            });
        }
    }

    // Asynchronous function to handle farming interaction
    async farm(interaction: ButtonInteraction, client: Client) {
        // Set the state of the farm button first
        this.setButtonState(this.farmButton);

        // Retrieve user's balance
        const balance = await Balance.findOne({
            IdJoined: `${interaction.user.id}-${interaction.guild!.id}`,
        });

        // If balance is not found, display error and return
        if (!balance) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'An error occurred, please try again.',
                true
            );
            return;
        }

        // Check if user is on cooldown
        if (balance.FarmCool !== null) {
            if (Date.now() <= balance.FarmCool) {
                await RagnarokEmbed(
                    client,
                    interaction,
                    'Error',
                    `You are on a cooldown! You will be able to perform this action again <t:${Math.floor(balance.FarmCool / 1000)}:R>.`,
                    true
                );
                return;
            }
            balance.FarmCool = 0;
        }

        // Calculate current total farm
        const freeLimit = this.ecoPrices.farming.freeFarmLimit;
        let currentTotalFarm = 0;

        currentTotalFarm += Number(balance.Items?.Barley) || 0;
        currentTotalFarm += Number(balance.Items?.Spinach) || 0;
        currentTotalFarm += Number(balance.Items?.Strawberries) || 0;
        currentTotalFarm += Number(balance.Items?.Lettuce) || 0;

        // Check if farm bag is full
        if (!balance.Items?.FarmingTools && currentTotalFarm >= Number(freeLimit)) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'Your farm bag is full! You can sell your produce via the `sell` button.',
                true
            );
            return;
        }

        // Generate farm result
        const farmResult = this.generateFarmResult();

        // If farm result is not generated, display error and return
        if (!farmResult) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'An error occurred, please try again.',
                true
            );
            return;
        }

        // Initialize balance items if not present
        if (!balance.Items) {
            balance.Items = {} as Items;
        }

        // Increment farm result amount in balance items
        const amt = (Number(balance.Items[farmResult.name as keyof typeof balance.Items]) || 0) + 1;
        balance.Items[farmResult.name as keyof typeof balance.Items] = amt as never;

        // Build attachment for farm result image
        const attachment = new AttachmentBuilder(`assets/economy/${farmResult.name}.png`);

        // Build farm embed
        const embed = this.buildFarmEmbed(interaction, client, farmResult, amt);
        embed.setThumbnail(`attachment://${farmResult.name}.png`);

        // Calculate cooldown time and update balance
        const endTime = Date.now() + this.ecoPrices.farming.cooldowns.farmWinTime;
        balance.FarmCool = Math.round(endTime);
        await balance.save();

        // Defer reply, delete original interaction, update message with embed and attachment
        await interaction.deferReply();
        await interaction.deleteReply();
        await interaction.message?.edit({
            components: [...this.rows],
            embeds: [embed],
            files: [attachment],
        });

        // Update home embed
        await this.updateHomeEmbed(interaction, client);

        // If home embed is available, reset after timeout
        if (this.homeEmbed) {
            setTimeout(async () => {
                // Reset all buttons to primary style and enabled
                for (const row of this.rows) {
                    for (const button of row.components) {
                        button.setStyle(ButtonStyle.Primary);
                        button.setDisabled(false);
                    }
                }
                // Set home button to success style and disabled
                this.homeButton.setStyle(ButtonStyle.Success);
                this.homeButton.setDisabled(true);

                await interaction.message?.edit({
                    components: [...this.rows],
                    embeds: [this.homeEmbed as APIEmbed],
                    files: [],
                });
            }, this.commandTimeout);
        }
    }

    // Function to generate farm result
    generateFarmResult() {
        const farmChance = Math.random();
        if (farmChance < 0.0018) {
            return {
                name: 'Gold Nugget',
                price: this.ecoPrices.farming.farmingWithoutTools.goldNugget,
            };
        }
        if (farmChance < 0.0318) {
            return { name: 'Barley', price: this.ecoPrices.farming.farmingWithoutTools.barley };
        }
        if (farmChance < 0.0918) {
            return { name: 'Spinach', price: this.ecoPrices.farming.farmingWithoutTools.spinach };
        }
        if (farmChance < 0.3718) {
            return {
                name: 'Strawberries',
                price: this.ecoPrices.farming.farmingWithoutTools.strawberries,
            };
        }
        return { name: 'Lettuce', price: this.ecoPrices.farming.farmingWithoutTools.lettuce };
    }

    // Function to build farm embed
    buildFarmEmbed(
        interaction: ButtonInteraction,
        client: Client,
        farmResult: { name: string; price: number },
        amt: number
    ) {
        const { name, price } = farmResult;

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.displayName}`,
                iconURL: `${interaction.user.avatarURL()}`,
            })
            .setColor(color(interaction.guild!.members.me!.displayHexColor))
            .setFooter({
                text: 'Planting crops yields a larger return! check it out with: /plant',
            });

        return embed.addFields({
            name: `**${client.user?.username} - Farm**`,
            value: `**◎ Success:** You found a ${name}! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString('en')}\`\nYou now have \`${amt.toLocaleString('en')}\`.`,
        });
    }

    // Asynchronous function to handle fishing interaction
    async fish(interaction: ButtonInteraction, client: Client) {
        // Set the state of the fish button first
        this.setButtonState(this.fishButton);

        // Retrieve user's balance
        const balance = await Balance.findOne({
            IdJoined: `${interaction.user.id}-${interaction.guild!.id}`,
        });

        // If balance is not found, display error and return
        if (!balance) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'An error occurred, please try again.',
                true
            );
            return;
        }

        // Check if user has a fishing rod
        if (!balance.Items?.FishingRod) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'You do not have a fishing rod! You must buy one from the shop.',
                true
            );
            return;
        }

        // Check if user is on cooldown
        if (balance.FishCool !== null) {
            if (Date.now() <= balance.FishCool) {
                await RagnarokEmbed(
                    client,
                    interaction,
                    'Error',
                    `You are on a cooldown! You will be able to perform this action again <t:${Math.floor(balance.FishCool / 1000)}:R>.`,
                    true
                );
                return;
            }
            balance.FishCool = 0;
        }

        // Calculate current total fish
        let currentTotalFish = 0;

        currentTotalFish += Number(balance.Items?.Trout) || 0;
        currentTotalFish += Number(balance.Items?.KingSalmon) || 0;
        currentTotalFish += Number(balance.Items?.SwordFish) || 0;
        currentTotalFish += Number(balance.Items?.PufferFish) || 0;

        // Check if fish bag is full
        if (currentTotalFish >= Number(balance.Boosts?.FishBag)) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'Your fish bag is full! You can sell your fish via the `sell` button.',
                true
            );
            return;
        }

        // Generate fish result
        const fishResult = this.generateFishResult();

        // If fish result is not generated, display error and return
        if (!fishResult) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'An error occurred, please try again.',
                true
            );
            return;
        }

        // If fish result is a fail, handle it and return
        if (fishResult.name === 'Fail') {
            const failMessages = [
                'Your catch escaped the line.',
                'The fish was too strong and broke free!',
                'You felt a tug, but the line went slack...',
                'A big one got away! Better luck next time.',
                'Your bait was stolen by a sneaky fish.',
                'The fish outsmarted you this time.',
                'You reeled in nothing but seaweed.',
                'A school of fish swam right past your hook.',
                'Your line got tangled in some rocks.',
                'The fish took one look at your bait and swam away.',
                'You dozed off and missed the bite.',
                'A crab cut your fishing line!',
                'The current was too strong today.',
                'You cast your line but forgot the bait.',
                'A seagull stole your catch right off the hook!',
            ];

            const randomFailMessage = failMessages[Math.floor(Math.random() * failMessages.length)];

            await RagnarokEmbed(client, interaction, 'Fail', randomFailMessage!, true);

            const endTime = Date.now() + this.ecoPrices.fishing.cooldowns.fishFailTime;
            balance.FishCool = Math.round(endTime);

            await balance.save();
            return;
        }

        // Initialize balance items if not present
        if (!balance.Items) {
            balance.Items = {} as Items;
        }

        // Increment fish result amount in balance items
        const amt = (Number(balance.Items[fishResult.name as keyof typeof balance.Items]) || 0) + 1;
        balance.Items[fishResult.name as keyof typeof balance.Items] = amt as never;

        // Build attachment for fish result image
        const attachment = new AttachmentBuilder(`assets/economy/${fishResult.name}.png`);

        // Build fish embed
        const embed = this.buildFishEmbed(interaction, client, fishResult, amt);
        embed.setThumbnail(`attachment://${fishResult.name}.png`);

        // Calculate cooldown time and update balance
        const endTime = Date.now() + this.ecoPrices.fishing.cooldowns.fishWinTime;
        balance.FishCool = Math.round(endTime);
        await balance.save();

        // Defer reply, delete original interaction, update message with embed and attachment
        await interaction.deferReply();
        await interaction.deleteReply();
        await interaction.message?.edit({
            components: [...this.rows],
            embeds: [embed],
            files: [attachment],
        });

        // Update home embed
        await this.updateHomeEmbed(interaction, client);

        // If home embed is available, reset after timeout
        if (this.homeEmbed) {
            setTimeout(async () => {
                // Reset all buttons to primary style and enabled
                for (const row of this.rows) {
                    for (const button of row.components) {
                        button.setStyle(ButtonStyle.Primary);
                        button.setDisabled(false);
                    }
                }
                // Set home button to success style and disabled
                this.homeButton.setStyle(ButtonStyle.Success);
                this.homeButton.setDisabled(true);

                await interaction.message?.edit({
                    components: [...this.rows],
                    embeds: [this.homeEmbed as APIEmbed],
                    files: [],
                });
            }, this.commandTimeout);
        }
    }

    // Function to generate fish result
    generateFishResult() {
        const fishChance = Math.random();

        // Treasure - 0.18% chance
        if (fishChance < 0.0018) {
            return { name: 'Treasure', price: this.ecoPrices.fishing.rewards.treasure };
        }

        // Pufferfish - 3% chance (0.18% to 3.18%)
        if (fishChance < 0.0318) {
            return { name: 'Pufferfish', price: this.ecoPrices.fishing.rewards.pufferfish };
        }

        // Swordfish - 6% chance (3.18% to 9.18%)
        if (fishChance < 0.0918) {
            return { name: 'Swordfish', price: this.ecoPrices.fishing.rewards.swordfish };
        }

        // King Salmon - 18% chance (9.18% to 27.18%)
        if (fishChance < 0.2718) {
            return { name: 'King Salmon', price: this.ecoPrices.fishing.rewards.kingSalmon };
        }

        // Trout - 52% chance (27.18% to 79.18%)
        if (fishChance < 0.7918) {
            return { name: 'Trout', price: this.ecoPrices.fishing.rewards.trout };
        }

        // Fail - 20.82% chance (79.18% to 100%)
        return { name: 'Fail', price: 0 };
    }

    // Function to build fish embed
    buildFishEmbed(
        interaction: ButtonInteraction,
        client: Client,
        fishResult: { name: string; price: number },
        amt: number
    ) {
        const { name, price } = fishResult;

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.displayName}`,
                iconURL: `${interaction.user.avatarURL()}`,
            })
            .setColor(color(interaction.guild!.members.me!.displayHexColor))
            .addFields({
                name: `**${client.user?.username} - Fish**`,
                value: `**◎ Success:** You caught a ${name}! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString('en')}\`\nYou now have \`${amt.toLocaleString('en')}\`.`,
            });

        return embed;
    }

    // Asynchronous function to handle harvest interaction
    async harvest(interaction: ButtonInteraction, client: Client) {
        // Set the state of the harvest button
        this.setButtonState(this.harvestButton);

        // Retrieve user's balance
        const balance = await Balance.findOne({
            IdJoined: `${interaction.user.id}-${interaction.guild!.id}`,
        });

        // If balance is not found, display error and return
        if (!balance || !balance.Boosts) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'An error occurred, please try again.',
                true
            );
            return;
        }

        // Check if user has a farm plot
        if (!balance.Boosts!.FarmPlot) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'You do not have a farming plot! You will be awarded one once you purchase farming tools from the shop. Check `/economy` for more information.',
                true
            );
            return;
        }

        // Update crop statuses
        await this.updateCropStatuses(balance);

        const harvestablecrops = this.getHarvestableCrops(balance);

        // If no farm plots exist
        if (!balance.FarmPlot.length) {
            await RagnarokEmbed(client, interaction, 'Error', 'You have nothing to harvest!', true);
            return;
        }

        // If no crops are ready to harvest, show crop status
        if (!harvestablecrops.length) {
            await this.showCropStatus(interaction, client, balance);
            return;
        }

        // Check if user has space in farm bag
        const availableSpots = balance.Boosts.FarmBag - balance.HarvestedCrops.length;
        if (availableSpots <= 0) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'You do not have enough space to harvest anything!\nYou can upgrade your storage in the shop from `/economy`.',
                true
            );
            return;
        }

        // Harvest crops and calculate results
        const harvestResults = this.processHarvest(balance, availableSpots);

        // await balance.save();

        // Display harvest results
        await this.displayHarvestResults(interaction, client, harvestResults);
    }

    // Helper method to calculate decay based on time elapsed
    private calculateDecay(crop: CropData, currentTime: number): number {
        // If crop is not ready for harvest, no decay
        if (crop.CropStatus !== 'harvest') {
            return crop.Decay;
        }

        // Calculate time elapsed in minutes since last update
        const timeElapsedMinutes =
            (currentTime - (crop.LastUpdateTime || currentTime)) / (1000 * 60);

        // Calculate decay increase (decayRate per minute)
        const decayIncrease = timeElapsedMinutes * this.ecoPrices.farming.decayRate;

        // Update the last update time
        crop.LastUpdateTime = currentTime;

        // Return new decay value, capped at 100
        return Math.min(100, crop.Decay + decayIncrease);
    }

    // Helper method to update crop growth statuses
    private updateCropStatuses(balance: BalanceInterface) {
        const currentTime = Date.now();

        for (const crop of balance.FarmPlot) {
            // Update growth status
            if (typeof crop.CropGrowTime === 'number' && currentTime > crop.CropGrowTime) {
                crop.CropStatus = 'harvest';
                crop.CropGrowTime = 'na';
                crop.Decay = 0;
                crop.LastUpdateTime = currentTime;
            }

            // Update decay for harvestable crops
            if (crop.CropStatus === 'harvest') {
                crop.Decay = this.calculateDecay(crop, currentTime);
            }
        }

        // Update decay for harvested crops
        if (balance.HarvestedCrops) {
            for (const crop of balance.HarvestedCrops) {
                crop.Decay = this.calculateDecay(crop, currentTime);
            }
        }
    }

    // Helper method to get harvestable crops
    private getHarvestableCrops(balance: BalanceInterface) {
        return balance.FarmPlot.filter((crop) => crop.CropStatus === 'harvest');
    }

    // Helper method to show current crop status when nothing is harvestable
    private async showCropStatus(
        interaction: ButtonInteraction,
        client: Client,
        balance: BalanceInterface
    ) {
        const statusEntries: string[] = [];

        const growingCrops = balance.FarmPlot.filter((crop) => crop.CropGrowTime !== 'na');
        const readyCrops = balance.FarmPlot.filter((crop) => crop.CropStatus === 'harvest');

        // Add ready crops to status
        for (const crop of readyCrops) {
            statusEntries.push(
                `\u3000Crop Type: \`${capitalise(crop.CropType)}\` - Crop Decay: \`${crop.Decay.toFixed(4)}%\``
            );
        }

        // Add growing crops to status
        for (const crop of growingCrops) {
            const timeRemaining = this.calculateTimeRemaining(crop.CropGrowTime);
            statusEntries.push(
                `\u3000Crop Type: \`${capitalise(crop.CropType)}\` - Time until grown: \`${timeRemaining}\``
            );
        }

        const embeds = this.createCropStatusEmbeds(interaction, client, statusEntries);
        const firstEmbed = embeds[0];

        if (!firstEmbed) {
            return;
        }

        if (embeds.length > 1) {
            await pagination(interaction, embeds, this.homeButton);
        } else {
            await interaction.reply({ embeds: [firstEmbed.toJSON()], ephemeral: true });
        }
    }

    // Helper method to calculate time remaining for crop growth
    private calculateTimeRemaining(cropGrowTime: number): string {
        const timeDiff = prettyMilliseconds(Date.now() - cropGrowTime, {
            millisecondsDecimalDigits: 1,
        });
        const cleanTime = timeDiff.replace(/-/g, '');
        return cleanTime.substring(0, cleanTime.indexOf('s') + 1);
    }

    // Helper method to create crop status embeds
    private createCropStatusEmbeds(
        interaction: ButtonInteraction,
        client: Client,
        statusEntries: string[]
    ): EmbedBuilder[] {
        const embeds: EmbedBuilder[] = [];
        const totalPages = Math.ceil(statusEntries.length / 5);
        let pageNumber = 1;

        while (statusEntries.length > 0) {
            const pageEntries = statusEntries.splice(0, 5);
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `${interaction.user.displayName}`,
                    iconURL: `${interaction.user.avatarURL()}`,
                })
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .addFields({
                    name: `**${client.user?.username} - Harvest**`,
                    value: `**◎ Success:** Current crop status:\n${pageEntries.join('\n')}`,
                })
                .setFooter({
                    text: totalPages > 1 ? `Page: ${pageNumber++}/${totalPages}` : 'Page 1/1',
                });
            embeds.push(embed);
        }

        return embeds;
    }

    // Helper method to process harvest and return results
    private processHarvest(balance: BalanceInterface, availableSpots: number): HarvestResult {
        const currentTime = Date.now();
        const harvestedCrops: CropData[] = [];
        const displayEntries: string[] = [];
        let totalValue = 0;

        // Process harvest
        for (
            let i = 0, harvested = 0;
            i < balance.FarmPlot.length && harvested < availableSpots;
            i++
        ) {
            const crop = balance.FarmPlot[i];
            if (crop && crop.CropStatus === 'harvest') {
                // Calculate final decay before harvesting
                crop.Decay = this.calculateDecay(crop, currentTime);

                const removedCrop = balance.FarmPlot.splice(i, 1)[0];
                if (removedCrop) {
                    removedCrop.LastUpdateTime = currentTime; // Set harvest time
                    balance.HarvestedCrops.push(removedCrop);
                    harvestedCrops.push(removedCrop);
                    harvested++;
                    i--; // Adjust index after splice
                }
            }
        }

        // Calculate values and create display entries
        for (const crop of harvestedCrops) {
            const cropData = this.calculateCropValue(crop);
            totalValue += cropData.value;
            displayEntries.push(
                `\u3000Crop Type: \`${capitalise(crop.CropType)}\` - Current Value: <:coin:706659001164628008>\`${cropData.value.toLocaleString('en')}\` - Decayed: \`${crop.Decay.toFixed(4)}\`%`
            );
        }

        return { crops: harvestedCrops, totalValue, displayEntries };
    }

    // Helper method to calculate individual crop value with decay
    private calculateCropValue(crop: { CropType: string; Decay: number }): { value: number } {
        const cropPrices: { [key: string]: number } = {
            corn: this.ecoPrices.farming.rewards.corn,
            wheat: this.ecoPrices.farming.rewards.wheat,
            potato: this.ecoPrices.farming.rewards.potatoes,
            tomato: this.ecoPrices.farming.rewards.tomatoes,
        };

        const basePrice = cropPrices[crop.CropType] || 0;
        const value = Math.floor(basePrice * (1 - Number(crop.Decay.toFixed(4)) / 100));

        return { value };
    }

    // Helper method to display harvest results
    private async displayHarvestResults(
        interaction: ButtonInteraction,
        client: Client,
        harvestResults: HarvestResult
    ) {
        const embeds = this.createHarvestResultEmbeds(interaction, client, harvestResults);
        const firstEmbed = embeds[0];

        if (!firstEmbed) {
            return;
        }

        if (embeds.length > 1) {
            await pagination(interaction, embeds, this.homeButton);
        } else {
            await interaction.reply({ embeds: [firstEmbed.toJSON()], ephemeral: true });
        }
    }

    // Helper method to create harvest result embeds
    private createHarvestResultEmbeds(
        interaction: ButtonInteraction,
        client: Client,
        harvestResults: HarvestResult
    ): EmbedBuilder[] {
        const embeds: EmbedBuilder[] = [];
        const { displayEntries, totalValue } = harvestResults;
        const totalPages = Math.ceil(displayEntries.length / 5);
        let pageNumber = 1;

        while (displayEntries.length > 0) {
            const pageEntries = displayEntries.splice(0, 5);
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `${interaction.user.displayName}`,
                    iconURL: `${interaction.user.avatarURL()}`,
                })
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .addFields({
                    name: `**${client.user?.username} - Harvest**`,
                    value: `**◎ Success:** You have harvested the following crops:\n${pageEntries.join('\n')}\n\nIn total, the current value is <:coin:706659001164628008>\`${totalValue.toLocaleString('en')}\`\nThis value of each crop will continue to depreciate, I recommend you sell your crops.`,
                })
                .setFooter({
                    text: totalPages > 1 ? `Page: ${pageNumber++}/${totalPages}` : 'Page 1/1',
                });
            embeds.push(embed);
        }

        return embeds;
    }
}
