import {
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    ContainerBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    UserSelectMenuBuilder,
} from 'discord.js';

/**
 * Asynchronously handles the heist button interaction.
 * @param interaction - The ButtonInteraction triggering the heist function.
 * @param client - The Discord client.
 * @param homeButton - The home button to display
 */
export async function handleHeist(interaction: ButtonInteraction, homeButton: ButtonBuilder) {
    // Defer the original reply to prevent timeout and delete the original reply
    await interaction.deferReply();
    await interaction.deleteReply();

    const heistContent = `> 🎭 **${interaction.user.displayName}** is planning a heist...`;

    // Create user select menu for choosing heist targets
    const userSelectMenu = new UserSelectMenuBuilder()
        .setCustomId(`heist_target_select_${interaction.user.id}`)
        .setPlaceholder('Select target...')
        .setMinValues(1)
        .setMaxValues(1);

    // Construct the container with heist information
    const backButton = ButtonBuilder.from(homeButton.toJSON())
        .setDisabled(false)
        .setStyle(ButtonStyle.Primary);

    const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('## 🏴‍☠️ **Heist Planning**'))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(heistContent.trim()))
        .addActionRowComponents((row) => row.addComponents(userSelectMenu))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addActionRowComponents((row) => row.addComponents(backButton));

    // Update the original message with the updated embed and components
    await interaction.message.edit({
        files: [],
        components: [container],
        flags: MessageFlags.IsComponentsV2,
    });
}
