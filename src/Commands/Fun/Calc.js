import { EmbedBuilder } from 'discord.js';
import { evaluate } from 'mathjs';
import sudo from 'sudo-minigames';
import SQLite from 'better-sqlite3';
import Command from '../../Structures/Command.js';

const { Calculator } = sudo;
const db = new SQLite('./Storage/DB/db.sqlite');

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ['math'],
      description: 'Calculates given input.',
      category: 'Fun',
      usage: '<input> || <easy>'
    });
  }

  async run(message, args) {
    const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
    const { prefix } = prefixgrab;

    if (args[0] === 'easy') {
      await Calculator({
        message,
        embed: {
          title: 'Calculator | Ragnarok',
          color: this.client.utils.color(message.guild.members.me.displayHexColor),
          footer: ' ',
          timestamp: false
        },
        disabledQuery: 'Calculator is disabled!',
        invalidQuery: 'The provided equation is invalid!',
        othersMessage: 'Only <@{{author}}> can use the buttons!'
      });
      return;
    }

    if (!args[0]) {
      this.client.utils.messageDelete(message, 10000);

      const incorrectFormat = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Calculation**`,
        value: `**◎ Error:** Please input a calculation! Example: \`${prefix}calc 1+1\`\n\nAlternatively, you can run \`${prefix}calc easy\``
      });
      message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    let resp;
    try {
      resp = evaluate(args.join(' '));
    } catch (err) {
      this.client.utils.messageDelete(message, 10000);

      const invalidInput = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Calculation**`, value: '**◎ Error:** Please input a valid calculation!' });
      message.channel.send({ embeds: [invalidInput] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Calculation**`,
        value: `**◎ Input:** \`\`\`js\n${args.join('')}\`\`\`
				**◎ Output:** \`\`\`js\n${resp}\`\`\``
      })
      .setTimestamp();
    message.channel.send({ embeds: [embed] });
  }
};

export default CommandF;
