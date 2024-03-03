import {
    Client, Discord, Guard, Slash, SlashOption,
} from 'discordx';
import {
    ApplicationCommandOptionType, ChannelType, codeBlock, CommandInteraction, GuildMember, PermissionsBitField,
} from 'discord.js';
import { Category } from '@discordx/utilities';
import { BotHasPerm } from '../../guards/BotHasPerm.js';
import { RagnarokEmbed } from '../../utils/Util.js';

@Discord()
@Category('Moderation')
export class Sudo {
    /**
     * Send a message as another user
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param user - The user to send the message as
     * @param input - The message to send as the user
     */
    @Slash({
        description: 'Send a message as the bot',
        defaultMemberPermissions: [PermissionsBitField.Flags.ManageMessages],
    })
    @Guard(BotHasPerm([PermissionsBitField.Flags.ManageWebhooks]))
    async sudo(
        @SlashOption({
            description: 'The user to send the message as',
            name: 'user',
            required: true,
            type: ApplicationCommandOptionType.User,
        })
            user: GuildMember,
        @SlashOption({
            description: 'The message to send as the user',
            name: 'input',
            type: ApplicationCommandOptionType.String,
        })
            input: string,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        if (interaction.channel!.type !== ChannelType.GuildText) {
            await RagnarokEmbed(client, interaction, 'Error', 'The channel type must be a text channel.', true);
            return;
        }

        await interaction.channel!.createWebhook({
            name: user.displayName,
            avatar: user.displayAvatarURL({ extension: 'png' }),
            reason: 'Ragnarok sudo command',
        }).then(async (webhook) => {
            await interaction.deferReply();
            await interaction.deleteReply();

            webhook.send(input);

            setTimeout(() => {
                webhook.delete();
            }, 3000);
        }).catch(async (error) => {
            await RagnarokEmbed(client, interaction, 'Error', `An error occurred\n${codeBlock('text', `${error}`)}`, true);
        });
    }
}
