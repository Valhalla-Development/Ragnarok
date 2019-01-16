const SQLite = require('better-sqlite3')
const db = new SQLite('./Storage/db/db.sqlite');
  
module.exports.run = async (client, message, args, color) => {

  const prefixeval = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);

  let prefixch = prefixeval.prefix;

  const evalargs = message.content.split(" ").slice(1);
  if (message.content.startsWith(prefixch + "eval")) {
    if (message.author.id !== config.ownerID) return;
    try {
      const code = evalargs.join(" ");
      let evaled = eval(code);

      if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);

      message.channel.send(clean(evaled), {
        code: "xl"
      });
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  };
};

  module.exports.help = {
    name: "eval"
  };