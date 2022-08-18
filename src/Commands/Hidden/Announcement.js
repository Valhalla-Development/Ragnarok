import { EmbedBuilder } from 'discord.js';
import SQLite from 'better-sqlite3';
import Command from '../../Structures/Command.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      description: 'Owner command to edit the announcement message.',
      category: 'Hidden',
      usage: '<message>',
      ownerOnly: true
    });
  }

  async run(message, args) {
    this.client.utils.messageDelete(message, 0);

    const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
    const { prefix } = prefixgrab;

    if (args[0] === undefined) {
      const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Announcement**`,
        value: `**◎ Error:** Please use:**\n\n${prefix}announcement <message>`
      });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    db.prepare('UPDATE announcement SET msg = ?').run(args.join(' '));
    const complete = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
      name: `**${this.client.user.username} - Announcement**`,
      value: `**◎ Success:** Announcement message has been set to:\n\`\`\`${args.join(' ')}\`\`\``
    });
    message.channel.send({ embeds: [complete] });
  }
};

export default CommandF;
