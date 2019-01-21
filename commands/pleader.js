const SQLite = require('better-sqlite3')
const sql = new SQLite('./Storage/db/db.sqlite');
const Discord = require("discord.js");

module.exports.run = async (client, message, args, color) => {


  const top10 = sql.prepare("SELECT * FROM scores WHERE guild = ? ORDER BY points DESC LIMIT 10;").all(message.guild.id);
  client.getScore = sql.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
  client.setScore = sql.prepare("INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);");

  const embed = new Discord.RichEmbed()
    .setTitle("Leaderboard")
    .setAuthor(client.user.username, client.user.avatarURL)
    .setDescription("Top 10 Points!")
    .setColor(0x00AE86);

  for (const data of top10) {
    embed.addField(client.users.get(data.user).tag, `${data.points} points (level ${data.level})`);
  }
  return message.channel.send({
    embed
  });
}
module.exports.help = {
  name: "pleader"
};