import { Category } from '@discordx/utilities';
import { load } from 'cheerio';
import { ChannelType, type CommandInteraction, codeBlock, EmbedBuilder } from 'discord.js';
import { type Client, Discord, Slash } from 'discordx';
import { capitalise, color, RagnarokEmbed } from '../../utils/Util.js';

@Discord()
@Category('Fun')
export class WOTD {
    /**
     * Display the Word of the Day
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'Display the Word of the Day' })
    async wotd(interaction: CommandInteraction, client: Client): Promise<void> {
        if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
            return;
        }

        const replEm = (str: string) => {
            const boldStart = /<em>/g;
            const boldEnd = /<\/em>/g;
            const nonLinkBold = /em>/g;
            return str.replace(boldStart, '**').replace(boldEnd, '**').replace(nonLinkBold, '**');
        };

        try {
            const url = 'https://www.merriam-webster.com/word-of-the-day';
            const response = await fetch(url);

            if (!response.ok) {
                console.log('Failed to fetch word of the day:', response.statusText);
                return;
            }

            const body = await response.text();
            const $ = load(body);

            const wordClass = $('.word-and-pronunciation');
            const wordHeader = wordClass.find('.word-header-txt');
            const word = wordHeader.text();
            const typeFetch = $('.main-attr');
            const type = typeFetch.text();
            const syllablesFetch = $('.word-syllables');
            const syllables = syllablesFetch.text();

            const arr: { name: string; value: string }[] = [];

            const wordDef = $('.wod-definition-container');
            if (wordDef.length) {
                const def = wordDef.html();
                const wordDefSplit1 = def?.substring(def.indexOf('<p>') + 3);
                const wordDefSplit2 = wordDefSplit1?.split('</p>')[0];
                const repl = replEm(wordDefSplit2 || '');
                const output = repl.replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '[**$2**]($1)');
                arr.push({
                    name: '**Definition:**',
                    value: `>>> *${replEm(output)}*`,
                });
            }

            const wordEx = $('.wod-definition-container p:eq(1)');
            if (wordEx.length) {
                const def = wordEx.html();
                const output = def
                    ?.substring(3)
                    .replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '[**$2**]($1)');
                arr.push({
                    name: '**Example:**',
                    value: `>>> ${replEm(output || '')}`,
                });
            }
            // Embed
            const embed = new EmbedBuilder()
                .setColor(color(interaction.guild?.members.me?.displayHexColor ?? '#5865F2'))
                .setAuthor({
                    name: 'Word of the Day',
                    url: 'https://www.merriam-webster.com/word-of-the-day',
                    iconURL: `${interaction.guild!.iconURL({ extension: 'png' })}`,
                })
                .setDescription(`>>> **${capitalise(word)}**\n*[ ${syllables} ]*\n*${type}*`)
                .addFields(...arr);
            interaction.channel!.send({ embeds: [embed] });
        } catch (error) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                `An error occurred\n${codeBlock('text', `${error}`)}`,
                true
            );
        }
    }
}
