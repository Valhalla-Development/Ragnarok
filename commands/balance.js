const Discord = require("discord.js");
const SQLite = require('better-sqlite3')
const sql = new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
    let language = require(`../messages/messages_en-US.json`);

    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'balance';").get();
    client.getBalance = sql.prepare("SELECT * FROM balance WHERE user = ? AND guild = ?");
    client.setBalance = sql.prepare("INSERT OR REPLACE INTO balance (id, user, guild, balance) VALUES (@id, @user, @guild, @balance);");

    let balance;
    if (message.guild) {
        balance = client.getBalance.get(message.author.id, message.guild.id);
    };

    if(!args[0]) {
    let embed = new Discord.RichEmbed()
    .setAuthor(`${message.author.username}'s Balance`)
    .setColor(color)
    .setThumbnail(message.author.displayAvatarURL)
    .addField("Balance", balance.balance)
  
    message.channel.send(embed);
      } else {
        const user = message.mentions.users.first();
        if (!user) {
            let noUserEmbed = new Discord.RichEmbed()
            .setColor(`36393F`)
            .setDescription(`${language["balance"].noUser}`)
            message.channel.send(noUserEmbed)
            return;
        };
        let otherbalance;
        if (message.guild) {
            otherbalance = client.getBalance.get(user.id, message.guild.id)
        };
        let otherembed = new Discord.RichEmbed()
        .setAuthor(`${user.username}'s Balance`)
        .setColor(color)
        .setThumbnail(user.displayAvatarURL)
        .addField("Balance", otherbalance.balance)
      
        message.channel.send(otherembed);    
      }
    };

module.exports.help = {
    name: "balance",
}