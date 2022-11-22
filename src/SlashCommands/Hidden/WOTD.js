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
    try {
      const url = 'https://www.merriam-webster.com/word-of-the-day';
      const response = await fetch(url);

      if (response.ok) {
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
          try {
            const wordDefSplit1 = def.substring(def.indexOf('<p>') + 3);
            const wordDefSplit2 = wordDefSplit1.split('</p>')[0];
            arr.push({ name: '**Definition:**', value: `>>> *${replEm(wordDefSplit2)}*` });
          } catch {
            // Do nothing (:
          }
        }

        // Example
        const wordEx = $('.wod-definition-container p:eq(1)');
        if (wordEx) {
          const def = wordEx.html();
          try {
            arr.push({ name: '**Example:**', value: `>>> ${replEm(def).substring(3)}` });
          } catch {
            // Do nothing lmao because why the fuck not (:
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
        interaction.channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.log(error);
    }

    function replEm(str) {
      const re1 = /<a href=".*?</g;
      const re2 = /<em>/g;
      const re3 = /<\/em>/g;
      const re4 = /<\/a>/g;
      const re5 = /em>/g;
      return str.replaceAll(re1, '').replace(re2, '**').replace(re3, '**').replace(re4, '').replace(re5, '**');
    }
  }
};
export default SlashCommandF;
