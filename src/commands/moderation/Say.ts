import {
    Client, Discord, Slash, SlashOption,
} from 'discordx';
import {
    ApplicationCommandOptionType, ChannelType, codeBlock, CommandInteraction, GuildMember, PermissionsBitField, TextChannel,
} from 'discord.js';
import { Category } from '@discordx/utilities';
import { RagnarokEmbed } from '../../utils/Util.js';

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
        description: 'Send a message as the bot',
        defaultMemberPermissions: [PermissionsBitField.Flags.ManageMessages],
    })
    async say(
        @SlashOption({
            description: 'The message to send',
            name: 'input',
            required: true,
            type: ApplicationCommandOptionType.String,
            minLength: 2,
            maxLength: 100,
        })
            input: string,
        @SlashOption({
            description: 'The channel to send the message in (optional)',
            name: 'channel',
            type: ApplicationCommandOptionType.Channel,
        })
            channel: TextChannel,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        const member = interaction.member as GuildMember;

        if (!member!.permissionsIn(channel || interaction.channel).has(PermissionsBitField.Flags.SendMessages)) {
            await RagnarokEmbed(client, interaction, 'Error', `You do not have permission to send messages to ${channel}`, true);
            return;
        }

        try {
            if (channel) {
                if (channel.type !== ChannelType.GuildText) {
                    await RagnarokEmbed(client, interaction, 'Error', 'Please input a valid **Text** channel.', true);
                    return;
                }

                await channel.send(input);

                await RagnarokEmbed(client, interaction, 'Success', `The following message has been posted in ${channel}\n\n${codeBlock('text', input)}`, true);
            } else {
                await interaction.deferReply();
                await interaction.deleteReply();

                interaction.channel!.send(input);
            }
        } catch (error) {
            await RagnarokEmbed(client, interaction, 'Error', `An error occurred\n${codeBlock('text', `${error}`)}`, true);
        }
    }
}
