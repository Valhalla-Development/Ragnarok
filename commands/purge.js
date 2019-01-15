const fs = require("fs");
const config = JSON.parse(
  fs.readFileSync("./Storage/config.json", "utf8")
);

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  if((!message.member.hasPermission("MANAGE_MESSAGES") && (message.author.id !== config.ownerID))) {
    message.channel.send(`${language["purge"].noPermission}`).then(message => message.delete(5000));;
    return;
  }

  let cnt = message.content
  if (cnt !== " ") {
      message.delete(10) // ?
  };

  const argresult = args.join(" ");
  if (!argresult) {
    message.channel.send(`${language["purge"].notSpecified}`).then(message => message.delete(5000));;
    return;
  }
  if (isNaN(argresult)) {
    message.channel.send(`${language["purge"].invalidNumber}`).then(message => message.delete(5000));;
    return;
  }
  if (args[0] > 100) {
    message.channel.send(`${language["purge"].limitNumber}`).then(message => message.delete(5000));;
    return;
  }

  let messagecount = parseInt(args.join(" "));
  message.channel.bulkDelete(messagecount).then(() => {
    setTimeout(() => {
      let purgedMessage = language["purge"].purged;
      const purged = purgedMessage.replace("${messages}", messagecount);

      message.channel.send(`${purged}`).then(m => {
        setTimeout(() => {
          m.delete();
        }, 5000);
      });
    }, 2000);
  });
};

module.exports.help = {
  name: "purge"
};