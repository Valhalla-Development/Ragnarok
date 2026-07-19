import {
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    ContainerBuilder,
    type Guild,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import Honeypot from '../mongo/Honeypot.js';

export type HoneypotMode = 'ban' | 'softban';

/**
 * Normalizes a stored mode value to a valid HoneypotMode, defaulting to 'ban'.
 * @param mode - The raw mode value from the database.
 */
export function resolveHoneypotMode(mode?: string | null): HoneypotMode {
    return mode === 'softban' ? 'softban' : 'ban';
}

/**
 * Builds the honeypot warning container with mode-aware copy and a live counter button.
 * @param actionCount - Number of successful honeypot actions taken in this guild.
 * @param mode - The configured action mode.
 */
export function buildHoneypotWarningContainer(
    actionCount: number,
    mode: HoneypotMode
): ContainerBuilder {
    const header = new TextDisplayBuilder().setContent('# 🍯 Honeypot - Do NOT Post Here');

    const actionLine =
        mode === 'softban'
            ? '## ⛔ Sending any message in this channel triggers an **immediate soft ban**.'
            : '## ⛔ Sending any message in this channel triggers an **immediate ban**.';

    const consequenceLine =
        mode === 'softban'
            ? '> You will be removed from the server and your recent messages purged.'
            : '> You will be permanently banned and your recent messages purged.';

    const warning = new TextDisplayBuilder().setContent(
        [
            actionLine,
            '',
            '> This channel is a trap for compromised and spam bots.',
            consequenceLine,
        ].join('\n')
    );

    const counterButton = new ButtonBuilder()
        .setCustomId('honeypot:counter')
        .setLabel(`🍯 Caught: ${actionCount.toLocaleString('en')}`)
        .setStyle(ButtonStyle.Secondary);

    return new ContainerBuilder()
        .setAccentColor(0xf1_c4_0f)
        .addTextDisplayComponents(header)
        .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Large))
        .addTextDisplayComponents(warning)
        .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
        .addActionRowComponents((row) => row.addComponents(counterButton));
}

/**
 * Edits an existing honeypot warning message so its copy and counter stay accurate.
 * Clears the stored WarningMessageId when the message no longer exists.
 */
export async function editHoneypotWarningMessage(
    guild: Guild,
    options: {
        actionCount: number;
        channelId: string;
        messageId: string;
        mode: HoneypotMode;
    }
): Promise<void> {
    try {
        const channel =
            guild.channels.cache.get(options.channelId) ??
            (await guild.channels.fetch(options.channelId));
        if (!channel || channel.type !== ChannelType.GuildText) {
            return;
        }

        const warningMessage = await channel.messages.fetch(options.messageId);
        await warningMessage.edit({
            components: [buildHoneypotWarningContainer(options.actionCount, options.mode)],
            flags: MessageFlags.IsComponentsV2,
        });
    } catch (error) {
        if ((error as { code?: number }).code === 10_008) {
            await Honeypot.findOneAndUpdate(
                { GuildId: guild.id },
                { $set: { WarningMessageId: null } },
                { returnDocument: 'after', upsert: true }
            ).catch(() => null);
        }
    }
}
