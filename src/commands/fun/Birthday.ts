import { Category } from '@discordx/utilities';
import {
    ApplicationCommandOptionType,
    type CommandInteraction,
    ContainerBuilder,
    type GuildMember,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import moment from 'moment';
import ms from 'ms';
import BirthdayConfig from '../../mongo/BirthdayConfig.js';
import Birthdays from '../../mongo/Birthdays.js';
import { paginationComponentsV2, RagnarokComponent } from '../../utils/Util.js';

@Discord()
@Category('Fun')
export class Birthday {
    /**
     * View the birthday of the author of the interaction or a specified user.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param user - Optional user to fetch
     */
    @Slash({
        description: 'View the birthday of yourself or another user.',
        name: 'birthday',
    })
    async birthday(
        @SlashOption({
            description: 'View birthday of a user',
            name: 'user',
            type: ApplicationCommandOptionType.User,
            required: false,
        })
        user: GuildMember | null,
        interaction: CommandInteraction
    ): Promise<void> {
        const birthdayConfigDB = await BirthdayConfig.findOne({ GuildId: interaction.guild!.id });

        if (!birthdayConfigDB) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Birthdays are currently disabled on this server. An admin may need to enable this feature by running `/config birthday`.',
                true
            );
            return;
        }

        const member = user || (interaction.member as GuildMember | null);
        if (!member) {
            await RagnarokComponent(interaction, 'Error', 'Could not find member.', true);
            return;
        }

        const birthdayDB = await Birthdays.findOne({ UserId: member.id });

        if (!birthdayDB) {
            await RagnarokComponent(
                interaction,
                'Error',
                `${member} does not have a birthday set!`,
                true
            );
            return;
        }

        const nextBirthdayDate = moment(birthdayDB.Date, 'MM/DD').year(moment().year());
        if (nextBirthdayDate.isBefore(moment())) {
            nextBirthdayDate.add(1, 'year');
        }

        const timeUntilNextBirthday = moment.duration(nextBirthdayDate.diff(moment())).humanize();
        const nextBirthdayFormatted = nextBirthdayDate.format('MMMM Do');

        await RagnarokComponent(
            interaction,
            '🎉',
            `${member}'s **next** birthday is in **${timeUntilNextBirthday}**, on **${nextBirthdayFormatted}**.`
        );
    }

    /**
     * The ability to set your birthdays
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param date - Date of users birthday
     */
    @Slash({ description: 'Set your birthday', name: 'birthday-set' })
    async set(
        @SlashOption({
            description: 'Set your birthday (MM/DD/YYYY). Example: 12/31/2024',
            name: 'date',
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        date: string,
        interaction: CommandInteraction
    ): Promise<void> {
        const birthdayConfigDB = await BirthdayConfig.findOne({ GuildId: interaction.guild!.id });
        if (!birthdayConfigDB) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Birthdays are currently disabled on this server. An admin may need to enable this feature by running `/config birthday`.',
                true
            );
            return;
        }

        const validateDate = moment(date, 'MM/DD/YYYY', true).isValid();

        if (!validateDate) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Please input a valid date! Input should be in the format `MM/DD/YYYY`. For example: `12/31/2024`',
                true
            );
            return;
        }

        const birthdayUpd = moment(date, 'MM/DD/YYYY');
        const now = moment();

        if (birthdayUpd.isAfter(now)) {
            await RagnarokComponent(
                interaction,
                'Error',
                `You tried to set your birthday to: \`${date}\`. However, that date is in the future <:wut:745408596233289839>`,
                true
            );
            return;
        }

        await Birthdays.findOneAndUpdate(
            { UserId: interaction.user.id },
            { Date: date, UserId: interaction.user.id, LastRun: null },
            { upsert: true, new: true }
        );

        await RagnarokComponent(
            interaction,
            'Success',
            `Your birthday has been successfully set to \`${date}\`.`
        );
    }

    /**
     * Delete your birthday from the database
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'Delete your birthday data', name: 'birthday-delete' })
    async deleteBirthday(interaction: CommandInteraction): Promise<void> {
        const birthdayConfigDB = await BirthdayConfig.findOne({ GuildId: interaction.guild!.id });
        if (!birthdayConfigDB) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Birthdays are currently disabled on this server. An admin may need to enable this feature by running `/config birthday`.',
                true
            );
            return;
        }

        const birthdayDB = await Birthdays.findOneAndDelete({ UserId: interaction.user.id });

        if (!birthdayDB) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Unable to locate your birthday in the database.',
                true
            );
            return;
        }

        await RagnarokComponent(
            interaction,
            'Success',
            'Your birthday has been successfully removed from the database.'
        );
    }

    /**
     * The ability to set or view birthdays
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'List all birthdays', name: 'birthdays' })
    async list(interaction: CommandInteraction): Promise<void> {
        const birthdayConfigDB = await BirthdayConfig.findOne({ GuildId: interaction.guild!.id });
        if (!birthdayConfigDB) {
            await RagnarokComponent(
                interaction,
                'Error',
                'Birthdays are currently disabled on this server. An admin may need to enable this feature by running `/config birthday`.',
                true
            );
            return;
        }

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
            await RagnarokComponent(
                interaction,
                'Error',
                'There are no users with a defined birthday within this guild.',
                true
            );
            return;
        }

        const now = moment();

        const computeNextBirthday = (dateStr: string) => {
            const parsed = moment(dateStr, ['MM/DD/YYYY', 'MM/DD'], true);
            if (!parsed.isValid()) {
                return null;
            }

            // Normalize to the next occurrence of this month/day
            const next = moment(parsed).year(now.year());
            // If it already passed (strictly before today), push to next year
            if (next.isBefore(now, 'day')) {
                next.add(1, 'year');
            }
            return next;
        };

        // Sort by upcoming birthday date (soonest first)
        const sortedRows = filteredRows
            .map((row) => {
                const next = row.Date ? computeNextBirthday(row.Date) : null;
                return { row, next };
            })
            .filter(
                (x): x is { row: (typeof filteredRows)[number]; next: moment.Moment } => !!x.next
            )
            .sort((a, b) => a.next.valueOf() - b.next.valueOf())
            .map((x) => x.row);

        const itemsPerPage = 10;
        const totalPages = Math.max(1, Math.ceil(sortedRows.length / itemsPerPage));

        const buildPage = (pageIndex: number): Promise<ContainerBuilder> => {
            const clamped = Math.min(Math.max(0, pageIndex), totalPages - 1);
            const start = clamped * itemsPerPage;
            const pageRows = sortedRows.slice(start, start + itemsPerPage);

            const lines = pageRows.map((row) => {
                const member = row.UserId
                    ? (interaction.guild!.members.cache.get(row.UserId) ?? null)
                    : null;

                const bdayNow = moment();
                const next =
                    (row.Date ? computeNextBirthday(row.Date) : null) ??
                    moment(row.Date ?? '', ['MM/DD/YYYY', 'MM/DD']);
                const datePretty = next.isValid() ? next.format('Do MMMM') : 'Unknown';
                const diffInMilliseconds = next.isValid() ? next.diff(bdayNow) : 0;
                const inText = next.isValid() ? ms(diffInMilliseconds, { long: true }) : 'Unknown';

                return `- ${member ? member.toString() : '`Unknown User`'} • \`${datePretty}\` • \`${inText}\``;
            });

            const header = new TextDisplayBuilder().setContent(
                ['# 🎂 Birthdays', totalPages > 1 ? `> Page: ${clamped + 1}/${totalPages}` : '']
                    .filter(Boolean)
                    .join('\n')
            );

            const body = new TextDisplayBuilder().setContent(
                lines.length ? lines.join('\n') : '_No results._'
            );

            return Promise.resolve(
                new ContainerBuilder()
                    .addTextDisplayComponents(header)
                    .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
                    .addTextDisplayComponents(body)
            );
        };

        await paginationComponentsV2(interaction, buildPage, totalPages);
    }
}
