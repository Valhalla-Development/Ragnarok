import {
    ApplicationCommandType,
    type GuildMember,
    type UserContextMenuCommandInteraction,
} from 'discord.js';
import { ContextMenu, Discord } from 'discordx';
import moment from 'moment';
import BirthdayConfig from '../mongo/BirthdayConfig.js';
import Birthdays from '../mongo/Birthdays.js';
import { RagnarokComponent } from '../utils/Util.js';

@Discord()
export class BirthdayContext {
    /**
     * View the birthday of the author of the interaction or a specified user.
     * @param interaction - The command interaction
     * @param client - The Discord client.
     */
    @ContextMenu({
        name: 'Birthday',
        type: ApplicationCommandType.User,
    })
    async birthdayContext(interaction: UserContextMenuCommandInteraction): Promise<void> {
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

        const member = interaction.targetMember as GuildMember;
        await member.fetch();

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
}
