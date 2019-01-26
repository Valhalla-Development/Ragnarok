const {
    RichEmbed
} = require('discord.js');
const request = require('request');
const Trakt = require('trakt.tv');
const {
    traktKey,
    traktSecret,
    fanartKey
} = require('../Storage/config.json');

module.exports.run = async (client, msg, args) => {
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
            request(`http://webservice.fanart.tv/v3/movies/${movieInfo[0].movie.ids.tmdb}?api_key=${fanartKey}`, (err, resp, body) => {
                let fanartData = JSON.parse(body);
                if (!fanartData.movieposter) {
                    if (!fanartData.hdmovielogo) {
                        reqImage = '';
                    } else {
                        const randomIndex = Math.floor(Math.random() * fanartData.hdmovielogo.length);
                        reqImage = fanartData.hdmovielogo[0].url;
                    }
                } else {
                    const randomIndex = Math.floor(Math.random() * fanartData.movieposter.length);
                    reqImage = fanartData.movieposter[randomIndex].url;
                }
                reqTitle = movieInfo[0].movie.title;
                reqDesc = movieInfo[0].movie.overview;
                reqLink = `https://trakt.tv/movies/${movieInfo[0].movie.ids.slug}`;
                reqSearch = args.split(' ').join('+');

                msg.channel.send(getTraktEmbed(reqTitle, reqDesc, reqImage, reqLink, reqSearch));
            });
        });
    } else if (args[0] == 'show') {
        args = args.slice(1).join(' ');
        getTrakt(args, 'show').then(showInfo => {
            request(`http://webservice.fanart.tv/v3/tv/${showInfo[0].show.ids.tvdb}?api_key=${fanartKey}`, (err, resp, body) => {
                let fanartData = JSON.parse(body);
                console.log(fanartData)
                if (!fanartData.tvposter) {
                    if (!fanartData.hdtvlogo) {
                        reqImage = '';
                    } else {
                        const randomIndex = Math.floor(Math.random() * fanartData.hdtvlogo.length);
                        reqImage = fanartData.hdtvlogo[0].url;
                    }
                } else {
                    const randomIndex = Math.floor(Math.random() * fanartData.tvposter.length);
                    reqImage = fanartData.tvposter[randomIndex].url;
                }
                reqTitle = showInfo[0].show.title;
                reqDesc = showInfo[0].show.overview;
                reqLink = `https://trakt.tv/shows/${showInfo[0].show.ids.slug}`;
                reqSearch = args.split(' ').join('+');

                msg.channel.send(getTraktEmbed(reqTitle, reqDesc, reqImage, reqLink, reqSearch));
            });
        });
    } else {
        if (args.length == 0) {
            let errEmbed = new RichEmbed()
                .setColor('#EA2027')
                .setDescription('Please specify what movie/show you are trying to find.');

            msg.channel.send(errEmbed);
        } else {
            args = args.join(' ');
            getTrakt(args, 'movie,show').then(info => {
                switch (info[0].type) {
                    case 'movie':
                        request(`http://webservice.fanart.tv/v3/movies/${info[0].movie.ids.tmdb}?api_key=${fanartKey}`, (err, resp, body) => {
                            let fanartData = JSON.parse(body);
                            if (!fanartData.movieposter) {
                                if (!fanartData.hdmovielogo) {
                                    reqImage = '';
                                } else {
                                    const randomIndex = Math.floor(Math.random() * fanartData.hdmovielogo.length);
                                    reqImage = fanartData.hdmovielogo[0].url;
                                }
                            } else {
                                const randomIndex = Math.floor(Math.random() * fanartData.movieposter.length);
                                reqImage = fanartData.movieposter[randomIndex].url;
                            }
                            reqTitle = info[0].movie.title;
                            reqDesc = info[0].movie.overview;
                            reqLink = `https://trakt.tv/movies/${info[0].movie.ids.slug}`;
                            reqSearch = args.split(' ').join('+');

                            msg.channel.send(getTraktEmbed(reqTitle, reqDesc, reqImage, reqLink, reqSearch));
                        });
                        break;

                    case 'show':
                        request(`http://webservice.fanart.tv/v3/tv/${info[0].show.ids.tvdb}?api_key=${fanartKey}`, (err, resp, body) => {
                            let fanartData = JSON.parse(body);
                            if (!fanartData.tvposter) {
                                if (!fanartData.hdtvlogo) {
                                    reqImage = '';
                                } else {
                                    const randomIndex = Math.floor(Math.random() * fanartData.hdtvlogo.length);
                                    reqImage = fanartData.hdtvlogo[0].url;
                                }
                            } else {
                                const randomIndex = Math.floor(Math.random() * fanartData.tvposter.length);
                                reqImage = fanartData.tvposter[randomIndex].url;
                            }
                            reqTitle = info[0].show.title;
                            reqDesc = info[0].show.overview;
                            reqLink = `https://trakt.tv/shows/${info[0].show.ids.slug}`;
                            reqSearch = args.split(' ').join('+');

                            msg.channel.send(getTraktEmbed(reqTitle, reqDesc, reqImage, reqLink, reqSearch));
                        });
                        break;
                }
            });
        }
    }
}

module.exports.help = {
    name: 'trakt'
}