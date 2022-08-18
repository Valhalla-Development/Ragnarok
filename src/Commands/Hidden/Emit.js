import { EmbedBuilder } from 'discord.js';
import SQLite from 'better-sqlite3';
import Command from '../../Structures/Command.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      description: 'Emits a Discord.js event.',
      category: 'Hidden',
      usage: '<event>',
      ownerOnly: true
    });
  }

  async run(message, args) {
    const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);

    const { prefix } = prefixgrab;

    if (args[0] === undefined) {
      this.client.utils.messageDelete(message, 10000);

      const noArgs = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Emit**`,
        value: `**◎ Available Commands:**\n\`${prefix}emit guildMemberAdd\`\n\`${prefix}emit guildMemberRemove\``
      });
      message.channel.send({ embeds: [noArgs] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }
    if (args[0] === 'guildMemberAdd') {
      this.client.emit('guildMemberAdd', message.member);
      return;
    }
    if (args[0] === 'guildMemberRemove') {
      this.client.emit('guildMemberRemove', message.member);
      return;
    }
    if (args[0] === 'guildBanAdd') {
      this.client.emit('guildBanAdd', message.member);
      return;
    }
    if (args[0] === 'channelUpdate') {
      this.client.emit('channelUpdate', message.member);
      return;
    }
    if (args[0] === 'guildBanRemove') {
      this.client.emit('guildBanRemove', message.member);
    }
  }
};

export default CommandF;
