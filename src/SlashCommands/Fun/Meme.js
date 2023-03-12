import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import RedditImageFetcher from 'reddit-image-fetcher';
import SlashCommand from '../../Structures/SlashCommand.js';

const subreddits = ['memes', 'bonehurtingjuice', 'surrealmemes', 'dankmemes', 'meirl', 'me_irl', 'funny'];

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Fetches a random Meme from several sub-reddits.',
      category: 'Fun'
    });
  }

  async run(interaction) {
    async function getMeme() {
      return RedditImageFetcher.fetch({
        type: 'custom',
        total: 1,
        subreddit: subreddits
      });
    }

    const meme = await getMeme();

    const embed = new EmbedBuilder()
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .setAuthor({
        name: `${meme[0].title.length >= 256 ? `${meme[0].title.substring(0, 253)}...` : meme[0].title}`,
        url: `${meme[0].postLink}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setImage(meme[0].image)
      .setFooter({ text: `👍 ${meme[0].upvotes}` });

    const buttonA = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Next Meme').setCustomId('nxtmeme');

    const row = new ActionRowBuilder().addComponents(buttonA);

    const m = await interaction.reply({ components: [row], embeds: [embed] });

    const filter = (but) => but.user.id !== this.client.user.id;

    const collector = m.createMessageComponentCollector({ filter, time: 15000 });

    const newMemes = await getNewMeme();

    collector.on('collect', async (b) => {
      if (b.user.id !== interaction.user.id) {
        const wrongUser = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Meme**`, value: '**◎ Error:** Only the command executor can select an option!' });
        await b.reply({ ephemeral: true, embeds: [wrongUser] });
        return;
      }

      collector.resetTimer();

      if (b.customId === 'nxtmeme') {
        // Pick a random meme
        const randomMeme = newMemes[Math.floor(Math.random() * newMemes.length)];

        // Remove the used meme from the list
        newMemes.splice(newMemes.indexOf(randomMeme), 1);

        // If there are no more memes, remove the button
        if (newMemes.length === 0) {
          const newMeme = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .setAuthor({
              name: `${randomMeme.title.length >= 256 ? `${randomMeme.title.substring(0, 253)}...` : randomMeme.title}`,
              url: `${randomMeme.postLink}`,
              iconURL: interaction.user.displayAvatarURL()
            })
            .setImage(randomMeme.image)
            .setFooter({ text: `👍 ${randomMeme.upvotes}` });
          await b.update({ embeds: [newMeme], components: [] });
          return;
        }

        const newMeme = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setAuthor({
            name: `${randomMeme.title.length >= 256 ? `${randomMeme.title.substring(0, 253)}...` : randomMeme.title}`,
            url: `${randomMeme.postLink}`,
            iconURL: interaction.user.displayAvatarURL()
          })
          .setImage(randomMeme.image)
          .setFooter({ text: `👍 ${randomMeme.upvotes}` });
        await b.update({ embeds: [newMeme], components: [row] });
      }
    });

    collector.on('end', () => {
      // Disable button and update interaction
      buttonA.setDisabled(true);
      interaction.editReply({ components: [row] });
    });

    async function getNewMeme() {
      return RedditImageFetcher.fetch({
        type: 'custom',
        total: 25,
        subreddit: subreddits
      });
    }
  }
};

export default SlashCommandF;
