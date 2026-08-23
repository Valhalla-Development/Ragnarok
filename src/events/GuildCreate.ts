import { Events } from 'discord.js';
import { type ArgsOf, type Client, Discord, On } from 'discordx';
import { log } from '../utils/Console.js';
import { updateStatus } from '../utils/Util.js';

/**
 * Discord.js GuildCreate event handler.
 */
@Discord()
export class GuildCreate {
    /**
     * Executes when the GuildCreate event is emitted.
     * @param guild
     * @param client - The Discord client.
     * @returns void
     */
    @On({ event: Events.GuildCreate })
    onGuildCreate([guild]: ArgsOf<'guildCreate'>, client: Client) {
        // Set activity
        updateStatus(client);

        log.ok(`[Guild] Joined ${guild.name} (${guild.id}) — ${guild.memberCount} members`);
    }
}
