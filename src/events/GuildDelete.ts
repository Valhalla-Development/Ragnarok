import { Events } from 'discord.js';
import { type ArgsOf, type Client, Discord, On } from 'discordx';
import AdsProtection from '../mongo/AdsProtection.js';
import AutoRole from '../mongo/AutoRole.js';
import BirthdayConfig from '../mongo/BirthdayConfig.js';
import Dad from '../mongo/Dad.js';
import Honeypot from '../mongo/Honeypot.js';
import Logging from '../mongo/Logging.js';
import Rock from '../mongo/Rock.js';
import RoleMenu from '../mongo/RoleMenu.js';
import StarBoard from '../mongo/StarBoard.js';
import Welcome from '../mongo/Welcome.js';
import { log } from '../utils/Console.js';
import { updateStatus } from '../utils/Util.js';

/**
 * Discord.js GuildDelete event handler.
 */
@Discord()
export class GuildDelete {
    /**
     * Executes when the GuildDelete event is emitted.
     * @param guild
     * @param client - The Discord client.
     * @returns void
     */
    @On({ event: Events.GuildDelete })
    async onGuildDelete([guild]: ArgsOf<'guildDelete'>, client: Client) {
        // Set activity
        updateStatus(client);

        log.warn(`[Guild] Removed from ${guild.name} (${guild.id})`);

        await AdsProtection.deleteMany({ GuildId: guild.id });

        await AutoRole.deleteMany({ GuildId: guild.id });

        await BirthdayConfig.deleteMany({ GuildId: guild.id });

        await Dad.deleteMany({ GuildId: guild.id });

        await Honeypot.deleteMany({ GuildId: guild.id });

        await Rock.deleteMany({ GuildId: guild.id });

        await Logging.deleteMany({ GuildId: guild.id });

        await RoleMenu.deleteMany({ GuildId: guild.id });

        await Welcome.deleteMany({ GuildId: guild.id });

        await StarBoard.deleteMany({ GuildId: guild.id });
    }
}
