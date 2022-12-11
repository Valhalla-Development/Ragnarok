import { load } from 'cheerio';
import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
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
    function replEm(str) {
      const boldStart = /<em>/g;
      const boldEnd = /<\/em>/g;
      const nonLinkBold = /em>/g;
      return str.replace(boldStart, '**').replace(boldEnd, '**').replace(nonLinkBold, '**');
    }

    try {
      const url = 'https://www.merriam-webster.com/word-of-the-day';
      const response = await fetch(url);

      // Use if statements to check for specific error conditions.
      if (!response.ok) {
        // Handle the error...
      }

      const arr = [];

      const body = await response.text();
      const $ = load(body);

      // Word
      const wordClass = $('.word-and-pronunciation');
      const word = wordClass.find('h1').text();

      // Word Attributes
      const typeFetch = $('.main-attr');
      const type = typeFetch.text();
      const syllablesFetch = $('.word-syllables');
      const syllables = syllablesFetch.text();

      // Definiton
      const wordDef = $('.wod-definition-container');
      if (wordDef) {
        const def = wordDef.html();

        // Use if statements to check for specific error conditions.
        if (def) {
          const wordDefSplit1 = def.substring(def.indexOf('<p>') + 3);
          const wordDefSplit2 = wordDefSplit1.split('</p>')[0];
          const repl = replEm(wordDefSplit2);
          const output = repl.replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '[**$2**]($1)');
          arr.push({ name: '**Definition:**', value: `>>> *${replEm(output)}*` });
        } else {
          // Handle the error...
        }
      }

      // Example
      const wordEx = $('.wod-definition-container p:eq(1)');
      if (wordEx) {
        const def = wordEx.html();
        const output = def.substring(3).replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '[**$2**]($1)');

        // Use if statements to check for specific error conditions.
        if (def) {
          arr.push({ name: '**Example:**', value: `>>> ${replEm(output)}` });
        } else {
          // Handle the error...
        }
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
      /* const guild = this.client.guilds.cache.get('657235952116170794');
      if (!guild) return;
      const chn = guild.channels.cache.get('663193215943311373');
      if (!chn) return;

      chn.send({ embeds: [embed] }); */
      interaction.channel.send({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  }
};
export default SlashCommandF;
