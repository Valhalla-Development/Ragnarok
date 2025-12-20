import {
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    ContainerBuilder,
    MessageFlags,
    SectionBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';

export async function showGambleMenu(
    interaction: ButtonInteraction,
    buttons: { homeButton: ButtonBuilder; coinflipButton: ButtonBuilder }
): Promise<void> {
    const container = buildGambleMenuContainer(buttons);

    await interaction.deferReply();
    await interaction.deleteReply();

    await interaction.message.edit({
        components: [container],
        files: [],
        flags: MessageFlags.IsComponentsV2,
    });
}

export function buildGambleMenuContainer(buttons: {
    homeButton: ButtonBuilder;
    coinflipButton: ButtonBuilder;
}): ContainerBuilder {
    const header = new TextDisplayBuilder().setContent('# 🎲 Gamble');

    const coinflipText = new TextDisplayBuilder().setContent('> 🪙 **Coin Flip**');
    // Clone + force-enable so prior flows that temporarily disabled the shared button
    // don't cause the menu buttons to render greyed out.
    const coinflipButton = ButtonBuilder.from(buttons.coinflipButton.toJSON())
        .setDisabled(false)
        .setStyle(ButtonStyle.Primary);

    const coinflipSection = new SectionBuilder()
        .addTextDisplayComponents(coinflipText)
        .setButtonAccessory(coinflipButton);

    return new ContainerBuilder()
        .addTextDisplayComponents(header)
        .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
        .addSectionComponents(coinflipSection)
        .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
        .addActionRowComponents((row) =>
            row.addComponents(
                ButtonBuilder.from(buttons.homeButton.toJSON())
                    .setDisabled(false)
                    .setStyle(ButtonStyle.Primary)
            )
        );
}
