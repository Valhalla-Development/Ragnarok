import os from 'node:os';
import { Category } from '@discordx/utilities';
import type { CommandInteraction } from 'discord.js';
import type { Client } from 'discordx';
import { Discord, Slash } from 'discordx';
import { RagnarokEmbed } from '../../utils/Util.js';

@Discord()
@Category('Miscellaneous')
export class Uptime {
    /**
     * Displays bot uptime.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'Displays bot uptime.' })
    async uptime(interaction: CommandInteraction, client: Client): Promise<void> {
        await RagnarokEmbed(
            client,
            interaction,
            'My last restart was approximately',
            `<t:${Math.round((Date.now() - os.uptime() * 1000) / 1000)}:R>`
        );
    }
}
