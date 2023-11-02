import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';

@Discord()
export class MessageCreate {
    /**
     * Handler for messageCreate event.
     * @param args - An array containing the interaction and client objects.
     * @param client - The Discord client.
     */
    @On({ event: 'messageCreate' })
    async onMessage([message]: ArgsOf<'messageCreate'>, client: Client) {
    }
}
