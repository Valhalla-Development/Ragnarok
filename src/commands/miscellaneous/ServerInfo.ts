import {
    Client, Discord, Slash, SlashChoice, SlashOption,
} from 'discordx';
import { Category } from '@discordx/utilities';
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from 'discord.js';
import { color } from '../../utils/Util.js';

@Discord()
@Category('Miscellaneous')
export class Ping {
    /**
     * Displays stats for the interaction guild.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param option - The option selected from the command
     */
    @Slash({ description: 'Displays stats for the guild.' })
    async serverinfo(
        @SlashChoice({ name: 'Server', value: 'server' })
        @SlashChoice({ name: 'Roles', value: 'roles' })
        @SlashChoice({ name: 'Emojis', value: 'emojis' })
        @SlashOption({
            description: 'Type of request',
            name: 'option',
            required: true,
            type: ApplicationCommandOptionType.String,
        })
            option: string,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        if (option === 'roles') {
            const roles = interaction.guild?.roles.cache
                .sort((a, b) => b.position - a.position)
                .map((role) => role.toString())
                .slice(0, -1);

            if (!roles) {
                await interaction.reply({ content: 'I was unable to locate any roles.' });
                return;
            }

            let roleList = roles.join(', ');

            if (roleList.length > 4000) {
                roleList = roleList.substring(0, 4000);
                roleList = roleList.substring(0, roleList.lastIndexOf('<'));
            }

            const embed = new EmbedBuilder()
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .setAuthor({ name: `Viewing information for ${interaction.guild?.name}`, iconURL: `${interaction.guild?.iconURL()}` })
                .setDescription(
                    `**Server Roles [${roles.length}]**\n${
                        roles.length <= 25 ? roleList : `${roleList}... and ${roles.length - 25} more`
                    }`,
                )
                .setFooter({ text: `${client.user?.username}`, iconURL: client.user?.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });
        }

        if (option === 'emojis') {
            const emojis = interaction.guild?.emojis.cache;

            const emojiMap = emojis?.map((emoji) => emoji.toString());

            if (!emojiMap) {
                await interaction.reply({ content: 'I was unable to locate any emojis.' });
                return;
            }

            emojiMap.sort((a, b) => a.localeCompare(b));

            let emojiList = emojiMap?.join(', ');

            if (emojiList && emojiList.length > 4000) {
                emojiList = emojiList.substring(0, 4000);
                emojiList = emojiList.substring(0, emojiList.lastIndexOf('<'));
            }

            const embed = new EmbedBuilder()
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .setAuthor({ name: `Viewing information for ${interaction.guild?.name}`, iconURL: `${interaction.guild?.iconURL()}` })
                .setDescription(
                    `**Server Emojis [${emojiMap?.length ?? 0}]**\n${
                        emojiMap && emojiMap.length <= 25 ? emojiList : `${emojiList}... and ${emojiMap.length - 25} more`
                    }`,
                )
                .setFooter({ text: `${client.user?.username}`, iconURL: client.user?.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });
        }
    }
}
