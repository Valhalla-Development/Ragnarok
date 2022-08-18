import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import DIG from 'discord-image-generation';
import Command from '../../Structures/Command.js';

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ['slap'],
      description: 'Generate a bat slap image!',
      category: 'Generators',
      usage: '<@tag>'
    });
  }

  async run(message) {
    this.client.utils.messageDelete(message, 0);

    const user = message.mentions.members.first();

    if (!user) {
      const incorrectFormat = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Bat Slap**`, value: '**◎ Error:** Incorrect usage! Please tag a user!' });
      message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    const img = await new DIG.Batslap().getImage(
      message.author.displayAvatarURL({ dynamic: false, format: 'png' }),
      user.user.displayAvatarURL({ dynamic: false, format: 'png' })
    );
    const attach = new AttachmentBuilder(img, { name: 'BatSlap.png' });
    message.channel.send({ files: [attach] });
  }
};

export default CommandF;
