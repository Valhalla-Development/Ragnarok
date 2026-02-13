import { Category } from '@discordx/utilities';
import {
    ActionRowBuilder,
    type CommandInteraction,
    MessageFlags,
    ModalBuilder,
    type ModalSubmitInteraction,
    PermissionsBitField,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import { Discord, ModalComponent, Slash } from 'discordx';
import { config } from '../../config/Config.js';
import Announcement from '../../mongo/Announcement.js';
import { RagnarokComponent } from '../../utils/Util.js';

@Discord()
@Category('Hidden')
export class SetAnnouncement {
    /**
     * Developer command to set announcement message.
     * @param interaction - The command interaction.
     */
    @Slash({
        description: 'Sets the bot announcement displayed in /stats.',
        defaultMemberPermissions: [PermissionsBitField.Flags.Administrator],
    })
    async setannouncement(interaction: CommandInteraction): Promise<void> {
        if (!config.OWNER_IDS.includes(interaction.user.id)) {
            await RagnarokComponent(
                interaction,
                'Error',
                'This command is restricted to the bot owner.',
                true
            );
            return;
        }

        // Create the modal
        const modal = new ModalBuilder()
            .setTitle('Set Announcement')
            .setCustomId('set_announcement_modal');

        // Create the text input component
        const announcementInput = new TextInputBuilder()
            .setCustomId('announcement_text')
            .setLabel('Announcement Message')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Enter the new announcement here...')
            .setRequired(true)
            .setMaxLength(1000);

        const row = new ActionRowBuilder<TextInputBuilder>().addComponents(announcementInput);

        modal.addComponents(row);

        // Show the modal to the user
        await interaction.showModal(modal);
    }

    @ModalComponent({ id: 'set_announcement_modal' })
    async handleModal(interaction: ModalSubmitInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const message = interaction.fields.getTextInputValue('announcement_text');

        try {
            // Clear existing announcements to ensure only one active message
            await Announcement.deleteMany({});

            // Create the new announcement
            await Announcement.create({ Message: message });

            await RagnarokComponent(
                interaction,
                'Success',
                'Announcement has been updated successfully!',
                true
            );
        } catch (error) {
            console.error('Error setting announcement:', error);
            await RagnarokComponent(
                interaction,
                'Error',
                'Failed to update the announcement. Please try again.',
                true
            );
        }
    }
}
