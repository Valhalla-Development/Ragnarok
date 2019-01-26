const { RichEmbed } = require('discord.js');
const request = require('request');
const Trakt = require('trakt.tv');
const { traktKey, traktSecret, omdbKey } = require('../Storage/config.json');

module.exports.run = (client, message, args) => {
    const trakt = new Trakt({
        client_id: traktKey,
        client_secret: traktSecret
    });

    let reqTitle = '';
    let reqDesc = '';
    let reqImage = '';
    let reqLink = '';
    let reqSearch = '';

    const getTrakt = (query, type) => {
        return trakt.search.text({
            query: query,
            type: type,
            extended: 'full'
        });
    }

    let getTraktEmbed = (title, desc, image, link, searchQuery) => {
        return new RichEmbed()
            .setColor('#EA2027')
            .setTitle(`${title} - Trakt`)
            .setDescription(`${desc}\n\n${link}\n\n**Not the content you were looking for?**\nTry: https://trakt.tv/search?query=${searchQuery}`)
            .setImage(image)
            .setFooter('Trakt.TV', 'https://trakt.tv/assets/logos/header@2x-09f929ba67b0964596b359f497884cd9.png')
            .setTimestamp();
    }

    if (args[0] == 'movie') {
        args = args.slice(1).join(' ');
        getTrakt(args, 'movie').then(movieInfo => {
            const imdbQuery = movieInfo[0].movie.ids.imdb;
            const titleQuery = movieInfo[0].movie.title.toLowerCase();
            request(`http://www.omdbapi.com/?apikey=${omdbKey}&i=${imdbQuery}&t=${titleQuery}`, (err, resp, body) => {
                let omdbData = JSON.parse(body);
                reqImage = omdbData.Poster;
                reqTitle = movieInfo[0].movie.title;
                reqDesc = movieInfo[0].movie.overview;
                reqLink = `https://trakt.tv/movies/${movieInfo[0].movie.ids.slug}`;
                reqSearch = args.split(' ').join('+');

                message.channel.send(getTraktEmbed(reqTitle, reqDesc, reqImage, reqLink, reqSearch));
            });
        });
    } else if (args[0] == 'show') {
        args = args.slice(1).join(' ');
        getTrakt(args, 'show').then(showInfo => {
            const imdbQuery = showInfo[0].show.ids.imdb;
            const titleQuery = showInfo[0].show.title.toLowerCase();
            request(`http://www.omdbapi.com/?apikey=${omdbKey}&i=${imdbQuery}&t=${titleQuery}`, (err, resp, body) => {
                let omdbData = JSON.parse(body);
                reqImage = omdbData.Poster;
                reqTitle = showInfo[0].show.title;
                reqDesc = showInfo[0].show.overview;
                reqLink = `https://trakt.tv/shows/${showInfo[0].show.ids.slug}`;
                reqSearch = args.split(' ').join('+');

                message.channel.send(getTraktEmbed(reqTitle, reqDesc, reqImage, reqLink, reqSearch));
            });
        });
    } else {
        if (args.length == 0) {
            let errEmbed = new RichEmbed()
                .setColor('#EA2027')
                .setDescription('Please specify what movie/show you are trying to find.');

            message.channel.send(errEmbed);
        } else {
            args = args.join(' ');
            getTrakt(args, 'movie,show').then(info => {
                if (info[0].type == 'movie') {
                    const imdbQuery = info[0].movie.ids.imdb;
                    const titleQuery = info[0].movie.title.toLowerCase();
                    request(`http://www.omdbapi.com/?apikey=${omdbKey}&i=${imdbQuery}&t=${titleQuery}`, (err, resp, body) => {
                        let omdbData = JSON.parse(body);
                        reqImage = omdbData.Poster;
                        reqTitle = info[0].movie.title;
                        reqDesc = info[0].movie.overview;
                        reqLink = `https://trakt.tv/movies/${info[0].movie.ids.slug}`;
                        reqSearch = args.split(' ').join('+');
        
                        message.channel.send(getTraktEmbed(reqTitle, reqDesc, reqImage, reqLink, reqSearch));
                    });
                    return;
                }

                if(info[0].type == 'show') {
                    const imdbQuery = info[0].show.ids.imdb;
                    const titleQuery = info[0].show.title.toLowerCase();
                    request(`http://www.omdbapi.com/?apikey=${omdbKey}&i=${imdbQuery}&t=${titleQuery}`, (err, resp, body) => {
                        let omdbData = JSON.parse(body);
                        reqImage = omdbData.Poster;
                        reqTitle = info[0].show.title;
                        reqDesc = info[0].show.overview;
                        reqLink = `https://trakt.tv/shows/${info[0].show.ids.slug}`;
                        reqSearch = args.split(' ').join('+');
        
                        message.channel.send(getTraktEmbed(reqTitle, reqDesc, reqImage, reqLink, reqSearch));
                    });
                    return;
                }
            });
        }
    }
}

module.exports.help = {
    name: 'trakt'
}

