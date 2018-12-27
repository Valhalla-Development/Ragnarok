const encode = require("strict-uri-encode");

module.exports.run = async (client, message, args, color) => {
  let question = encode(args.join(" "));
  let link = `https://trakt.tv/search?query=${question}`;

  message.channel.send(`**<${link}>**`);
};

module.exports.help = {
  name: "trakts"
};