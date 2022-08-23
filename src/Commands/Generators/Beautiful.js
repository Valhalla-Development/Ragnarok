import { AttachmentBuilder } from 'discord.js';
import DIG from 'discord-image-generation';
import Command from '../../Structures/Command.js';

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ['beauty'],
      description: 'Generate a eautiful image!',
      category: 'Generators',
      usage: '[@tag]'
    });
  }

  async run(message) {
    this.client.utils.messageDelete(message, 0);
    let avatar;

    if (message.mentions.members.first()) {
      avatar = message.mentions.members.first().user.displayAvatarURL({ extension: 'png' });
    } else {
      avatar = message.author.displayAvatarURL({ extension: 'png' });
    }

    const img = await new DIG.Beautiful().getImage(avatar);
    const attach = new AttachmentBuilder(img, { name: 'Beautiful.png' });
    message.channel.send({ files: [attach] });
  }
};

export default CommandF;
