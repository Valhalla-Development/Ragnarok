import { EmbedBuilder, ChannelType, PermissionsBitField, ActivityType } from 'discord.js';
import Event from '../../Structures/Event.js';

export const EventF = class extends Event {
  async run(guild) {
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    this.client.user.setActivity(
      `/help | ${this.client.guilds.cache.size.toLocaleString('en')} Guilds ${this.client.guilds.cache
        .reduce((a, b) => a + b.memberCount, 0)
        .toLocaleString('en')} Users`,
      {
        type: ActivityType.Watching
      }
    );

    let defaultChannel = '';

    const genChan = guild.channels.cache.find((chan) => chan.name === 'general');
    if (genChan) {
      defaultChannel = genChan;
    } else {
      guild.channels.cache.forEach((channel) => {
        if (channel.type === ChannelType.GuildText && defaultChannel === '') {
          if (channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages)) {
            defaultChannel = channel;
          }
        }
      });
    }

    if (defaultChannel === '') {
      return;
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${guild.name}`,
        iconURL: guild.iconURL({ extension: 'png' })
      })
      .setColor(this.client.utils.color(guild.members.me.displayHexColor))
      .setTitle(`Hello, I'm **${this.client.user.username}**! Thanks for inviting me!`)
      .setDescription(
        'To get started, you can run `/help`.\nIf you find any bugs, or have a suggestion, please use: `/suggest <message>`\nCheck `/stats` to see the latest announcements!'
      );
    defaultChannel.send({ embeds: [embed] });
  }
};

export default EventF;
