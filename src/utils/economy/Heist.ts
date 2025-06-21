import {
    type ButtonBuilder,
    type ButtonInteraction,
    ContainerBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    UserSelectMenuBuilder,
} from 'discord.js';
import type { Client } from 'discordx';

/**
 * Asynchronously handles the heist button interaction.
 * @param interaction - The ButtonInteraction triggering the heist function.
 * @param client - The Discord client.
 * @param homeButton - The home button to display
 */
export async function handleHeist(
    interaction: ButtonInteraction,
    client: Client,
    homeButton: ButtonBuilder
) {
    // Defer the original reply to prevent timeout and delete the original reply
    await interaction.deferReply();
    await interaction.deleteReply();

    const heistContent = `> 🎭 **${interaction.user.displayName}** is planning a heist...`;

    // Create user select menu for choosing heist targets
    const userSelectMenu = new UserSelectMenuBuilder()
        .setCustomId('heist_target_select')
        .setPlaceholder('Select target...')
        .setMinValues(1)
        .setMaxValues(1);

    // Construct the container with heist information
    const embed = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('## 🏴‍☠️ **Heist Planning**'))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(heistContent.trim()))
        .addActionRowComponents((row) => row.addComponents(userSelectMenu))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addActionRowComponents((row) => row.addComponents(homeButton));

    // Update the original message with the updated embed and components
    await interaction.message.edit({
        embeds: [],
        files: [],
        components: [embed],
        flags: MessageFlags.IsComponentsV2,
    });
}
