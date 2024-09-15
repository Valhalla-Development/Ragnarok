import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import { ChannelType, codeBlock, EmbedBuilder } from 'discord.js';
import moment from 'moment';
import { reversedRainbow, updateLevel } from '../utils/Util.js';

@Discord()
export class InteractionCreate {
    /**
     * Handler for interactionCreate event.
     * @param interaction - An array containing the interaction and client objects.
     * @param client - The Discord client.
     */
    @On({ event: 'interactionCreate' })
    async onInteraction([interaction]: ArgsOf<'interactionCreate'>, client: Client) {
        // Check if the interaction is in a guild and in a guild text channel, and is either a string select menu or a chat input command.
        if (!interaction || !interaction.guild || !interaction.channel || interaction.channel.type !== ChannelType.GuildText
            || (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isChatInputCommand()
                && !interaction.isContextMenuCommand() && !interaction.isContextMenuCommand() && !interaction.isModalSubmit())) return;

        /**
         * Update Level module
         */
        if (interaction.isCommand()) await updateLevel(interaction);

        try {
            await client.executeInteraction(interaction);
        } catch (err) {
            console.error('Interaction execution error:', err);
        }

        if (process.env.Logging && process.env.Logging.toLowerCase() === 'true') {
            if (interaction.isChatInputCommand()) {
                try {
                    const nowInMs = Date.now();
                    const nowInSecond = Math.round(nowInMs / 1000);

                    const logEmbed = new EmbedBuilder().setColor('#e91e63');
                    const executedCommand = interaction.toString().substring(0, 200);

                    logEmbed.addFields({
                        name: `Guild: ${interaction.guild.name} | Date: <t:${nowInSecond}>`,
                        value: codeBlock('kotlin', `${interaction.user.displayName} executed the '${executedCommand}' command`),
                    });

                    console.log(
                        `${'◆◆◆◆◆◆'.rainbow.bold} ${moment().format('MMM D, h:mm A')} ${reversedRainbow('◆◆◆◆◆◆')}\n`
                        + `${'🔧 Command:'.brightBlue.bold} ${executedCommand.brightYellow.bold}\n${
                            `${'🔍 Executor:'.brightBlue.bold} ${interaction.user.displayName.underline.brightMagenta.bold} ${'('.gray.bold}${'Guild: '.brightBlue.bold}${interaction.guild.name.underline.brightMagenta.bold}`.brightBlue.bold}${')'.gray.bold}\n`,
                    );

                    if (process.env.CommandLogging) {
                        const channel = client.channels.cache.get(process.env.CommandLogging);
                        if (channel && channel.type === ChannelType.GuildText) {
                            channel.send({ embeds: [logEmbed] });
                        }
                    }
                } catch (sendError) {
                    console.error('Failed to send the command logging embed:', sendError);
                }
            }
        }
    }
}
