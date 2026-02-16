import { Category } from '@discordx/utilities';
import {
    type AnySelectMenuInteraction,
    type CommandInteraction,
    ContainerBuilder,
    MessageFlags,
    PermissionsBitField,
    SeparatorSpacingSize,
    StringSelectMenuBuilder,
    TextDisplayBuilder,
} from 'discord.js';
import { Discord, SelectMenuComponent, Slash } from 'discordx';
import { getAIGuildPersona, setAIGuildPersona } from '../../utils/ai/Index.js';
import { personas } from '../../utils/ai/personas/Index.js';

const AI_PERSONA_SELECT_ID = 'cfg:ai:persona';

function personaIdToLabel(id: string): string {
    return id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

@Discord()
@Category('Moderation')
export class AIPersona {
    @Slash({
        description: 'Set the AI persona for this server.',
        defaultMemberPermissions: [PermissionsBitField.Flags.ManageGuild],
    })
    async aipersona(interaction: CommandInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }

        const current = await getAIGuildPersona(interaction.guild.id);
        const payload = this.buildPayload(current);
        await interaction.reply({
            ...payload,
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
            allowedMentions: { parse: [] },
        });
    }

    @SelectMenuComponent({ id: AI_PERSONA_SELECT_ID })
    async onPersonaSelect(interaction: AnySelectMenuInteraction): Promise<void> {
        if (!(interaction.guild && interaction.isStringSelectMenu())) {
            return;
        }
        if (interaction.user.id !== interaction.message.interaction?.user.id) {
            await interaction.reply({
                content: 'Only the command executor can change the AI persona.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const [value] = interaction.values;
        const validPersona = value && personas[value];
        if (!validPersona) {
            await interaction.deferUpdate();
            return;
        }

        await setAIGuildPersona(interaction.guild.id, value);
        const payload = this.buildPayload(value);
        await interaction.update(payload);
    }

    private buildPayload(currentPersonaId: string): { components: [ContainerBuilder] } {
        const currentPersona = personas[currentPersonaId];
        const currentLabel = currentPersona
            ? personaIdToLabel(currentPersona.id)
            : personaIdToLabel(currentPersonaId);

        const statusText = [
            `> **Current persona:** ${currentLabel}`,
            '> Use the dropdown below to change how the AI behaves in this server.',
        ].join('\n');

        const options = Object.entries(personas).map(([value, persona]) => ({
            label: personaIdToLabel(persona.id),
            value,
            description: persona.description,
            default: value === currentPersonaId,
        }));

        const container = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('# AI Persona'))
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(statusText))
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents((row) =>
                row.addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(AI_PERSONA_SELECT_ID)
                        .setPlaceholder('Choose a persona…')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .addOptions(...options)
                )
            );

        return { components: [container] };
    }
}
