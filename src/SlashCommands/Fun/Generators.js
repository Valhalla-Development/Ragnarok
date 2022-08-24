import { AttachmentBuilder, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import DIG from 'discord-image-generation';
import Canvas from 'canvas';
import SlashCommand from '../../Structures/SlashCommand.js';

Canvas.registerFont('./Storage/Canvas/Fonts/Roboto-Thin.ttf', {
  family: 'Roboto'
});

const data = new SlashCommandBuilder()
  .setName('generators')
  .setDescription('Generate an image')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('all')
      .setDescription('List of available generators')
      .addStringOption((option) => option.setName('all').setDescription('View all commands'))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('affect')
      .setDescription('Generate a Affect image')
      .addUserOption((option) => option.setName('target').setDescription('The user'))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('batslap')
      .setDescription('Generate a BatSlap image')
      .addUserOption((option) => option.setName('target').setDescription('The user').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('beautiful')
      .setDescription('Generate a Beautiful image')
      .addUserOption((option) => option.setName('target').setDescription('The user'))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('bed')
      .setDescription('Generate a Bed image')
      .addUserOption((option) => option.setName('target').setDescription('The user').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('bobross')
      .setDescription('Generate a BobRoss image')
      .addUserOption((option) => option.setName('target').setDescription('The user'))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('captcha')
      .setDescription('Generate a Captcha image')
      .addStringOption((option) => option.setName('text').setDescription('Text to generate').setMaxLength(13).setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('delete')
      .setDescription('Generate a Delete image')
      .addUserOption((option) => option.setName('target').setDescription('The user'))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('jail')
      .setDescription('Generate a Jail image')
      .addUserOption((option) => option.setName('target').setDescription('The user'))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('kiss')
      .setDescription('Generate a Kiss image')
      .addUserOption((option) => option.setName('target').setDescription('The user').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('lisa')
      .setDescription('Generate a Lisa image')
      .addStringOption((option) => option.setName('text').setDescription('Text to generate').setMaxLength(300).setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('notstonks')
      .setDescription('Generate a NotStonks image')
      .addUserOption((option) => option.setName('target').setDescription('The user'))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('rip')
      .setDescription('Generate a Rip image')
      .addUserOption((option) => option.setName('target').setDescription('The user'))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('spank')
      .setDescription('Generate a Spank image')
      .addUserOption((option) => option.setName('target').setDescription('The user').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('stonks')
      .setDescription('Generate a Stonks image')
      .addUserOption((option) => option.setName('target').setDescription('The user'))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('tatoo')
      .setDescription('Generate a Tatoo image')
      .addUserOption((option) => option.setName('target').setDescription('The user'))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('trash')
      .setDescription('Generate a Trash image')
      .addUserOption((option) => option.setName('target').setDescription('The user'))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('triggered')
      .setDescription('Generate a Triggered image')
      .addUserOption((option) => option.setName('target').setDescription('The user'))
  );

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Generate an image',
      category: 'fun',
      options: data
    });
  }

  async run(interaction) {
    const type = interaction.options.getSubcommand();

    if (type === 'all') {
      const available = [
        'Affect',
        'BatSlap',
        'Beautiful',
        'Bed',
        'BobRoss',
        'Captcha',
        'Delete',
        'Jail',
        'Kiss',
        'Lisa',
        'NotStonks',
        'Rip',
        'Spank',
        'Stonks',
        'Tatoo',
        'Trash',
        'Triggered'
      ];

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Generators**`, value: `**◎ All available options:**\n\n${available.join(', ')}` });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    if (type === 'affect') {
      const member = interaction.options.getMember('target') || interaction.member;
      const avatar = member.user.displayAvatarURL({ extension: 'png' });

      const img = await new DIG.Affect().getImage(avatar);
      const attach = new AttachmentBuilder(img, { name: 'Affect.png' });
      interaction.reply({ files: [attach] });
      return;
    }

    if (type === 'batslap') {
      const member = interaction.options.getMember('target') || interaction.member;

      const img = await new DIG.Batslap().getImage(
        interaction.user.displayAvatarURL({ extension: 'png' }),
        member.user.displayAvatarURL({ extension: 'png' })
      );
      const attach = new AttachmentBuilder(img, { name: 'BatSlap.png' });
      interaction.reply({ files: [attach] });
      return;
    }

    if (type === 'beautiful') {
      const member = interaction.options.getMember('target') || interaction.member;
      const avatar = member.user.displayAvatarURL({ extension: 'png' });

      const img = await new DIG.Beautiful().getImage(avatar);
      const attach = new AttachmentBuilder(img, { name: 'Beautiful.png' });
      interaction.reply({ files: [attach] });
      return;
    }

    if (type === 'bed') {
      const member = interaction.options.getMember('target') || interaction.member;

      const img = await new DIG.Bed().getImage(
        interaction.user.displayAvatarURL({ extension: 'png' }),
        member.user.displayAvatarURL({ extension: 'png' })
      );
      const attach = new AttachmentBuilder(img, { name: 'Bed.png' });
      interaction.reply({ files: [attach] });
      return;
    }

    if (type === 'bobross') {
      const member = interaction.options.getMember('target') || interaction.member;
      const avatar = member.user.displayAvatarURL({ extension: 'png' });

      const img = await new DIG.Bobross().getImage(avatar);
      const attach = new AttachmentBuilder(img, { name: 'BobRoss.png' });
      interaction.reply({ files: [attach] });
      return;
    }

    if (type === 'captcha') {
      const args = interaction.options.getString('text');

      const canvas = Canvas.createCanvas(789, 199);
      const ctx = canvas.getContext('2d');

      const background = await Canvas.loadImage('./Storage/Canvas/Images/captcha.jpg');
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      ctx.font = '40px "Roboto"';
      ctx.fillStyle = '#000000';
      ctx.fillText(`${args}`, canvas.width / 5.5, canvas.height / 1.82);

      ctx.beginPath();
      ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'Captcha.png' });

      interaction.reply({ files: [attachment] });
      return;
    }

    if (type === 'delete') {
      const member = interaction.options.getMember('target') || interaction.member;
      const avatar = member.user.displayAvatarURL({ extension: 'png' });

      const img = await new DIG.Delete().getImage(avatar);
      const attach = new AttachmentBuilder(img, { name: 'Delete.png' });
      interaction.reply({ files: [attach] });
      return;
    }

    if (type === 'jail') {
      const member = interaction.options.getMember('target') || interaction.member;
      const avatar = member.user.displayAvatarURL({ extension: 'png' });

      const img = await new DIG.Jail().getImage(avatar);
      const attach = new AttachmentBuilder(img, { name: 'Jail.png' });
      interaction.reply({ files: [attach] });
      return;
    }

    if (type === 'kiss') {
      const member = interaction.options.getMember('target') || interaction.member;

      const img = await new DIG.Kiss().getImage(
        interaction.user.displayAvatarURL({ extension: 'png' }),
        member.user.displayAvatarURL({ extension: 'png' })
      );
      const attach = new AttachmentBuilder(img, { name: 'Kiss.png' });
      interaction.reply({ files: [attach] });
      return;
    }

    if (type === 'lisa') {
      const args = interaction.options.getString('text');

      const img = await new DIG.LisaPresentation().getImage(args);
      const attach = new AttachmentBuilder(img, { name: 'Lisa.png' });
      interaction.reply({ files: [attach] });
      return;
    }

    if (type === 'notstonks') {
      const member = interaction.options.getMember('target') || interaction.member;
      const avatar = member.user.displayAvatarURL({ extension: 'png' });

      const img = await new DIG.NotStonk().getImage(avatar);
      const attach = new AttachmentBuilder(img, { name: 'NotStonks.png' });
      interaction.reply({ files: [attach] });
      return;
    }

    if (type === 'rip') {
      const member = interaction.options.getMember('target') || interaction.member;
      const avatar = member.user.displayAvatarURL({ extension: 'png' });

      const img = await new DIG.Rip().getImage(avatar);
      const attach = new AttachmentBuilder(img, { name: 'Rip.png' });
      interaction.reply({ files: [attach] });
      return;
    }

    if (type === 'spank') {
      const member = interaction.options.getMember('target') || interaction.member;

      const img = await new DIG.Spank().getImage(
        interaction.user.displayAvatarURL({ extension: 'png' }),
        member.user.displayAvatarURL({ extension: 'png' })
      );
      const attach = new AttachmentBuilder(img, { name: 'Spank.png' });
      interaction.reply({ files: [attach] });
      return;
    }

    if (type === 'stonks') {
      const member = interaction.options.getMember('target') || interaction.member;
      const avatar = member.user.displayAvatarURL({ extension: 'png' });

      const img = await new DIG.Stonk().getImage(avatar);
      const attach = new AttachmentBuilder(img, { name: 'Stonks.png' });
      interaction.reply({ files: [attach] });
      return;
    }

    if (type === 'tatoo') {
      const member = interaction.options.getMember('target') || interaction.member;
      const avatar = member.user.displayAvatarURL({ extension: 'png' });

      const img = await new DIG.Tatoo().getImage(avatar);
      const attach = new AttachmentBuilder(img, { name: 'Tatoo.png' });
      interaction.reply({ files: [attach] });
      return;
    }

    if (type === 'trash') {
      const member = interaction.options.getMember('target') || interaction.member;
      const avatar = member.user.displayAvatarURL({ extension: 'png' });

      const img = await new DIG.Trash().getImage(avatar);
      const attach = new AttachmentBuilder(img, { name: 'Trash.png' });
      interaction.reply({ files: [attach] });
      return;
    }

    if (type === 'triggered') {
      const member = interaction.options.getMember('target') || interaction.member;
      const avatar = member.user.displayAvatarURL({ extension: 'png' });

      const img = await new DIG.Triggered().getImage(avatar);
      const attach = new AttachmentBuilder(img, { name: 'Triggered.gif' });
      interaction.reply({ files: [attach] });
    }
  }
};

export default SlashCommandF;
