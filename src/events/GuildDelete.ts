import { ActivityType } from 'discord.js';
import { type ArgsOf, type Client, Discord, On } from 'discordx';
import AdsProtection from '../mongo/AdsProtection.js';
import AutoRole from '../mongo/AutoRole.js';
import BirthdayConfig from '../mongo/BirthdayConfig.js';
import Dad from '../mongo/Dad.js';
import Logging from '../mongo/Logging.js';
import RoleMenu from '../mongo/RoleMenu.js';
import StarBoard from '../mongo/StarBoard.js';
import TicketConfig from '../mongo/TicketConfig.js';
import Tickets from '../mongo/Tickets.js';
import Welcome from '../mongo/Welcome.js';

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
    @On({ event: 'guildDelete' })
    async onGuildDelete([guild]: ArgsOf<'guildDelete'>, client: Client) {
        // Set activity
        client.user?.setActivity({
            type: ActivityType.Watching,
            name: `${client.guilds.cache.size.toLocaleString('en')} Guilds
            ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')} Users`,
        });

        console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);

        await AdsProtection.deleteMany({ GuildId: guild.id });

        await AutoRole.deleteMany({ GuildId: guild.id });

        await BirthdayConfig.deleteMany({ GuildId: guild.id });

        await Dad.deleteMany({ GuildId: guild.id });

        await Logging.deleteMany({ GuildId: guild.id });

        await RoleMenu.deleteMany({ GuildId: guild.id });

        await Welcome.deleteMany({ GuildId: guild.id });

        await TicketConfig.deleteMany({ GuildId: guild.id });

        await Tickets.deleteMany({ GuildId: guild.id });

        await StarBoard.deleteMany({ GuildId: guild.id });
    }
}
