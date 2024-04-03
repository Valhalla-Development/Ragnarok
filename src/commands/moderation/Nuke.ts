import {
    Client, Discord, Guard, Slash,
} from 'discordx';
import {
    ChannelType, codeBlock, CommandInteraction, PermissionsBitField,
} from 'discord.js';
import { Category } from '@discordx/utilities';
import { BotHasPerm } from '../../guards/BotHasPerm.js';
import { RagnarokEmbed } from '../../utils/Util.js';

@Discord()
@Category('Moderation')
export class Nuke {
    /**
     * Nuke a channel.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({
        description: 'Nuke a channel.',
        defaultMemberPermissions: [PermissionsBitField.Flags.Administrator],
    })
    @Guard(BotHasPerm([PermissionsBitField.Flags.ManageChannels]))
    async nuke(interaction: CommandInteraction, client: Client): Promise<void> {
        if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
            await RagnarokEmbed(client, interaction, 'Error', 'The interaction channel type was not a text based channel.', true);
            return;
        }

        try {
            const newChannel = await interaction.channel.clone({
                name: interaction.channel.name,
                reason: 'Nuked!',
            });

            await newChannel.setParent(interaction.channel.parentId);
            await newChannel.setPosition(interaction.channel.rawPosition);

            await interaction.channel.delete();

            await newChannel.send({ content: 'Channel has been nuked!\nhttps://tenor.com/view/explosion-mushroom-cloud-atomic-bomb-bomb-boom-gif-4464831' });
        } catch (error) {
            await RagnarokEmbed(client, interaction, 'Error', `An error occurred\n${codeBlock('text', `${error}`)}`, true);
        }
    }
}
