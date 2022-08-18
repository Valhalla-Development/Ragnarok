import { EmbedBuilder } from 'discord.js';
import Command from '../../Structures/Command.js';

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ['pfp'],
      description: 'Fetches message author/tagged user profile picture.',
      category: 'Fun',
      usage: '[@tag]'
    });
  }

  async run(message) {
    const user = message.mentions.users.first() || message.author;

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${user.username}'s Avatar`, iconURL: user.avatarURL() })
      .setImage(user.avatarURL({ extension: 'png', size: 1024 }))
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor));
    message.channel.send({ embeds: [embed] });
  }
};

export default CommandF;
