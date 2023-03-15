import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import prettyMilliseconds from 'pretty-ms';
import SlashCommand from '../../Structures/SlashCommand.js';
import Balance from '../../Mongo/Schemas/Balance.js';

const data = new SlashCommandBuilder()
  .setName('plant')
  .setDescription('Plant seeds')
  .addStringOption((option) => option.setName('type').setDescription('Type of crop to plant').setRequired(true).setAutocomplete(true))
  .addIntegerOption((option) => option.setName('amount').setDescription('Amount to plant').setMinValue(1).setRequired(true));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Plant seeds',
      category: 'Economy',
      options: data
    });
  }

  async autoComplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = ['corn', 'wheat', 'potato', 'tomato'];
    const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
    await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
  }

  async run(interaction) {
    // Fetch the supplied content from the interaction
    const args = interaction.options.getString('type');
    const argsAmount = interaction.options.getInteger('amount');

    const balance = await Balance.findOne({ IdJoined: `${interaction.user.id}-${interaction.guild.id}` });

    let foundPlotList;

    if (balance.FarmPlot.length) {
      foundPlotList = balance.FarmPlot;
    } else {
      foundPlotList = [];
    }
    
    const cornGrow = this.client.ecoPrices.cornPlant;
    const wheatGrow = this.client.ecoPrices.wheatPlant;
    const potatoGrow = this.client.ecoPrices.potatoPlant;
    const tomatoeGrow = this.client.ecoPrices.tomatoPlant;
    
    if (!balance.Boosts.FarmPlot) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Plant**`,
          value: '**◎ Error:** You do not have a farming plot! You will be awarded one once you purhcase farming tools with: `/shop buy`'
        });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    if (!balance.Items.CornSeeds && !balance.Items.WheatSeeds && !balance.Items.PotatoSeeds && !balance.Items.TomatoSeeds) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Plant**`,
          value: '**◎ Error:** You do not have any seeds! You can buy them from the shop:\n/shop buy'
        });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    if (foundPlotList.length >= Number(balance.Boosts.FarmPlot)) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Plant**`,
          value: '**◎ Error:** You do not have enough space in your plot. You can upgrade your plot with the command `/shop upgrade`'
        });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    async function cropCreator(type, status, time, count) {
      for (let i = 0; i < count; i++) {
        foundPlotList.push({ cropType: type, cropStatus: status, cropGrowTime: time, decay: 0 });
      }
      balance.FarmPlot = foundPlotList;
      await balance.save();
    }

    if (args === 'corn') {
      if (argsAmount <= 0) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Plant**`, value: '**◎ Error:** Please enter a valid number.' });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (!balance.Items.CornSeeds || Number(balance.Items.CornSeeds - Number(argsAmount)) < 0) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Plant**`,
            value: '**◎ Error:** You do not have any corn seeds! You can buy some by running: `/shop buy`'
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (foundPlotList.length + Number(argsAmount) > Number(balance.Boosts.FarmPlot)) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Plant**`,
            value: `**◎ Error:** You do not have enough room to plant \`${argsAmount}\` ${
              argsAmount > 1 ? 'seeds.' : 'seed.'
            }\nYour current plot capacity is: \`${foundPlotList.length}\`/\`${Number(balance.Boosts.FarmPlot)}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      balance.Items.CornSeeds = Number(balance.Items.CornSeeds) - Number(argsAmount);

      await cropCreator('corn', 'planting', new Date().getTime() + Number(cornGrow), argsAmount);

      await balance.save();

      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Plant**`,
          value: `**◎ Success:** You have successfully planted \`${argsAmount}\` ${
            argsAmount > 1 ? 'seeds.' : 'seed.'
          }\nCorn takes \`${prettyMilliseconds(cornGrow, { verbose: true })}\` to grow.\nYour current plot capacity is: \`${
            foundPlotList.length
          }\`/\`${Number(balance.Boosts.FarmPlot)}\``
        });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    if (args === 'wheat') {
      if (argsAmount <= 0) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Plant**`, value: '**◎ Error:** Please enter a valid number.' });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (!balance.Items.WheatSeeds || Number(balance.Items.WheatSeeds - Number(argsAmount)) < 0) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Plant**`,
            value: '**◎ Error:** You do not have any wheat seeds! You can buy some by running: `/shop buy`'
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (foundPlotList.length + Number(argsAmount) > Number(balance.Boosts.FarmPlot)) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Plant**`,
            value: `**◎ Error:** You do not have enough room to plant \`${argsAmount}\` ${
              argsAmount > 1 ? 'seeds.' : 'seed.'
            }\nYour current plot capacity is: \`${foundPlotList.length}\`/\`${Number(balance.Boosts.FarmPlot)}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      balance.Items.WheatSeeds = Number(balance.Items.WheatSeeds) - Number(argsAmount);

      await cropCreator('wheat', 'planting', new Date().getTime() + Number(wheatGrow), argsAmount);

      await balance.save();

      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Plant**`,
          value: `**◎ Success:** You have successfully planted \`${argsAmount}\` ${
            argsAmount > 1 ? 'seeds.' : 'seed.'
          }\nWheat takes \`${prettyMilliseconds(wheatGrow, { verbose: true })}\` to grow.\nYour current plot capacity is: \`${
            foundPlotList.length
          }\`/\`${Number(balance.Boosts.FarmPlot)}\``
        });
      interaction.reply({ embeds: [embed] });
      return;
    }

    if (args === 'potato') {
      if (argsAmount <= 0) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Plant**`, value: '**◎ Error:** Please enter a valid number.' });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (!balance.Items.PotatoSeeds || Number(balance.Items.PotatoSeeds - Number(argsAmount)) < 0) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Plant**`,
            value: '**◎ Error:** You do not have any potato seeds! You can buy some by running: `/shop buy`'
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (foundPlotList.length + Number(argsAmount) > Number(balance.Boosts.FarmPlot)) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Plant**`,
            value: `**◎ Error:** You do not have enough room to plant \`${argsAmount}\` ${
              argsAmount > 1 ? 'seeds.' : 'seed.'
            }\nYour current plot capacity is: \`${foundPlotList.length}\`/\`${Number(balance.Boosts.FarmPlot)}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      balance.Items.PotatoSeeds = Number(balance.Items.PotatoSeeds) - Number(argsAmount);

      await cropCreator('potato', 'planting', new Date().getTime() + Number(potatoGrow), argsAmount);

      await balance.save();

      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Plant**`,
          value: `**◎ Success:** You have successfully planted \`${argsAmount}\` ${
            argsAmount > 1 ? 'seeds.' : 'seed.'
          }\nPotatoe's take \`${prettyMilliseconds(potatoGrow, { verbose: true })}\` to grow.\nYour current plot capacity is: \`${
            foundPlotList.length
          }\`/\`${Number(balance.Boosts.FarmPlot)}\``
        });
      interaction.reply({ embeds: [embed] });
      return;
    }

    if (args === 'tomato') {
      if (argsAmount <= 0) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Plant**`, value: '**◎ Error:** Please enter a valid number.' });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (!balance.Items.TomatoSeeds || Number(balance.Items.TomatoSeeds - Number(argsAmount)) < 0) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Plant**`,
            value: '**◎ Error:** You do not have any tomato seeds! You can buy some by running: `/shop buy`'
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (foundPlotList.length + Number(argsAmount) > Number(balance.Boosts.FarmPlot)) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Plant**`,
            value: `**◎ Error:** You do not have enough room to plant \`${argsAmount}\` ${
              argsAmount > 1 ? 'seeds.' : 'seed.'
            }\nYour current plot capacity is: \`${foundPlotList.length}\`/\`${Number(balance.Boosts.FarmPlot)}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      balance.Items.TomatoSeeds = Number(balance.Items.TomatoSeeds) - Number(argsAmount);

      await cropCreator('tomato', 'planting', new Date().getTime() + Number(tomatoeGrow), argsAmount);

      await balance.save();

      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Plant**`,
          value: `**◎ Success:** You have successfully planted \`${argsAmount}\` ${
            argsAmount > 1 ? 'seeds.' : 'seed.'
          }\nTomatoe's take \`${prettyMilliseconds(tomatoeGrow, { verbose: true })}\` to grow.\nYour current plot capacity is: \`${
            foundPlotList.length
          }\`/\`${Number(balance.Boosts.FarmPlot)}\``
        });
      interaction.reply({ embeds: [embed] });
    }
  }
};

export default SlashCommandF;
