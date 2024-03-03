import {
    Client, Discord, Slash, SlashGroup, SlashOption,
} from 'discordx';
import {
    ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember,
} from 'discord.js';
import { Category } from '@discordx/utilities';
import moment from 'moment';
import ms from 'ms';
import BirthdayConfig from '../../mongo/BirthdayConfig';
import Birthdays from '../../mongo/Birthdays.js';
import { color, RagnarokEmbed } from '../../utils/Util.js';

@Discord()
@Category('Fun')
@SlashGroup({ description: 'Set or view birthdays', name: 'birthday' })
@SlashGroup('birthday')
export class Birthday {
    /**
     * View the birthday of the author of the interaction or a specified user.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param user - Optional user to fetch
     */
    @Slash({ description: 'View the birthday of the author of the interaction or a specified user.', name: 'view' })
    async view(
        @SlashOption({
            description: 'View birthday of a user',
            name: 'user',
            type: ApplicationCommandOptionType.User,
        })
            user: GuildMember,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        const birthdayConfigDB = await BirthdayConfig.findOne({ GuildId: interaction.guild!.id });

        if (!birthdayConfigDB) {
            await RagnarokEmbed(client, interaction, 'Error', 'Birthdays are currently disabled on this server. An admin may need to enable this feature by running `/config birthday`.', true);
            return;
        }

        const member = user || interaction.member;

        const birthdayDB = await Birthdays.findOne({ UserId: member.id });

        if (!birthdayDB) {
            await RagnarokEmbed(client, interaction, 'Error', `${member} does not have a birthday set!`, true);
            return;
        }

        const nextBirthdayDate = moment(birthdayDB.Date, 'MM/DD').year(moment().year());
        if (nextBirthdayDate.isBefore(moment())) {
            nextBirthdayDate.add(1, 'year');
        }

        const timeUntilNextBirthday = moment.duration(nextBirthdayDate.diff(moment())).humanize();
        const nextBirthdayFormatted = nextBirthdayDate.format('MMMM Do');

        await RagnarokEmbed(client, interaction, '🎉', `${member}'s **next** birthday is in **${timeUntilNextBirthday}**, on **${nextBirthdayFormatted}**.`);
    }

    /**
     * The ability to set your birthdays
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param date - Date of users birthday
     */
    @Slash({ description: 'The ability to set your birthdays', name: 'set' })
    async set(
        @SlashOption({
            description: 'Set your birthday',
            name: 'date',
            required: true,
            type: ApplicationCommandOptionType.String,
        })
            date: string,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        const validateDate = moment(date, 'MM/DD/YYYY', true).isValid();

        if (!validateDate) {
            await RagnarokEmbed(client, interaction, 'Error', 'Please input a valid date! Input should be in the format `MM/DD/YYYY`. For example: `12/31/2024`', true);
            return;
        }

        const birthdayUpd = moment(date, 'MM/DD/YYYY');
        const now = moment();

        if (birthdayUpd.isAfter(now)) {
            await RagnarokEmbed(client, interaction, 'Error', `You tried to set your birthday to: \`${date}\`. However, that date is in the future <:wut:745408596233289839>`, true);
            return;
        }

        await Birthdays.findOneAndUpdate(
            { UserId: interaction.user.id },
            { Date: date, UserId: interaction.user.id, LastRun: null },
            { upsert: true, new: true },
        );

        await RagnarokEmbed(client, interaction, 'Success', `Your birthday has been successfully set to \`${date}\`.`);
    }

    /**
     * Delete your birthday from the database
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'Delete your birthday data', name: 'delete' })
    async deleteBirthday(interaction: CommandInteraction, client: Client): Promise<void> {
        const birthdayDB = await Birthdays.findOneAndDelete({ UserId: interaction.user.id });

        if (!birthdayDB) {
            await RagnarokEmbed(client, interaction, 'Error', 'Unable to locate your birthday in the database.', true);
            return;
        }

        await RagnarokEmbed(client, interaction, 'Success', 'Your birthday has been successfully removed from the database.');
    }

    /**
     * The ability to set or view birthdays
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'List all birthdays', name: 'all' })
    @SlashGroup('list', 'birthday')
    async list(interaction: CommandInteraction, client: Client): Promise<void> {
        // Fetch all birthdays from the database
        const rows = await Birthdays.find();

        // Filter the rows to include only users who are in the guild
        const filteredRows = rows.filter((row) => {
            // Check if UserId is defined and not null
            if (row.UserId) {
                return interaction.guild!.members.cache.has(row.UserId);
            }
            return false; // Filter out rows with undefined or null UserId
        });

        if (!filteredRows.length) {
            await RagnarokEmbed(client, interaction, 'Error', 'There are no users with a defined birthday within this guild.', true);
            return;
        }

        // Sort the birthdays by the number of days until each one
        const sortedRows = filteredRows.sort((a, b) => {
            const today = moment();

            const nextBirthdayA = moment(a.Date, 'MM/DD/YYYY');
            const nextBirthdayB = moment(b.Date, 'MM/DD/YYYY');

            if (nextBirthdayA.isBefore(today)) {
                nextBirthdayA.add(1, 'year');
            }
            if (nextBirthdayB.isBefore(today)) {
                nextBirthdayB.add(1, 'year');
            }

            return nextBirthdayA.diff(today, 'days') - nextBirthdayB.diff(today, 'days');
        });

        // Create paginated embeds
        const itemsPerPage = 10;
        const embeds = [];
        for (let i = 0; i < sortedRows.length; i += itemsPerPage) {
            const pageRows = sortedRows.slice(i, i + itemsPerPage);

            const embed = new EmbedBuilder()
                .setAuthor({ name: `Birthdays for ${interaction.guild!.name}`, iconURL: `${interaction.guild!.iconURL()}` })
                .setColor(color(interaction.guild!.members.me!.displayHexColor));

            const userField = pageRows
                .map((row) => {
                    // Check if UserId is defined and not null
                    if (row.UserId) {
                        const member = interaction.guild!.members.cache.get(row.UserId);
                        return member ? member.toString() : 'Unknown User';
                    }
                    return 'Unknown User';
                })
                .join('\n');

            const dateField = pageRows.map((row) => {
                const date = moment(row.Date, 'MM/DD/YYYY').format('Do MMMM');
                return `\`${date}\``;
            }).join('\n');

            const countdownField = pageRows.map((row) => {
                let year;

                const bdayNow = moment();
                const nextBirthday = row.Date.slice(0, row.Date.length - 4);

                const birthdayNext = new Date(nextBirthday + bdayNow.year());
                const getNow = new Date();
                if (birthdayNext > getNow) {
                    year = bdayNow.year();
                } else {
                    year = bdayNow.year() + 1;
                }

                const then = moment(nextBirthday + year, 'MM/DD/YYYY');
                const diffInMilliseconds = then.diff(bdayNow);

                return `\`${ms(diffInMilliseconds, { long: true })}\``;
            }).join('\n');

            embed.addFields(
                { name: 'User', value: userField, inline: true },
                { name: 'Date', value: dateField, inline: true },
                { name: 'In', value: countdownField, inline: true },
            );

            if (sortedRows.length > itemsPerPage) {
                embed.setFooter({ text: `Page ${Math.floor(i / itemsPerPage) + 1}/${Math.ceil(sortedRows.length / itemsPerPage)}` });
            }

            embeds.push(embed);
        }

        // Send the paginated list to the channel
        if (embeds.length > 1) {
            // pagination(interaction, embeds); // got to update
        } else {
            await interaction.reply({ embeds });
        }
    }
}
