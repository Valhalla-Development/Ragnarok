/* eslint-disable no-unused-vars */
/* eslint-disable handle-callback-err */
/* eslint-disable camelcase */
const Command = require('../../Structures/Command');
const { MessageEmbed, Formatters } = require('discord.js');
const request = require('request');
const Trakt = require('trakt.tv');
const decode = require('unescape');
const {
	traktKey,
	traktSecret,
	fanartKey
} = require('../../../config.json');
const IMDb = require('imdb-light');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['movie', 'show'],
			description: 'Fetches Trakt information for specified movie/show.',
			category: 'Fun',
			usage: '<show/movie>'
		});
	}

	async run(message, args) {
		const msg = await message.channel.send({ content: 'Fetching data...' });
		message.channel.sendTyping();

		const trakt = new Trakt({
			client_id: traktKey,
			client_secret: traktSecret
		});

		let reqTitle = '';
		let reqDesc = '';
		let reqImage = '';
		let reqLink = '';
		let reqSearch = '';
		let reqRating = '';
		let reqVotes = '';
		let imdbRt;

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
			extended: 'full'
		});

		const getTraktEmbed = (
			title,
			desc,
			image,
			link,
			searchQuery,
			rating
		) => new MessageEmbed()
			.setColor('#EA2027')
			.setAuthor({ name: `${decode(title)}`, url: link, iconURL: 'https://trakt.tv/assets/logos/header@2x-09f929ba67b0964596b359f497884cd9.png' })
			.setDescription(`${Formatters.codeBlock('text', `${decode(desc, 'all')}`)}\n**<:trakt:977201291115765820> ${rating}**`)
			.setImage(image);

		const notFound = (searchQuery) => {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Trakt.tv**`,
					`**◎ Error:** **Couldn't find the movie/show you were looking for.**\nTry again or try on Trakt.TV here: https://trakt.tv/search?query=${searchQuery}`);
			message.channel.send({ embeds: [embed] });
			this.client.utils.deletableCheck(msg, 0);
		};

		if (args[0] === 'movie') {
			args = args.slice(1).join(' ');
			getTrakt(args, 'movie')
				.then((movieInfo) => {
					request(
						`http://webservice.fanart.tv/v3/movies/${
							movieInfo[0].movie.ids.tmdb
						}?api_key=${fanartKey}`,
						async (err, resp, body) => {
							const fanartData = JSON.parse(body);
							if (!fanartData.movieposter) {
								if (!fanartData.hdmovielogo) {
									reqImage = '';
								} else {
									reqImage = fanartData.hdmovielogo[0].url;
								}
							} else {
								reqImage = fanartData.movieposter[0].url;
							}
							reqTitle = movieInfo[0].movie.title;
							reqDesc = movieInfo[0].movie.overview;
							reqLink = `https://trakt.tv/movies/${
								movieInfo[0].movie.ids.slug
							}`;
							reqSearch = args.split(' ').join('+');
							reqRating = Math.round(movieInfo[0].movie.rating * 10);
							reqVotes = toThousand(movieInfo[0].movie.votes);

							if (movieInfo[0].movie.ids.imdb) {
								await imdbFetch(movieInfo[0].movie.ids.imdb);
							}

							message.channel.send({ embeds: [getTraktEmbed(
								`${reqTitle} - Movie`,
								reqDesc,
								reqImage,
								reqLink,
								reqSearch,
								imdbRt ? `[${reqRating}%](${reqLink})\u3000<:imdb:977228158615027803> [${imdbRt.slice(0, imdbRt.lastIndexOf('/'))}](https://www.imdb.com/title/${movieInfo[0].movie.ids.imdb})` : `${reqRating}%`,
								reqVotes
							)] });
							this.client.utils.deletableCheck(msg, 0);
						}
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
						async (err, resp, body) => {
							const fanartData = JSON.parse(body);

							if (!fanartData.tvposter) {
								if (!fanartData.hdtvlogo) {
									reqImage = '';
								} else {
									reqImage = fanartData.hdtvlogo[0].url;
								}
							} else {
								reqImage = fanartData.tvposter[0].url;
							}
							reqTitle = showInfo[0].show.title;
							reqDesc = showInfo[0].show.overview;
							reqLink = `https://trakt.tv/shows/${showInfo[0].show.ids.slug}`;
							reqSearch = args.split(' ').join('+');
							reqRating = Math.round(showInfo[0].show.rating * 10);
							reqVotes = toThousand(showInfo[0].show.votes);

							if (showInfo[0].show.ids.imdb) {
								await imdbFetch(showInfo[0].show.ids.imdb);
							}

							message.channel.send({ embeds: [getTraktEmbed(
								`${reqTitle} - TV Show`,
								reqDesc,
								reqImage,
								reqLink,
								reqSearch,
								imdbRt ? `[${reqRating}%](${reqLink})\u3000<:imdb:977228158615027803> [${imdbRt.slice(0, imdbRt.lastIndexOf('/'))}](https://www.imdb.com/title/${showInfo[0].show.ids.imdb})` : `${reqRating}%`,
								reqVotes
							)] });
							this.client.utils.deletableCheck(msg, 0);
						}
					);
				})
				.catch(() => {
					reqSearch = args.split(' ').join('+');
					notFound(reqSearch);
				});
		} else if (args.length === 0) {
			this.client.utils.messageDelete(message, 10000);

			const errEmbed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Trakt.tv**`,
					`**◎ Error:** Please specify what movie/show you are trying to find.`);
			message.channel.send({ embeds: [errEmbed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			this.client.utils.deletableCheck(msg, 0);
		} else {
			args = args.join(' ');
			getTrakt(args, 'movie,show')
				.then(async (info) => {
					switch (info[0].type) {
						case 'movie':
							request(
								`http://webservice.fanart.tv/v3/movies/${
									info[0].movie.ids.tmdb
								}?api_key=${fanartKey}`,
								async (err, resp, body) => {
									const fanartData = JSON.parse(body);
									if (!fanartData.movieposter) {
										if (!fanartData.hdmovielogo) {
											reqImage = '';
										} else {
											reqImage = fanartData.hdmovielogo[0].url;
										}
									} else {
										reqImage = fanartData.movieposter[0].url;
									}
									reqTitle = info[0].movie.title;
									reqDesc = info[0].movie.overview;
									reqLink = `https://trakt.tv/movies/${info[0].movie.ids.slug}`;
									reqSearch = args.split(' ').join('+');
									reqRating = Math.round(info[0].movie.rating * 10);
									reqVotes = toThousand(info[0].movie.votes);

									if (info[0].movie.ids.imdb) {
										await imdbFetch(info[0].movie.ids.imdb);
									}

									message.channel.send({ embeds: [getTraktEmbed(
										`${reqTitle} - Movie`,
										reqDesc,
										reqImage,
										reqLink,
										reqSearch,
										imdbRt ? `[${reqRating}%](${reqLink})\u3000<:imdb:977228158615027803> [${imdbRt.slice(0, imdbRt.lastIndexOf('/'))}](https://www.imdb.com/title/${info[0].movie.ids.imdb})` : `${reqRating}%`,
										reqVotes
									)] });
									this.client.utils.deletableCheck(msg, 0);
								}
							);
							break;

						case 'show':
							request(
								`http://webservice.fanart.tv/v3/tv/${
									info[0].show.ids.tvdb
								}?api_key=${fanartKey}`,
								async (err, resp, body) => {
									const fanartData = JSON.parse(body);
									if (!fanartData.tvposter) {
										if (!fanartData.hdtvlogo) {
											reqImage = '';
										} else {
											reqImage = fanartData.hdtvlogo[0].url;
										}
									} else {
										reqImage = fanartData.tvposter[0].url;
									}
									reqTitle = info[0].show.title;
									reqDesc = info[0].show.overview;
									reqLink = `https://trakt.tv/shows/${info[0].show.ids.slug}`;
									reqSearch = args.split(' ').join('+');
									reqRating = Math.round(info[0].show.rating * 10);
									reqVotes = toThousand(info[0].show.votes);

									if (info[0].show.ids.imdb) {
										await imdbFetch(info[0].show.ids.imdb);
									}

									message.channel.send({ embeds: [getTraktEmbed(
										`${reqTitle} - TV Show`,
										reqDesc,
										reqImage,
										reqLink,
										reqSearch,
										imdbRt ? `[${reqRating}%](${reqLink})\u3000<:imdb:977228158615027803> [${imdbRt.slice(0, imdbRt.lastIndexOf('/'))}](https://www.imdb.com/title/${info[0].show.ids.imdb})` : `${reqRating}%`,
										reqVotes
									)] });

									this.client.utils.deletableCheck(msg, 0);
								}
							);
							break;
					}
				})
				.catch(() => {
					reqSearch = args.split(' ').join('+');
					notFound(reqSearch);
				});
		}

		// IMDB Function
		function fetch(id) {
			return new Promise((resolve, reject) => {
				IMDb.fetch(id, (details) => {
					resolve(details);
				});
			});
		}

		async function imdbFetch(id) {
			var quote = await fetch(id);
			imdbRt = quote.Rating;
		}
	}

};
