import { ActivityType, Events } from 'discord.js';
import { type ArgsOf, type Client, Discord, On } from 'discordx';

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
        client.user?.setActivity({
            type: ActivityType.Watching,
            name: `${client.guilds.cache.size.toLocaleString('en')} Guilds
            ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')} Users`,
        });

        console.log(
            `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`
        );
    }
}
