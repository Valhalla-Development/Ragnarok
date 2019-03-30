module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  let pingMessage = language.ping.ping;
  const ping = pingMessage.replace("${ping}", Math.round(client.ping));

  message.channel.send(`${ping}`);
};

module.exports.help = {
  name: "ping"
};