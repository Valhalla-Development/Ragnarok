import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import fetch from 'node-fetch';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('airreps')
  .setDescription('Fetches search results from r/AirReps')
  .addStringOption((option) => option.setName('query').setDescription('What would you like to search?').setRequired(true));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Fetches search results from r/AirReps',
      category: 'Fun',
      options: data,
      usage: '<query>'
    });
  }

  async run(interaction) {
    await interaction.deferReply();

    const searchTerm = interaction.options.getString('query').split(' ').join('%20');

    fetch(`https://www.reddit.com/r/AirReps/search.json?q=${searchTerm}&restrict_sr=1&limit=3`)
      .then((res) => res.json())
      .then((res) => res.data.children)
      .then((res) => {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${res[0].data.subreddit} - Top 3 results for: ${interaction.options.getString('query')}`,
            url: `https://www.reddit.com/r/AirReps/search/?q=${searchTerm}&restrict_sr=1`,
            iconURL: 'https://logodownload.org/wp-content/uploads/2018/02/reddit-logo-16.png'
          })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).setDescription(`[**◎ ${res[0].data.title}**](${
          res[0].data.url
        })\n \`\`\`${res[0].data.selftext.substring(0, 150)}...\`\`\`\n
					[**◎ ${res[1].data.title}**](${res[1].data.url})\n  \`\`\`${res[1].data.selftext.substring(0, 150)}...\`\`\`\n
					[**◎ ${res[2].data.title}**](${res[2].data.url})\n  \`\`\`${res[2].data.selftext.substring(0, 150)}...\`\`\`\n
					[**__Search Results...__**](https://www.reddit.com/r/AirReps/search/?q=${searchTerm}&restrict_sr=1)`);
        interaction.editReply({ embeds: [embed] });
      })
      .catch(() => {
        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - AirReps**`, value: '**◎ Error:** No results found!' });
        interaction.editReply({ ephemeral: true, embeds: [embed] });
      });
  }
};

export default SlashCommandF;
