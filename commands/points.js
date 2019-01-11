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

    message.reply(`You currently have ${score.points} points and are level ${score.level}!`);

};
module.exports.help = {
    name: "points"
};