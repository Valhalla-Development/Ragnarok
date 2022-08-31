import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';
import * as packageFile from '../../../package.json' assert { type: 'json' };

const { version } = packageFile.default;

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Display list of commands.',
      category: 'Informative'
    });
  }

  async run(interaction) {
    const embed = new EmbedBuilder()
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .setDescription(
        `Hey, I'm **__${this.client.user.username}__**, A multi-purpose bot!
      You can press a button below to see available commands within its category.`
      )
      .setAuthor({ name: `${interaction.guild.name} Help`, iconURL: interaction.guild.iconURL() })
      .setThumbnail(this.client.user.displayAvatarURL())
      .setFooter({ text: `Bot Version ${version}`, iconURL: this.client.user.avatarURL() });

    const buttonEco = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Economy').setCustomId('eco');
    const buttonFun = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Fun').setCustomId('fun');
    const buttonInfo = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Information').setCustomId('info');
    const buttonMod = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Moderation').setCustomId('mod');
    const buttonTicket = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Ticket').setCustomId('ticket');
    const buttonHome = new ButtonBuilder().setCustomId('home').setEmoji('🏠').setStyle(ButtonStyle.Success).setDisabled(true);
    const buttonInv = new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel('Invite Me')
      .setURL('https://discordapp.com/oauth2/authorize?client_id=508756879564865539&scope=bot%20applications.commands&permissions=1514550062326');
    const buttonSupp = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Support Server').setURL('https://discord.gg/Q3ZhdRJ');
    const buttonPizza = new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel('🍕 Buy me a Pizza')
      .setURL('https://www.buymeacoffee.com/ragnarlothbrok');

    const row = new ActionRowBuilder().addComponents(buttonHome, buttonEco, buttonFun, buttonInfo, buttonMod);
    const row2 = new ActionRowBuilder().addComponents(buttonTicket, buttonInv, buttonSupp, buttonPizza);

    const m = await interaction.reply({ ephemeral: true, components: [row, row2], embeds: [embed] });

    const filter = (but) => but.user.id !== this.client.user.id;

    const collector = m.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async (b) => {
      collector.resetTimer();

      if (b.customId === 'home') {
        buttonHome.setDisabled(true);

        embed.spliceFields(0, 1);

        const rowNew = new ActionRowBuilder().addComponents(buttonHome, buttonEco, buttonFun, buttonInfo, buttonMod);
        const row2New = new ActionRowBuilder().addComponents(buttonTicket, buttonInv, buttonSupp, buttonPizza);

        await b.update({ embeds: [embed], components: [rowNew, row2New] });
      }

      if (b.customId === 'eco') {
        buttonHome.setDisabled(false);

        const categories = this.client.utils.removeDuplicates(
          this.client.slashCommands.filter((cmd) => cmd.category === 'Economy').map((cmd) => cmd.name)
        );

        for (let i = 0; i < categories.length; i += 1) {
          categories[i] = categories[i][0].toUpperCase() + categories[i].substr(1);
        }

        embed.spliceFields(0, 1);
        embed.addFields({ name: '**Help - Economy**', value: `\`${categories.join('`, `')}\`` });

        const rowNew = new ActionRowBuilder().addComponents(buttonHome, buttonEco, buttonFun, buttonInfo, buttonMod);
        const row2New = new ActionRowBuilder().addComponents(buttonTicket, buttonInv, buttonSupp, buttonPizza);

        await b.update({ embeds: [embed], components: [rowNew, row2New] });
        return;
      }
      if (b.customId === 'fun') {
        buttonHome.setDisabled(false);

        const categories = this.client.utils.removeDuplicates(
          this.client.slashCommands.filter((cmd) => cmd.category === 'Fun').map((cmd) => cmd.name)
        );

        for (let i = 0; i < categories.length; i += 1) {
          categories[i] = categories[i][0].toUpperCase() + categories[i].substr(1);
        }

        embed.spliceFields(0, 1);
        embed.addFields({ name: '**Help - Fun**', value: `\`${categories.join('`, `')}\`` });

        const rowNew = new ActionRowBuilder().addComponents(buttonHome, buttonEco, buttonFun, buttonInfo, buttonMod);
        const row2New = new ActionRowBuilder().addComponents(buttonTicket, buttonInv, buttonSupp, buttonPizza);

        await b.update({ embeds: [embed], components: [rowNew, row2New] });
        return;
      }
      if (b.customId === 'info') {
        buttonHome.setDisabled(false);

        const categories = this.client.utils.removeDuplicates(
          this.client.slashCommands.filter((cmd) => cmd.category === 'Informative').map((cmd) => cmd.name)
        );

        for (let i = 0; i < categories.length; i += 1) {
          categories[i] = categories[i][0].toUpperCase() + categories[i].substr(1);
        }

        embed.spliceFields(0, 1);
        embed.addFields({ name: '**Help - Informative**', value: `\`${categories.join('`, `')}\`` });

        const rowNew = new ActionRowBuilder().addComponents(buttonHome, buttonEco, buttonFun, buttonInfo, buttonMod);
        const row2New = new ActionRowBuilder().addComponents(buttonTicket, buttonInv, buttonSupp, buttonPizza);

        await b.update({ embeds: [embed], components: [rowNew, row2New] });
        return;
      }
      if (b.customId === 'mod') {
        buttonHome.setDisabled(false);

        const categories = this.client.utils.removeDuplicates(
          this.client.slashCommands.filter((cmd) => cmd.category === 'Moderation').map((cmd) => cmd.name)
        );

        for (let i = 0; i < categories.length; i += 1) {
          categories[i] = categories[i][0].toUpperCase() + categories[i].substr(1);
        }

        embed.spliceFields(0, 1);
        embed.addFields({ name: '**Help - Moderation**', value: `\`${categories.join('`, `')}\`` });

        const rowNew = new ActionRowBuilder().addComponents(buttonHome, buttonEco, buttonFun, buttonInfo, buttonMod);
        const row2New = new ActionRowBuilder().addComponents(buttonTicket, buttonInv, buttonSupp, buttonPizza);

        await b.update({ embeds: [embed], components: [rowNew, row2New] });
        return;
      }
      if (b.customId === 'ticket') {
        buttonHome.setDisabled(false);

        const categories = this.client.utils.removeDuplicates(
          this.client.slashCommands.filter((cmd) => cmd.category === 'Ticket').map((cmd) => cmd.name)
        );

        for (let i = 0; i < categories.length; i += 1) {
          categories[i] = categories[i][0].toUpperCase() + categories[i].substr(1);
        }

        embed.spliceFields(0, 1);
        embed.addFields({ name: '**Help - Ticket**', value: `\`${categories.join('`, `')}\`` });

        const rowNew = new ActionRowBuilder().addComponents(buttonHome, buttonEco, buttonFun, buttonInfo, buttonMod);
        const row2New = new ActionRowBuilder().addComponents(buttonTicket, buttonInv, buttonSupp, buttonPizza);

        await b.update({ embeds: [embed], components: [rowNew, row2New] });
      }
    });

    collector.on('end', () => {
      // Disable button and update message
      buttonEco.setDisabled(true);
      buttonFun.setDisabled(true);
      buttonInfo.setDisabled(true);
      buttonMod.setDisabled(true);
      buttonTicket.setDisabled(true);
      buttonHome.setDisabled(true);
      interaction.editReply({ components: [row, row2] });
    });
  }
};

export default SlashCommandF;
