const Discord = require("discord.js");
const SQLite = require('better-sqlite3')
const sql = new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {

    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
    client.getScore = sql.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
    client.setScore = sql.prepare("INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);");

    let score;
    if (message.guild) {
        score = client.getScore.get(message.author.id, message.guild.id);
    };


  let nxtLvlXp = score.level * 5000;
  let difference = nxtLvlXp - score.points;
  let embed = new Discord.RichEmbed()
  .setAuthor(`${message.author.username}'s Level`)
  .setColor(color)
  .setThumbnail(message.author.displayAvatarURL)
  .addField("XP", score.points, true)
  .addField("Level", score.level, true)
  .setFooter(`${difference} XP required to level up!`, message.author.displayAvatarURL);

  message.channel.send(embed);
}

module.exports.help = {
  name: "points"
}