import { EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import SQLite from 'better-sqlite3';
import SlashCommand from '../../Structures/SlashCommand.js';
import * as packageFile from '../../../package.json' assert { type: 'json' };

const { version } = packageFile.default;

const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Display command list / command usage.')
  .addStringOption((option) => option.setName('command').setDescription('To see command specific instructions').setRequired(false));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Display command list / command usage.',
      category: 'Informative',
      usage: '[command]',
      options: data
    });
  }

  async run(interaction) {
    if (interaction.options.getString('command')) {
      const cmd = this.client.slashCommands.get(interaction.options.getString('command'));

      if (!cmd || cmd.category === 'Hidden') {
        const embed1 = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Help**`,
          value: `**◎ Error:** Invalid command name: \`${interaction.options.getString('command')}\``
        });
        interaction.reply({ ephemeral: true, embeds: [embed1] });
        return;
      }

      let reqPerm;
      if (cmd.userPerms.bitfield === 0n) {
        reqPerm = '**◎ Permission Required:** None.';
      } else {
        reqPerm = `**◎ Permission(s) Required:** \`${this.client.utils.formatArray(cmd.userPerms)}\``;
      }

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .setAuthor({ name: `${this.client.utils.capitalise(cmd.name)} Command Help`, iconURL: this.client.user.displayAvatarURL() })
        .setDescription(
          `**◎ Description:** ${cmd.description}
				**◎ Category:** ${cmd.category}
				**◎ Usage:** ${cmd.usage}
				${reqPerm}`
        )
        .setAuthor({ name: `${interaction.guild.name} Help`, iconURL: interaction.guild.iconURL({ extension: 'png' }) })
        .setThumbnail(this.client.user.displayAvatarURL())
        .setFooter({ text: `Bot Version ${version}`, iconURL: this.client.user.avatarURL({ extension: 'png' }) });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .setDescription(
        `Hey, I'm [**__Ragnarok__**]! A multi-purpose bot!
				Run \`/help <command>\` to see command specific instructions
				
				Command Parameters: \`<>\` is strict & \`[]\` is optional`
      )
      .setAuthor({ name: `${interaction.guild.name} Help`, iconURL: interaction.guild.iconURL({ extension: 'png' }) })
      .setThumbnail(this.client.user.displayAvatarURL())
      .setFooter({ text: `Bot Version ${version}`, iconURL: this.client.user.avatarURL({ extension: 'png' }) });

    const buttonEco = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Economy').setCustomId('eco');
    const buttonFun = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Fun').setCustomId('fun');
    const buttonGen = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Generators').setCustomId('gens');
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

    const row = new ActionRowBuilder().addComponents(buttonHome, buttonEco, buttonFun, buttonGen, buttonInfo);
    const row2 = new ActionRowBuilder().addComponents(buttonMod, buttonTicket, buttonInv, buttonSupp, buttonPizza);

    const m = await interaction.reply({ ephemeral: true, components: [row, row2], embeds: [embed] });

    const filter = (but) => but.user.id !== this.client.user.id;

    const collector = m.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async (b) => {
      collector.resetTimer();

      if (b.customId === 'home') {
        buttonHome.setDisabled(true);

        embed.spliceFields(0, 1);

        const rowNew = new ActionRowBuilder().addComponents(buttonHome, buttonEco, buttonFun, buttonGen, buttonInfo);
        const row2New = new ActionRowBuilder().addComponents(buttonMod, buttonTicket, buttonInv, buttonSupp, buttonPizza);

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

        const rowNew = new ActionRowBuilder().addComponents(buttonHome, buttonEco, buttonFun, buttonGen, buttonInfo);
        const row2New = new ActionRowBuilder().addComponents(buttonMod, buttonTicket, buttonInv, buttonSupp, buttonPizza);

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

        const rowNew = new ActionRowBuilder().addComponents(buttonHome, buttonEco, buttonFun, buttonGen, buttonInfo);
        const row2New = new ActionRowBuilder().addComponents(buttonMod, buttonTicket, buttonInv, buttonSupp, buttonPizza);

        await b.update({ embeds: [embed], components: [rowNew, row2New] });
        return;
      }
      if (b.customId === 'gens') {
        buttonHome.setDisabled(false);

        const categories = this.client.utils.removeDuplicates(
          this.client.slashCommands.filter((cmd) => cmd.category === 'Generators').map((cmd) => cmd.name)
        );

        for (let i = 0; i < categories.length; i += 1) {
          categories[i] = categories[i][0].toUpperCase() + categories[i].substr(1);
        }

        embed.spliceFields(0, 1);
        embed.addFields({ name: '**Help - Generators**', value: `\`${categories.join('`, `')}\`` });

        const rowNew = new ActionRowBuilder().addComponents(buttonHome, buttonEco, buttonFun, buttonGen, buttonInfo);
        const row2New = new ActionRowBuilder().addComponents(buttonMod, buttonTicket, buttonInv, buttonSupp, buttonPizza);

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

        const rowNew = new ActionRowBuilder().addComponents(buttonHome, buttonEco, buttonFun, buttonGen, buttonInfo);
        const row2New = new ActionRowBuilder().addComponents(buttonMod, buttonTicket, buttonInv, buttonSupp, buttonPizza);

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

        const rowNew = new ActionRowBuilder().addComponents(buttonHome, buttonEco, buttonFun, buttonGen, buttonInfo);
        const row2New = new ActionRowBuilder().addComponents(buttonMod, buttonTicket, buttonInv, buttonSupp, buttonPizza);

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

        const rowNew = new ActionRowBuilder().addComponents(buttonHome, buttonEco, buttonFun, buttonGen, buttonInfo);
        const row2New = new ActionRowBuilder().addComponents(buttonMod, buttonTicket, buttonInv, buttonSupp, buttonPizza);

        await b.update({ embeds: [embed], components: [rowNew, row2New] });
      }
    });

    collector.on('end', () => {
      // Disable button and update message
      buttonEco.setDisabled(true);
      buttonFun.setDisabled(true);
      buttonGen.setDisabled(true);
      buttonInfo.setDisabled(true);
      buttonMod.setDisabled(true);
      buttonTicket.setDisabled(true);
      buttonHome.setDisabled(true);
      interaction.editReply({ components: [row, row2] });
    });
  }
};

export default SlashCommandF;
