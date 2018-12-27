const Discord = require("discord.js");
const { get } = require("snekfetch");

const settings = {
    trakt: {
        apikey: "343592bf27fcc710800dace82ab7513d81a1061aae861c893bb7438a3f11c13a"
    },
    omdb: {
        apikey: "201474cd"
    }
}

function search(query) {
    return new Promise(resolve => {
        get(`http://www.omdbapi.com/?apikey=${settings.omdb.apikey}&t=${query}`).then(response1 => {
            if(response1.body.Reponse=="False") resolve({"title": "NopeDidntWork"});
            get(`https://api.trakt.tv/movies/${response1.body.imdbID}`, { headers: {"content-type": "application/json", "trakt-api-key": settings.trakt.apikey, "trakt-api-version": 2} }).then(response2 => {
                resolve({
                    title: response1.body.Title,
                    description: response1.body.Plot,
                    url: `https://trakt.tv/movies/${response2.body.ids.slug}`,
                    image: response1.body.Poster
                });
            }).catch((err) => {
                resolve({
                    title: response1.body.Title,
                    description: response1.body.Plot,
                    image: response1.body.Poster
                })
            })
        });
    });
}

module.exports.run = async(client, message, args, color) => {
    const query = args.join(" ");
    if(query.length<3) return message.channel.send("Enter a longer search.");
    message.channel.send({
        "embed": {
            "title": "Please wait...",
            "description": `Searching for: **${query}**`
        }
    }).then(async m => {
        let movie = await search(query);

        if(movie.title=="NopeDidntWork") {
            m.edit({
                "embed": {
                    "title": "Sorry!",
                    "description": "I couldn't find that movie!"
                }
            });
        } else if(!movie.url) {
            m.edit({
                "embed": {
                    "title": movie.title,
                    "description": `\`I could not find a trakt listing for that movie.\`\n\n` + movie.description,
                    "image": {
                        "url": movie.image || "https://www.freeiconspng.com/uploads/error-icon-4.png"
                    }
                }
            });
        } else {
            m.edit({
                "embed": {
                    "title": movie.title,
                    "description": `\`${movie.url}\`\n\n` + movie.description,
                    "image": {
                        "url": movie.image
                    }
                }
            });
        }
    });
}

module.exports.help = {
    name: "trakt"
  };