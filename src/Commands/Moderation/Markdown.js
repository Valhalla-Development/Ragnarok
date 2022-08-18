import { EmbedBuilder, codeBlock } from 'discord.js';
import SQLite from 'better-sqlite3';
import Command from '../../Structures/Command.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      description: 'Posts supplied text with markdown support.',
      category: 'Moderation',
      usage: '<language> <input>',
      userPerms: ['ManageMessages']
    });
  }

  async run(message, args) {
    this.client.utils.messageDelete(message, 0);

    const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
    const { prefix } = prefixgrab;

    const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
      name: `**${this.client.user.username} - Markdown**`,
      value: `**◎ Error:** Please input text, example: \`${prefix}markdown <language> <text> !\``
    });

    if (args[0] === undefined) {
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }
    if (args[1] === undefined) {
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    const extension = args[0].toLowerCase();
    const sayMessage = args.slice(1).join(' ');

    message.channel.send(codeBlock(extension, sayMessage));
  }
};

export default CommandF;
