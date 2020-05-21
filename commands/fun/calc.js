const { MessageEmbed } = require('discord.js');
const math = require('mathjs');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'calc',
    usage: '${prefix}calc <args>',
    category: 'fun',
    description: 'Calculates a mathematical equation',
    accessableby: 'Everyone',
  },
  run: async (bot, message, args) => {
    if (!args[0]) return message.channel.send(`${language.calc.noInput}`);

    let resp;
    try {
      resp = math.eval(args.join(' '));
    } catch (e) {
      return message.channel.send(`${language.calc.invalidInput}`);
    }

    const embed = new MessageEmbed()
      .setColor('36393F')
      .setTitle('Math Calculation')
      .addFields({ name: 'Input', value: `\`\`\`js\n${args.join('')}\`\`\`` },
        { name: 'Output', value: `\`\`\`js\n${resp}\`\`\`` });

    message.channel.send(embed);
  },
};
