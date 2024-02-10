import type { Client } from 'discordx';
import { Discord, Slash } from 'discordx';
import {
    ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder,
} from 'discord.js';
import { Category } from '@discordx/utilities';
import { color } from '../../utils/Util.js';

@Discord()
@Category('Miscellaneous')
export class Invite {
    /**
     * Displays an invitation link for the bot.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'Displays an invitation link for the bot.' })
    async invite(interaction: CommandInteraction, client: Client): Promise<void> {
        if (!interaction.channel) return;

        const embed = new EmbedBuilder()
            .setColor(color(interaction.guild!.members.me!.displayHexColor))
            .addFields({ name: `**${client.user?.username} - Invite**`, value: `Want to invite ${client.user}?` });

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Invite')
                .setURL(`https://discordapp.com/oauth2/authorize?client_id=${client.user?.id}&scope=bot%20applications.commands&permissions=415306870006`),
        );

        await interaction.reply({ components: [row], embeds: [embed] });
    }
}
