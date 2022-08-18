import { AttachmentBuilder } from 'discord.js';
import DIG from 'discord-image-generation';
import Command from '../../Structures/Command.js';

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ['notstonk'],
      description: 'Generate a Not Stonk image!',
      category: 'Generators',
      usage: '[@tag]'
    });
  }

  async run(message) {
    this.client.utils.messageDelete(message, 0);
    let avatar;

    if (message.mentions.members.first()) {
      avatar = message.mentions.members.first().user.displayAvatarURL({ dynamic: false, format: 'png' });
    } else {
      avatar = message.author.displayAvatarURL({ dynamic: false, format: 'png' });
    }

    const img = await new DIG.NotStonk().getImage(avatar);
    const attach = new AttachmentBuilder(img, { name: 'NotStonk.png' });
    message.channel.send({ files: [attach] });
  }
};

export default CommandF;
