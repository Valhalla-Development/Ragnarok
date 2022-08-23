import { EmbedBuilder, codeBlock, SlashCommandBuilder } from 'discord.js';
import Trakt from 'trakt.tv';
import decode from 'unescape';
import IMDb from 'imdb-light';
import fetch from 'node-fetch';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Display command list / command usage.')
  .addStringOption((option) => option.setName('content').setDescription('The content to lookup').setRequired(true))
  .addStringOption((option) => option.setName('type').setDescription('Optional type of content').setAutocomplete(true));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Fetches Trakt information for specified movie/show.',
      category: 'Fun',
      usage: '<show/movie> [show: show] [movie: movie]',
      options: data
    });
  }

  async autoComplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = ['movie', 'show'];
    const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
    await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
  }

  async run(interaction) {
    // Define some variables
    let reqImage;
    let reqTitle;
    let reqDesc;
    let reqLink;
    let reqSearch;
    let reqRating;
    let imdbRt;

    // Define keys
    const { traktKey } = this.client.config;
    const { traktSecret } = this.client.config;
    const { fanartKey } = this.client.config;

    // Define the Trakt client
    const trakt = new Trakt({
      client_id: traktKey,
      client_secret: traktSecret
    });

    // Define the getTrakt function
    const getTrakt = (query, type) =>
      trakt.search.text({
        query,
        type,
        extended: 'full'
      });

    // Define not found embed
    const notFound = (searchQuery) => {
      const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Trakt.tv**`,
        value: `**◎ Error:** I couldn't find the content you were looking for.\n[Try again or try on Trakt by clicking here.](https://trakt.tv/search?query=${searchQuery})`
      });
      interaction.reply({ ephemeral: true, embeds: [embed] });
    };

    // Fetch the supplied content from the interaction
    const args = interaction.options.getString('content');
    const argsChoice = interaction.options.getString('type');

    if (!argsChoice) {
      // Fetch the movie/show
      getTrakt(args, 'movie/show')
        .then(async (info) => {
          const argsType = info[0].type;

          // If the type of content is a movie
          if (argsType === 'movie') {
            // Fetch the artwork
            const artwork = await fetch(`http://webservice.fanart.tv/v3/movies/${info[0].movie.ids.tmdb}?api_key=${fanartKey}`);
            const fanartData = await artwork.json();

            // Set the fanartData
            if (!fanartData.movieposter) {
              if (!fanartData.hdmovielogo) {
                reqImage = '';
              } else {
                reqImage = fanartData.hdmovielogo[0].url;
              }
            } else {
              reqImage = fanartData.movieposter[0].url;
            }

            // Set all other variables
            reqTitle = info[0].movie.title;
            reqDesc = info[0].movie.overview;
            reqLink = `https://trakt.tv/movies/${info[0].movie.ids.slug}`;
            reqRating = Math.round(info[0].movie.rating * 10);

            // Fetch IMDB rating
            if (info[0].movie.ids.imdb) {
              await imdbFetch(info[0].movie.ids.imdb);
            }

            const getTraktEmbed = new EmbedBuilder()
              .setColor('#EA2027')
              .setAuthor({
                name: `${decode(reqTitle)} - Movie`,
                url: reqLink || 'https://trakt.tv/',
                iconURL: 'https://trakt.tv/assets/logos/header@2x-09f929ba67b0964596b359f497884cd9.png'
              })
              .setDescription(
                `${codeBlock('text', `${decode(reqDesc, 'all')}`)}\n**<:trakt:977201291115765820>${
                  imdbRt
                    ? ` [${reqRating}%](${reqLink})\u3000<:imdb:977228158615027803> [${imdbRt.slice(
                        0,
                        imdbRt.lastIndexOf('/')
                      )}](https://www.imdb.com/title/${info[0].movie.ids.imdb})`
                    : ` [${reqRating}%](${reqLink})%`
                }**`
              );
            if (reqImage) {
              getTraktEmbed.setImage(reqImage);
            }

            interaction.reply({ embeds: [getTraktEmbed] });
          }
          // If the type of content is a movie
          if (argsType === 'show') {
            // Fetch the artwork
            fetch(`http://webservice.fanart.tv/v3/tv/${info[0].show.ids.tvdb}?api_key=${fanartKey}`).then(async (res) => {
              const fanartData = await res.json();

              // Set the fanartData
              if (!fanartData.tvposter) {
                if (!fanartData.hdtvlogo) {
                  reqImage = '';
                } else {
                  reqImage = fanartData.hdtvlogo[0].url;
                }
              } else {
                reqImage = fanartData.tvposter[0].url;
              }

              // Set all other variables
              reqTitle = info[0].show.title;
              reqDesc = info[0].show.overview;
              reqLink = `https://trakt.tv/shows/${info[0].show.ids.slug}`;
              reqRating = Math.round(info[0].show.rating * 10);

              // Fetch IMDB rating
              if (info[0].show.ids.imdb) {
                await imdbFetch(info[0].show.ids.imdb);
              }

              const getTraktEmbed = new EmbedBuilder()
                .setColor('#EA2027')
                .setAuthor({
                  name: `${decode(reqTitle)} - Show`,
                  url: reqLink || 'https://trakt.tv/',
                  iconURL: 'https://trakt.tv/assets/logos/header@2x-09f929ba67b0964596b359f497884cd9.png'
                })
                .setDescription(
                  `${codeBlock('text', `${decode(reqDesc, 'all')}`)}\n**<:trakt:977201291115765820>${
                    imdbRt
                      ? ` [${reqRating}%](${reqLink})\u3000<:imdb:977228158615027803> [${imdbRt.slice(
                          0,
                          imdbRt.lastIndexOf('/')
                        )}](https://www.imdb.com/title/${info[0].show.ids.imdb})`
                      : ` [${reqRating}%](${reqLink})%`
                  }**`
                );
              if (reqImage) {
                getTraktEmbed.setImage(reqImage);
              }

              interaction.reply({ embeds: [getTraktEmbed] });
            });
          }
        })
        .catch(() => {
          reqSearch = args.split(' ').join('+');
          notFound(reqSearch);
        });
    } else if (argsChoice === 'movie') {
        // Fetch the movie
        getTrakt(args, 'movie')
          .then(async (info) => {
            const argsType = info[0].type;

            // If the type of content is a movie
            if (argsType === 'movie') {
              // Fetch the artwork
              const artwork = await fetch(`http://webservice.fanart.tv/v3/movies/${info[0].movie.ids.tmdb}?api_key=${fanartKey}`);
              const fanartData = await artwork.json();

              // Set the fanartData
              if (!fanartData.movieposter) {
                if (!fanartData.hdmovielogo) {
                  reqImage = '';
                } else {
                  reqImage = fanartData.hdmovielogo[0].url;
                }
              } else {
                reqImage = fanartData.movieposter[0].url;
              }

              // Set all other variables
              reqTitle = info[0].movie.title;
              reqDesc = info[0].movie.overview;
              reqLink = `https://trakt.tv/movies/${info[0].movie.ids.slug}`;
              reqRating = Math.round(info[0].movie.rating * 10);

              // Fetch IMDB rating
              if (info[0].movie.ids.imdb) {
                await imdbFetch(info[0].movie.ids.imdb);
              }

              const getTraktEmbed = new EmbedBuilder()
                .setColor('#EA2027')
                .setAuthor({
                  name: `${decode(reqTitle)} - Movie`,
                  url: reqLink || 'https://trakt.tv/',
                  iconURL: 'https://trakt.tv/assets/logos/header@2x-09f929ba67b0964596b359f497884cd9.png'
                })
                .setDescription(
                  `${codeBlock('text', `${decode(reqDesc, 'all')}`)}\n**<:trakt:977201291115765820>${
                    imdbRt
                      ? ` [${reqRating}%](${reqLink})\u3000<:imdb:977228158615027803> [${imdbRt.slice(
                          0,
                          imdbRt.lastIndexOf('/')
                        )}](https://www.imdb.com/title/${info[0].movie.ids.imdb})`
                      : ` [${reqRating}%](${reqLink})%`
                  }**`
                );
              if (reqImage) {
                getTraktEmbed.setImage(reqImage);
              }

              interaction.reply({ embeds: [getTraktEmbed] });
            }
          })
          .catch(() => {
            reqSearch = args.split(' ').join('+');
            notFound(reqSearch);
          });
      } else if (argsChoice === 'show')
        // Fetch the show
        getTrakt(args, 'show')
          .then(async (info) => {
            // Fetch the artwork
            fetch(`http://webservice.fanart.tv/v3/tv/${info[0].show.ids.tvdb}?api_key=${fanartKey}`).then(async (res) => {
              const fanartData = await res.json();

              // Set the fanartData
              if (!fanartData.tvposter) {
                if (!fanartData.hdtvlogo) {
                  reqImage = '';
                } else {
                  reqImage = fanartData.hdtvlogo[0].url;
                }
              } else {
                reqImage = fanartData.tvposter[0].url;
              }

              // Set all other variables
              reqTitle = info[0].show.title;
              reqDesc = info[0].show.overview;
              reqLink = `https://trakt.tv/shows/${info[0].show.ids.slug}`;
              reqRating = Math.round(info[0].show.rating * 10);

              // Fetch IMDB rating
              if (info[0].show.ids.imdb) {
                await imdbFetch(info[0].show.ids.imdb);
              }

              const getTraktEmbed = new EmbedBuilder()
                .setColor('#EA2027')
                .setAuthor({
                  name: `${decode(reqTitle)} - Show`,
                  url: reqLink || 'https://trakt.tv/',
                  iconURL: 'https://trakt.tv/assets/logos/header@2x-09f929ba67b0964596b359f497884cd9.png'
                })
                .setDescription(
                  `${codeBlock('text', `${decode(reqDesc, 'all')}`)}\n**<:trakt:977201291115765820>${
                    imdbRt
                      ? ` [${reqRating}%](${reqLink})\u3000<:imdb:977228158615027803> [${imdbRt.slice(
                          0,
                          imdbRt.lastIndexOf('/')
                        )}](https://www.imdb.com/title/${info[0].show.ids.imdb})`
                      : ` [${reqRating}%](${reqLink})%`
                  }**`
                );
              if (reqImage) {
                getTraktEmbed.setImage(reqImage);
              }

              interaction.reply({ embeds: [getTraktEmbed] });
            });
          })
          .catch(() => {
            reqSearch = args.split(' ').join('+');
            notFound(reqSearch);
          });

    // IMDB Function
    function fetchI(id) {
      return new Promise((resolve) => {
        IMDb.fetch(id, (details) => {
          resolve(details);
        });
      });
    }

    async function imdbFetch(id) {
      const quote = await fetchI(id);
      imdbRt = quote.Rating;
    }
  }
};

export default SlashCommandF;
