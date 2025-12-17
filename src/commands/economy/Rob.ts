import { Category } from '@discordx/utilities';
import {
    ApplicationCommandOptionType,
    type CommandInteraction,
    type GuildMember,
} from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import ms from 'ms';
import Balance from '../../mongo/Balance.js';
import { RagnarokComponent } from '../../utils/Util.js';

@Discord()
@Category('Economy')
export class Rob {
    /**
     * Attempt to steal money from a user
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param user - User to steam from
     */
    @Slash({ description: 'Attempt to steal money from a user' })
    async rob(
        @SlashOption({
            description: 'User to steal from',
            name: 'user',
            type: ApplicationCommandOptionType.User,
            required: true,
        })
        user: GuildMember,
        interaction: CommandInteraction
    ): Promise<void> {
        const balance = await Balance.findOneAndUpdate(
            { IdJoined: `${interaction.user.id}-${interaction.guild!.id}` },
            { $setOnInsert: { IdJoined: `${interaction.user.id}-${interaction.guild!.id}` } },
            {
                upsert: true,
                new: true,
            }
        );

        const otherB = await Balance.findOneAndUpdate(
            { IdJoined: `${user.id}-${interaction.guild!.id}` },
            { $setOnInsert: { IdJoined: `${user.id}-${interaction.guild!.id}` } },
            {
                upsert: true,
                new: true,
            }
        );

        if (!balance) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Could not load your balance. Send a message in this server to create an economy profile, then retry the heist.',
                true
            );
            return;
        }

        if (user.id === interaction.user.id) {
            await RagnarokComponent(
                interaction,
                'Error',
                "You can't steal from yourself. <:wut:745408596233289839>",
                true
            );
            return;
        }

        if (!otherB) {
            await RagnarokComponent(
                interaction,
                'Error',
                `${user} does not have an economy account. They will instantly open one when they send a message within this guild.`,
                true
            );
            return;
        }

        if (Date.now() > balance.StealCool) {
            balance.StealCool = 0;

            if (otherB.Cash < 10) {
                await RagnarokComponent(
                    interaction,
                    'Error',
                    'The specified user does not have enough cash to steal!',
                    true
                );
                return;
            }

            let stealAmount: number;

            const stealChance = Math.random(); // give you a random number between 0 and 1
            if (stealChance < 0.75) {
                // there's a 75% chance of this happening
                // Generates a random percentage between 35 and 85
                const stealPercentage = Math.floor(Math.random() * 51) + 35;

                // Calculates the steal amount based on the percentage
                stealAmount = Math.floor(otherB.Cash * (stealPercentage / 100));

                otherB.Cash -= stealAmount;
                otherB.Total -= stealAmount;
                await otherB.save();

                // Sets cooldown time
                balance.StealCool = Date.now() + 120_000;
                balance.Cash += stealAmount;
                balance.Total += stealAmount;
                await balance.save();

                const succMessage = [
                    // 30
                    `You held ${user} at gun-point and stole <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
                    `You stabbed ${user} and took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\` from their wallet.`,
                    `You hired someone to mug ${user}, you received <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
                    `${user} said they watch anime, you kicked them in the face and took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
                    `You snuck up on ${user} and pick-pocketed <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
                    `*slaps ${user} with a large trout*, they dropped <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
                    `You tricked ${user} into giving you <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
                    `You petrified ${user}, they ran away and dropped <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
                    `You went to ${user}'s house and stole his college fund worth <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
                    `You noticed ${user} was drunk so you stole <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\` from them.`,
                    `${user} tried to mug you, but you had an uno reverse card. You stole <:coin:706659001164628008> \`${stealAmount.toLocaleString(
                        'en'
                    )}\` from them.`,
                    `You successfully snuck into ${user}'s vault and made off with <:coin:706659001164628008> ${stealAmount.toLocaleString('en')}.`,
                    `You and your crew pulled off a daring heist, robbing ${user}'s safe and getting away with <:coin:706659001164628008> ${stealAmount.toLocaleString(
                        'en'
                    )}.`,
                    `You hacked into ${user}'s accounts and transferred <:coin:706659001164628008> ${stealAmount.toLocaleString('en')} into your own account.`,
                    `You disguised yourself as a delivery person and stole <:coin:706659001164628008> ${stealAmount.toLocaleString(
                        'en'
                    )} from ${user}'s company's safe.`,
                    `You masterminded a successful con, tricking ${user} into giving up <:coin:706659001164628008> ${stealAmount.toLocaleString('en')}.`,
                    `You pulled off a high-stakes heist, successfully stealing <:coin:706659001164628008> ${stealAmount.toLocaleString(
                        'en'
                    )} from ${user}'s casino.`,
                    `You led your team of thieves to success, making off with <:coin:706659001164628008> ${stealAmount.toLocaleString(
                        'en'
                    )} from ${user}'s mansion.`,
                    `You infiltrated ${user}'s organization and made off with a cool <:coin:706659001164628008> ${stealAmount.toLocaleString('en')}`,
                    `You pulled off the perfect heist, stealing <:coin:706659001164628008> ${stealAmount.toLocaleString(
                        'en'
                    )} from ${user}'s high-security vault.`,
                    `You disguised yourself as a janitor and stole <:coin:706659001164628008> ${stealAmount.toLocaleString('en')} from ${user}'s office.`,
                    `You used your charm and wit to swindle <:coin:706659001164628008> ${stealAmount.toLocaleString('en')} from ${user}.`,
                    `You robbed ${user}'s armored car and made off with <:coin:706659001164628008> ${stealAmount.toLocaleString('en')}`,
                    `You successfully pulled off a cyber heist, stealing <:coin:706659001164628008> ${stealAmount.toLocaleString(
                        'en'
                    )} from ${user}'s online accounts.`,
                    `You and your team executed a flawless heist, stealing <:coin:706659001164628008> ${stealAmount.toLocaleString(
                        'en'
                    )} from ${user}'s high-end jewelry store.`,
                    `You posed as a wealthy investor and swindled <:coin:706659001164628008> ${stealAmount.toLocaleString('en')} from ${user}.`,
                    `You robbed ${user}'s train and made off with <:coin:706659001164628008> ${stealAmount.toLocaleString('en')}`,
                    `You successfully hacked ${user}'s accounts and transferred <:coin:706659001164628008> ${stealAmount.toLocaleString(
                        'en'
                    )} to your own accounts.`,
                    `You pulled off a daring heist and made off with <:coin:706659001164628008> ${stealAmount.toLocaleString('en')} from ${user}'s Bank.`,
                    `You outsmarted ${user} and stole <:coin:706659001164628016> ${stealAmount.toLocaleString('en')}`,
                ];

                await RagnarokComponent(
                    interaction,
                    'Success',
                    `${succMessage[Math.floor(Math.random() * succMessage.length)]}`
                );
            } else {
                // Generates a random percentage between 5 and 10
                const stealPercentage = Math.floor(Math.random() * 6) + 5;

                // Calculates the steal amount based on the percentage
                stealAmount = Math.floor(balance.Bank * (stealPercentage / 100));

                otherB.Bank += stealAmount;
                otherB.Total += stealAmount;
                await otherB.save();

                // Sets cooldown time
                balance.StealCool = Date.now() + 240_000;
                balance.Bank -= stealAmount;
                balance.Total -= stealAmount;
                await balance.save();

                const failMessage = [
                    // 13
                    `You tried to mug ${user} but they over-powered you${
                        stealAmount > 1
                            ? ` and took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`
                            : '.'
                    }`,
                    `You held ${user} at knife point but they knew Karate${
                        stealAmount > 1
                            ? ` and stole your lunch money <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`
                            : '.'
                    }`,
                    `You challenged ${user} to a 1v1 and lost${stealAmount > 1 ? ` <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.` : '.'}`,
                    `You hired someone to mug ${user}${
                        stealAmount > 1
                            ? ` but they mugged you instead and took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`
                            : ` ${user} fought him off.`
                    }`,
                    `You tried to stab ${user}, but they said 'no u'${
                        stealAmount > 1
                            ? ` and you stabbed yourself. You lost <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`
                            : ' and walked away.'
                    }`,
                    `You tried to steal from ${user} but they caught you${
                        stealAmount > 1
                            ? ` and they took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\` from you.`
                            : ", they simply said 'pathetic' and walked away."
                    }`,
                    `You asked ${user} for financial advice and lost <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
                    `${user} had a gun and you did not... They stole <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\` from you.`,
                    `You tried to mug ${user} but they were too drunk to fight back. They stole <:coin:706659001164628008> \`${stealAmount.toLocaleString(
                        'en'
                    )}\`.`,
                    `You tried to mug ${user} but they shot you. You lost <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
                    `${user} was drunk and you tried to mug them. You stabbed yourself and lost <:coin:706659001164628008> \`${stealAmount.toLocaleString(
                        'en'
                    )}\`.`,
                    `You tried to mug ${user} but they were too drunk to fight back. You tried to stab them, but they said 'no u' and you stabbed yourself. You lost <:coin:706659001164628008> \`${stealAmount.toLocaleString(
                        'en'
                    )}\`.`,
                    `${user} was a ninja and you tried to steal from them. They threw you out the window and stole <:coin:706659001164628008> \`${stealAmount.toLocaleString(
                        'en'
                    )}\`.`,
                ];

                await RagnarokComponent(
                    interaction,
                    'Fail',
                    `${failMessage[Math.floor(Math.random() * failMessage.length)]}`
                );
            }
        } else {
            await RagnarokComponent(
                interaction,
                'Error',
                `Please wait \`${ms(balance.StealCool - Date.now(), { long: true })}\`, before using this command again!`,
                true
            );
        }
    }
}
