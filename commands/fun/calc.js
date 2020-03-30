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
  run: async (bot, message, args, color) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    if (!args[0]) return message.channel.send(`${language.calc.noInput}`);

    let resp;
    try {
      resp = math.eval(args.join(' '));
    } catch (e) {
      return message.channel.send(`${language.calc.invalidInput}`);
    }

    const embed = new MessageEmbed()
      .setColor(color)
      .setTitle('Math Calculation')
      .addFields({ name: 'Input', value: `\`\`\`js\n${args.join('')}\`\`\`` },
        { name: 'Output', value: `\`\`\`js\n${resp}\`\`\`` });

    message.channel.send(embed);
  },
};
