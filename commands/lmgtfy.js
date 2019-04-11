const encode = require("strict-uri-encode");

module.exports.run = async (client, message, args, color) => {
  message.delete(0);
  let question = encode(args.join(" "));
  let link = `https://www.lmgtfy.com/?q=${question}`;

  message.channel.send(`**<${link}>**`);
};

module.exports.help = {
  name: "lmgtfy"
};