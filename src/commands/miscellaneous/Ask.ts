import { Category } from '@discordx/utilities';
import { ApplicationCommandOptionType, type CommandInteraction } from 'discord.js';
import { type Client, Discord, Slash, SlashOption } from 'discordx';
import {
    buildAIGroupId,
    getAIAllowedChannels,
    getAIGuildPersona,
    isAIChannelAllowed,
    isAIGuildEnabled,
    runAIChat,
} from '../../utils/ai/Index.js';
import { RagnarokComponent } from '../../utils/Util.js';

@Discord()
@Category('Miscellaneous')
export class Ask {
    @Slash({ description: 'Ask the AI chatbot a question.' })
    async ask(
        @SlashOption({
            description: 'What do you want to ask?',
            name: 'query',
            required: true,
            type: ApplicationCommandOptionType.String,
            minLength: 4,
            maxLength: 2000,
        })
        query: string,
        interaction: CommandInteraction,
        client: Client
    ): Promise<void> {
        if (!(await isAIChannelAllowed(interaction.guildId, interaction.channelId))) {
            const guildId = interaction.guildId;
            const guildEnabled = guildId ? await isAIGuildEnabled(guildId) : true;

            if (!guildEnabled) {
                await RagnarokComponent(
                    interaction,
                    'Error',
                    'AI is currently disabled for this server. Staff can enable it via `/config` (AI module).',
                    true
                );
                return;
            }

            const allowedChannels = interaction.guildId
                ? await getAIAllowedChannels(interaction.guildId)
                : [];
            const allowedChannelText =
                allowedChannels.length > 0
                    ? `Allowed channels: ${allowedChannels.map((id) => `<#${id}>`).join(', ')}`
                    : 'All channels are currently allowed.';

            await RagnarokComponent(
                interaction,
                'Error',
                `AI is disabled in this channel.\n${allowedChannelText}`,
                true
            );
            return;
        }

        await interaction.deferReply();

        const groupId = buildAIGroupId({
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
        });

        const personaId = interaction.guildId
            ? await getAIGuildPersona(interaction.guildId)
            : 'default';
        const result = await runAIChat({
            userId: interaction.user.id,
            groupId,
            prompt: query,
            displayName: interaction.user.displayName,
            botName:
                interaction.guild?.members.me?.displayName ??
                client.user?.displayName ??
                'Assistant',
            personaId,
        });

        if (!result.ok) {
            await RagnarokComponent(interaction, 'Error', result.message, true);
            return;
        }

        const [first, ...rest] = result.chunks;
        await interaction.editReply({
            content: first,
            allowedMentions: { parse: [] },
        });

        for (const chunk of rest) {
            await interaction.followUp({
                content: chunk,
                allowedMentions: { parse: [] },
            });
        }
    }
}
