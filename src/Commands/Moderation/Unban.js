import { EmbedBuilder } from 'discord.js';
import SQLite from 'better-sqlite3';
import Command from '../../Structures/Command.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      description: 'Un-bans specified user.',
      category: 'Moderation',
      usage: '<user-id>',
      userPerms: ['BanMembers'],
      botPerms: ['BanMembers', 'ViewAuditLog']
    });
  }

  async run(message, args) {
    const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
    const { prefix } = prefixgrab;

    // No user
    if (!args[0]) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Un-Ban**`, value: `**◎ Error:** Run \`${prefix}help unban\` If you are unsure.` });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    const embed = new EmbedBuilder()
      .setThumbnail(this.client.user.displayAvatarURL())
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
      .addFields({
        name: 'Action | Un-Ban',
        value: `**◎ User ID:** ${args[0]}
				**◎ Moderator:** ${message.author.tag}`
      })
      .setFooter({ text: 'User Un-Ban Logs' })
      .setTimestamp();

    message.guild.bans.fetch().then((bans) => {
      if (bans.size === 0) {
        this.client.utils.messageDelete(message, 10000);

        const embed1 = new EmbedBuilder()
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Un-Ban**`, value: '**◎ Error:** An error occured, is the user banned?' });
        message.channel.send({ embeds: [embed1] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }
      const bUser = bans.find((b) => b.user.id === args[0]);
      if (!bUser) {
        this.client.utils.messageDelete(message, 10000);

        const embed2 = new EmbedBuilder()
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Un-Ban**`, value: '**◎ Error:** The user specified is not banned!' });
        message.channel.send({ embeds: [embed2] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }
      message.guild.members.unban(bUser.user).then(() => message.channel.send({ embeds: [embed] }));

      db.prepare('DELETE FROM ban WHERE id = ?').run(`${message.guild.id}-${bUser.user.id}`);
    });

    const dbid = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
    if (!dbid) return;
    const dblogs = dbid.channel;
    const chnCheck = this.client.channels.cache.get(dblogs);
    if (!chnCheck) {
      db.prepare('DELETE FROM logging WHERE guildid = ?').run(message.guild.id);
    }

    if (dbid) {
      this.client.channels.cache.get(dblogs).send({ embeds: [embed] });
    }
  }
};

export default CommandF;
