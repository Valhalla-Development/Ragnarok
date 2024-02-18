import {
    Client, Discord, Slash, SlashChoice, SlashOption,
} from 'discordx';
import { ApplicationCommandOptionType, CommandInteraction, PermissionsBitField } from 'discord.js';
import { Category } from '@discordx/utilities';

@Discord()
@Category('Hidden')
export class Emit {
    /**
     * Developer command to trigger specific events.
     * @param event - Event to trigger
     * @param interaction - The command interaction.
     * @param client
     */
    @Slash({
        description: 'Developer command to trigger specific events.\n',
        defaultMemberPermissions: [PermissionsBitField.Flags.Administrator],
    })
    async emit(
        @SlashChoice({ name: 'guildMemberAdd', value: 'guildMemberAdd' })
        @SlashChoice({ name: 'guildMemberRemove', value: 'guildMemberRemove' })
        @SlashChoice({ name: 'guildBanAdd', value: 'guildBanAdd' })
        @SlashChoice({ name: 'guildBanRemove', value: 'guildBanRemove' })
        @SlashChoice({ name: 'channelUpdate', value: 'channelUpdate' })
        @SlashOption({
            description: 'Specify which event to trigger.',
            name: 'event',
            required: true,
            type: ApplicationCommandOptionType.String,
        })
            event: string,
            interaction: CommandInteraction,
            client: Client,
    ) {
        await interaction.deferReply();
        await interaction.deleteReply();

        try {
            client.emit(event, interaction.member);
        } catch (error) {
            console.error(error);
        }
    }
}
