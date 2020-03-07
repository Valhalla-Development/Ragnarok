/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');
const request = require('request');
const Trakt = require('trakt.tv');
const decode = require('unescape');
const {
  traktKey,
  traktSecret,
  fanartKey,
} = require('../../storage/config.json');

module.exports = {
  config: {
    name: 'trakt',
    usage: '${prefix}trakt <movie/show>',
    category: 'fun',
    description: 'Embeds the result of given search',
    accessableby: 'Everyone',
  },
  run: async (bot, message, args) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    const msg = await message.channel.send('Fetching data...');
    message.channel.startTyping();

    const trakt = new Trakt({
      client_id: traktKey,
      client_secret: traktSecret,
    });

    let reqTitle = '';
    let reqDesc = '';
    let reqImage = '';
    let reqLink = '';
    let reqSearch = '';
    let reqRating = '';
    let reqVotes = '';

    const toThousand = (num) => {
      num = parseInt(num);
      if (num >= 10000) {
        return `${(num / 1000).toFixed(1)}k`;
      }
      return num;
    };

    const getTrakt = (query, type) => trakt.search.text({
      query,
      type,
      extended: 'full',
    });

    const getTraktEmbed = (
      title,
      desc,
      image,
      link,
      searchQuery,
      rating,
      votes,
    ) => new MessageEmbed()
      .setColor('#EA2027')
      .setTitle(`${decode(title)} - Trakt`)
      .setDescription(
        `${decode(
          desc,
          'all',
        )}\n**Rating: ${rating}%** - ${votes} votes\n\n${link}\n\n**Not the content you were looking for?**\nTry: https://trakt.tv/search?query=${searchQuery}`,
      )
      .setImage(image)
      .setFooter(
        'Trakt.TV',
        'https://trakt.tv/assets/logos/header@2x-09f929ba67b0964596b359f497884cd9.png',
      )
      .setTimestamp();

    const notFound = (searchQuery) => {
      const embed = new MessageEmbed()
        .setColor('#d63031')
        .setDescription(
          `**Couldn't find the movie/show you were looking for.**\nTry again or try on Trakt.TV here: https://trakt.tv/search?query=${searchQuery}`,
        );

      message.channel.send(embed);
      msg.delete();
      message.channel.stopTyping();
    };

    if (args[0] === 'movie') {
      args = args.slice(1).join(' ');
      getTrakt(args, 'movie')
        .then((movieInfo) => {
          request(
            `http://webservice.fanart.tv/v3/movies/${
              movieInfo[0].movie.ids.tmdb
            }?api_key=${fanartKey}`,
            (err, resp, body) => {
              const fanartData = JSON.parse(body);
              if (!fanartData.movieposter) {
                if (!fanartData.hdmovielogo) {
                  reqImage = '';
                } else {
                  const randomIndex = Math.floor(
                    Math.random() * fanartData.hdmovielogo.length,
                  );
                  reqImage = fanartData.hdmovielogo[0].url;
                }
              } else {
                const randomIndex = Math.floor(
                  Math.random() * fanartData.movieposter.length,
                );
                reqImage = fanartData.movieposter[randomIndex].url;
              }
              reqTitle = movieInfo[0].movie.title;
              reqDesc = movieInfo[0].movie.overview;
              reqLink = `https://trakt.tv/movies/${
                movieInfo[0].movie.ids.slug
              }`;
              reqSearch = args.split(' ').join('+');
              reqRating = Math.round(movieInfo[0].movie.rating * 10);
              reqVotes = toThousand(movieInfo[0].movie.votes);

              message.channel.send(
                getTraktEmbed(
                  reqTitle,
                  reqDesc,
                  reqImage,
                  reqLink,
                  reqSearch,
                  reqRating,
                  reqVotes,
                ),
              );
              msg.delete();
              message.channel.stopTyping();
            },
          );
        })
        .catch(() => {
          reqSearch = args.split(' ').join('+');
          notFound(reqSearch);
        });
    } else if (args[0] === 'show') {
      args = args.slice(1).join(' ');
      getTrakt(args, 'show')
        .then((showInfo) => {
          request(
            `http://webservice.fanart.tv/v3/tv/${
              showInfo[0].show.ids.tvdb
            }?api_key=${fanartKey}`,
            (err, resp, body) => {
              const fanartData = JSON.parse(body);
              if (!fanartData.tvposter) {
                if (!fanartData.hdtvlogo) {
                  reqImage = '';
                } else {
                  const randomIndex = Math.floor(
                    Math.random() * fanartData.hdtvlogo.length,
                  );
                  reqImage = fanartData.hdtvlogo[0].url;
                }
              } else {
                const randomIndex = Math.floor(
                  Math.random() * fanartData.tvposter.length,
                );
                reqImage = fanartData.tvposter[randomIndex].url;
              }
              reqTitle = showInfo[0].show.title;
              reqDesc = showInfo[0].show.overview;
              reqLink = `https://trakt.tv/shows/${showInfo[0].show.ids.slug}`;
              reqSearch = args.split(' ').join('+');
              reqRating = Math.round(showInfo[0].show.rating * 10);
              reqVotes = toThousand(showInfo[0].show.votes);

              message.channel.send(
                getTraktEmbed(
                  reqTitle,
                  reqDesc,
                  reqImage,
                  reqLink,
                  reqSearch,
                  reqRating,
                  reqVotes,
                ),
              );
              msg.delete();
              message.channel.stopTyping();
            },
          );
        })
        .catch(() => {
          reqSearch = args.split(' ').join('+');
          notFound(reqSearch);
        });
    } else if (args.length === 0) {
      const errEmbed = new MessageEmbed()
        .setColor('#EA2027')
        .setDescription(
          'Please specify what movie/show you are trying to find.',
        );

      message.channel.send(errEmbed);
      msg.delete();
      message.channel.stopTyping();
    } else {
      args = args.join(' ');
      getTrakt(args, 'movie,show')
        .then((info) => {
          switch (info[0].type) {
            case 'movie':
              request(
                `http://webservice.fanart.tv/v3/movies/${
                  info[0].movie.ids.tmdb
                }?api_key=${fanartKey}`,
                (err, resp, body) => {
                  const fanartData = JSON.parse(body);
                  if (!fanartData.movieposter) {
                    if (!fanartData.hdmovielogo) {
                      reqImage = '';
                    } else {
                      const randomIndex = Math.floor(
                        Math.random() * fanartData.hdmovielogo.length,
                      );
                      reqImage = fanartData.hdmovielogo[0].url;
                    }
                  } else {
                    const randomIndex = Math.floor(
                      Math.random() * fanartData.movieposter.length,
                    );
                    reqImage = fanartData.movieposter[randomIndex].url;
                  }
                  reqTitle = info[0].movie.title;
                  reqDesc = info[0].movie.overview;
                  reqLink = `https://trakt.tv/movies/${info[0].movie.ids.slug}`;
                  reqSearch = args.split(' ').join('+');
                  reqRating = Math.round(info[0].movie.rating * 10);
                  reqVotes = toThousand(info[0].movie.votes);

                  message.channel.send(
                    getTraktEmbed(
                      reqTitle,
                      reqDesc,
                      reqImage,
                      reqLink,
                      reqSearch,
                      reqRating,
                      reqVotes,
                    ),
                  );
                  msg.delete();
                  message.channel.stopTyping();
                },
              );
              break;

            case 'show':
              request(
                `http://webservice.fanart.tv/v3/tv/${
                  info[0].show.ids.tvdb
                }?api_key=${fanartKey}`,
                (err, resp, body) => {
                  const fanartData = JSON.parse(body);
                  if (!fanartData.tvposter) {
                    if (!fanartData.hdtvlogo) {
                      reqImage = '';
                    } else {
                      const randomIndex = Math.floor(
                        Math.random() * fanartData.hdtvlogo.length,
                      );
                      reqImage = fanartData.hdtvlogo[0].url;
                    }
                  } else {
                    const randomIndex = Math.floor(
                      Math.random() * fanartData.tvposter.length,
                    );
                    reqImage = fanartData.tvposter[randomIndex].url;
                  }
                  reqTitle = info[0].show.title;
                  reqDesc = info[0].show.overview;
                  reqLink = `https://trakt.tv/shows/${info[0].show.ids.slug}`;
                  reqSearch = args.split(' ').join('+');
                  reqRating = Math.round(info[0].show.rating * 10);
                  reqVotes = toThousand(info[0].show.votes);

                  message.channel.send(
                    getTraktEmbed(
                      reqTitle,
                      reqDesc,
                      reqImage,
                      reqLink,
                      reqSearch,
                      reqRating,
                      reqVotes,
                    ),
                  );
                  msg.delete();
                  message.channel.stopTyping();
                },
              );
              break;
          }
        })
        .catch(() => {
          reqSearch = args.split(' ').join('+');
          notFound(reqSearch);
        });
    }
  },
};
