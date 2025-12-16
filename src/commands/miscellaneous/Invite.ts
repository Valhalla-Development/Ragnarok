import { Category } from '@discordx/utilities';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type CommandInteraction,
    EmbedBuilder,
} from 'discord.js';
import type { Client } from 'discordx';
import { Discord, Slash } from 'discordx';
import { color } from '../../utils/Util.js';

@Discord()
@Category('Miscellaneous')
export class Invite {
    /**
     * Displays an invitation link for adding the bot.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'Displays an invitation link for adding the bot.' })
    async invite(interaction: CommandInteraction, client: Client): Promise<void> {
        const embed = new EmbedBuilder()
            .setColor(color(interaction.guild?.members.me?.displayHexColor ?? '#5865F2'))
            .addFields({
                name: `**${client.user?.username} - Invite**`,
                value: `Would you like to invite ${client.user}?`,
            });

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Invite')
                .setURL(
                    `https://discordapp.com/oauth2/authorize?client_id=${client.user?.id}&scope=bot%20applications.commands&permissions=415306870006`
                )
        );

        await interaction.reply({ components: [row], embeds: [embed] });
    }
}
