import { EmbedBuilder, PermissionsBitField } from 'discord.js';
import SQLite from 'better-sqlite3';
import urlRegexSafe from 'url-regex-safe';
import RagnarokEmbedF from '../../Structures/RagnarokEmbed.js';
import Event from '../../Structures/Event.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const EventF = class extends Event {
  async run(oldMessage, newMessage) {
    if (!newMessage.guild || oldMessage.content === newMessage.content || newMessage.author.bot) return;
    const adsprot = db.prepare('SELECT count(*) FROM adsprot WHERE guildid = ?').get(newMessage.guild.id);
    if (adsprot['count(*)']) {
      if (!newMessage.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        const npPerms = new EmbedBuilder().setColor(this.client.utils.color(newMessage.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Ads Protection**`,
          value: '**◎ Error:** I do not have the `Manage Messages` permissions. Disabling Ads Protection.'
        });
        newMessage.channel.send({ embeds: [npPerms] }).then((m) => newMessage.utils.deletableCheck(m, 0));
        db.prepare('DELETE FROM adsprot WHERE guildid = ?').run(newMessage.guild.id);
        return;
      }
      if (!newMessage.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        const matches = urlRegexSafe({ strict: false }).test(newMessage.content.toLowerCase());
        if (matches) {
          if (newMessage.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            await this.client.utils.messageDelete(newMessage, 0);
            newMessage.channel.send(`**◎ Your message contained a link and it was deleted, ${newMessage.author}**`).then((msg) => {
              this.client.utils.deletableCheck(msg, 10000);
            });
          }
        }
      }
    }

    const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${oldMessage.guild.id};`).get();
    if (!id) return;

    const logs = id.channel;
    if (!logs) return;

    if (!oldMessage.content) return;

    if (oldMessage.content.length === 0) {
      return;
    }
    if (oldMessage.author.bot === true) {
      return;
    }
    if (oldMessage.content === newMessage.content) {
      return;
    }

    if (oldMessage.content.length + newMessage.content.length > 6000) return;

    const embed = new RagnarokEmbedF()
      .setColor(this.client.utils.color(newMessage.guild.members.me.displayHexColor))
      .setAuthor({
        name: `${oldMessage.author.tag}`,
        iconURL: this.client.user.displayAvatarURL({ extension: 'png' })
      })
      .setTitle('Message Updated')
      .splitFields([`**◎ Before:**\n${oldMessage.content}`, `**◎ After:**\n${newMessage.content}`])
      .setTimestamp()
      .setURL(oldMessage.url);
    this.client.channels.cache.get(logs).send({ embeds: [embed] });
  }
};

export default EventF;
