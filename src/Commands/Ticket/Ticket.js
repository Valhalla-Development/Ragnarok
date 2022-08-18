import { EmbedBuilder } from 'discord.js';
import SQLite from 'better-sqlite3';
import Command from '../../Structures/Command.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      description: 'Displays available commands.',
      category: 'Ticket',
      userPerms: ['ManageGuild']
    });
  }

  async run(message) {
    const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
    const { prefix } = prefixgrab;

    const embed = new EmbedBuilder()
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
      .setThumbnail(this.client.user.displayAvatarURL({ extension: 'png' }))
      .setAuthor({ name: 'Tickets', iconURL: this.client.user.displayAvatarURL({ extension: 'png' }) })
      .addFields({
        name: 'Available Commands',
        value: `**◎ 📩 Open ticket:** \`${prefix}new\`
				**◎ 📩 Close Ticket (Admin):** \`${prefix}close\`
				**◎ 📩 Add User to Ticket (Admin):** \`${prefix}add\`
				**◎ 📩 Remove User from Ticket (Admin):** \`${prefix}remove\`
				**◎ 📩 Rename (Admin):** \`${prefix}rename\``
      });
    message.channel.send({ embeds: [embed] });
  }
};

export default CommandF;
