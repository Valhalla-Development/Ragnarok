const Command = require('../../Structures/Command');
const { MessageAttachment } = require('discord.js');
const Canvas = require('canvas');
Canvas.registerFont('./Storage/Canvas/Fonts/Roboto-Thin.ttf', {
	family: 'Roboto'
});

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Inputs text into a captcha image.',
			category: 'Fun',
			usage: 'Captcha <input>'
		});
	}

	async run(message, args) {
		if (!args[0]) {
			message.channel.send('You must supply some text!');
			return;
		}
		if (args.length > 5) {
			message.channel.send('You can only have 5 words!');
			return;
		}

		const messagetoAdd = message.content
			.split(' ')
			.splice(1)
			.join(' ');

		const user = message.guild.member(message.mentions.users.first());
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

		const background = await Canvas.loadImage(
			'./Storage/Canvas/Images/Captcha.jpg'
		);
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

		ctx.font = '40px "Roboto"';
		ctx.fillStyle = '#000000';
		ctx.fillText(`${messagetoAdd}`, canvas.width / 5.5, canvas.height / 1.82);

		ctx.beginPath();
		ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();

		const attachment = new MessageAttachment(
			canvas.toBuffer(),
			'captcha-image.jpg'
		);

		message.channel.send(attachment);
	}

};
