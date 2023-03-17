import { load } from 'cheerio';
import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { CronJob } from 'cron';
import SlashCommand from '../../Structures/SlashCommand.js';

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Word of the Day',
      category: 'Hidden',
      ownerOnly: true
    });
  }

  async run(interaction) {
    const replEm = (str) => {
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

      const arr = [];

      const wordDef = $('.wod-definition-container');
      if (wordDef.length) {
        const def = wordDef.html();
        const wordDefSplit1 = def.substring(def.indexOf('<p>') + 3);
        const wordDefSplit2 = wordDefSplit1.split('</p>')[0];
        const repl = replEm(wordDefSplit2);
        const output = repl.replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '[**$2**]($1)');
        arr.push({ name: '**Definition:**', value: `>>> *${replEm(output)}*` });
      }

      const wordEx = $('.wod-definition-container p:eq(1)');
      if (wordEx.length) {
        const def = wordEx.html();
        const output = def.substring(3).replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '[**$2**]($1)');
        arr.push({ name: '**Example:**', value: `>>> ${replEm(output)}` });
      }
      // Embed
      const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setAuthor({
            name: 'Word of the Day',
            url: 'https://www.merriam-webster.com/word-of-the-day',
            iconURL: interaction.guild.iconURL({ extension: 'png' })
          })
          .setDescription(`>>> **${this.client.utils.capitalise(word)}**\n*[ ${syllables} ]*\n*${type}*`)
          .addFields(...arr);
      interaction.channel.send({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  }
};
export default SlashCommandF;
