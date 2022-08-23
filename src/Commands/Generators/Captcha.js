import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import Canvas from 'canvas';
import Command from '../../Structures/Command.js';

Canvas.registerFont('./Storage/Canvas/Fonts/Roboto-Thin.ttf', {
  family: 'Roboto'
});

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      description: 'Generates a captcha image with given text.',
      category: 'Generators',
      usage: '<input>',
      botPerms: ['AttachFiles']
    });
  }

  async run(message, args) {
    this.client.utils.messageDelete(message, 0);

    if (!args[0]) {
      const invalidInput = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Captcha**`, value: '**◎ Error:** You must supply some text!' });
      message.channel.send({ embeds: [invalidInput] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }
    if (args.length > 5) {
      const tooLong = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Captcha**`, value: '**◎ Error:** You can only have 5 words!' });
      message.channel.send({ embeds: [tooLong] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    const messagetoAdd = message.content.split(' ').splice(1).join(' ');

    const user = message.guild.members.cache.get(message.mentions.users.first());
    if (user) return;

    /* (SCRAP THIS FOR NOW: This only works for the first tag, not the second etc.)
    if (!user) {
      messagetoAdd = message.content
        .split(' ')
        .splice(1)
        .join(' ');
    } else if (!user.nickname) {
      messagetoAdd = `${user.user.username} ${
        message.content
          .split(' ')
          .splice(2)
          .join(' ')}`;
    } else {
      messagetoAdd = `${user.nickname} ${
        message.content
          .split(' ')
          .splice(2)
          .join(' ')}`;
    } */

    const canvas = Canvas.createCanvas(789, 199);
    const ctx = canvas.getContext('2d');

    const background = await Canvas.loadImage('./Storage/Canvas/Images/captcha.jpg');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.font = '40px "Roboto"';
    ctx.fillStyle = '#000000';
    ctx.fillText(`${messagetoAdd}`, canvas.width / 5.5, canvas.height / 1.82);

    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'captcha-image.jpg' });

    message.channel.send({ files: [attachment] });
  }
};

export default CommandF;
