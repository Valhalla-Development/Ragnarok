import { Category } from '@discordx/utilities';
import {
    ApplicationCommandOptionType,
    ChannelType,
    type CommandInteraction,
    codeBlock,
    type GuildMember,
    PermissionsBitField,
    type TextChannel,
} from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { RagnarokComponent } from '../../utils/Util.js';

@Discord()
@Category('Moderation')
export class Say {
    /**
     * Send a message as the bot
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param input - The message to send
     * @param channel - The channel to send the message in (optional)
     */
    @Slash({
        defaultMemberPermissions: [PermissionsBitField.Flags.ManageMessages],
        description: 'Send a message as the bot',
    })
    async say(
        @SlashOption({
            description: 'The message to send',
            maxLength: 100,
            minLength: 2,
            name: 'input',
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        input: string,
        @SlashOption({
            description: 'The channel to send the message in (optional)',
            name: 'channel',
            type: ApplicationCommandOptionType.Channel,
        })
        channel: TextChannel | undefined,
        interaction: CommandInteraction
    ): Promise<void> {
        if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
            return;
        }

        const targetChannel = channel ?? interaction.channel;
        const member = interaction.member as GuildMember;

        if (!member.permissionsIn(targetChannel).has(PermissionsBitField.Flags.SendMessages)) {
            await RagnarokComponent(
                interaction,
                'Error',
                `You do not have permission to send messages to ${targetChannel}`,
                true
            );
            return;
        }

        try {
            if (targetChannel.type !== ChannelType.GuildText) {
                await RagnarokComponent(
                    interaction,
                    'Error',
                    'Please input a valid **Text** channel.',
                    true
                );
                return;
            }

            await targetChannel.send(input);

            await RagnarokComponent(
                interaction,
                'Success',
                `The following message has been posted in ${targetChannel}\n\n${codeBlock('text', input)}`,
                true
            );
        } catch (error) {
            await RagnarokComponent(
                interaction,
                'Error',
                `An error occurred\n${codeBlock('text', `${error}`)}`,
                true
            );
        }
    }
}
