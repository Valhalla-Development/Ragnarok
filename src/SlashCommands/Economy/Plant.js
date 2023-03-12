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

    if (!balance || !balance.FarmPlot) {
      foundPlotList = [];
    } else {
      foundPlotList = JSON.parse(balance.FarmPlot);
    }

    let foundBoostList = JSON.parse(balance.Boosts);
    let foundItemList = JSON.parse(balance.Items);

    const cornGrow = this.client.ecoPrices.cornPlant;
    const wheatGrow = this.client.ecoPrices.wheatPlant;
    const potatoGrow = this.client.ecoPrices.potatoPlant;
    const tomatoeGrow = this.client.ecoPrices.tomatoPlant;

    if (!foundBoostList) {
      foundBoostList = {};
    }

    if (!foundItemList) {
      foundItemList = {};
    }

    if (!foundBoostList.FarmPlot) {
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

    if (!foundItemList.cornSeeds && !foundItemList.wheatSeeds && !foundItemList.potatoSeeds && !foundItemList.tomatoSeeds) {
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

    if (foundPlotList.length >= Number(foundBoostList.FarmPlot)) {
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
      let cropCounter;
      for (cropCounter = 0; cropCounter < count; cropCounter++) {
        foundPlotList.push({ cropType: type, cropStatus: status, cropGrowTime: time, decay: 0 });
      }

      balance.crops = JSON.stringify(foundPlotList);
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

      if (!foundItemList.cornSeeds || Number(foundItemList.cornSeeds - Number(argsAmount)) < 0) {
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

      if (foundPlotList.length + Number(argsAmount) > Number(foundBoostList.FarmPlot)) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Plant**`,
            value: `**◎ Error:** You do not have enough room to plant \`${argsAmount}\` ${
              argsAmount > 1 ? 'seeds.' : 'seed.'
            }\nYour current plot capacity is: \`${foundPlotList.length}\`/\`${Number(foundBoostList.FarmPlot)}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      const removeSeed = Number(foundItemList.cornSeeds) - Number(argsAmount);

      if (removeSeed === 0) {
        delete foundItemList.cornSeeds;
      } else {
        foundItemList.cornSeeds = removeSeed.toString();
      }

      await cropCreator('corn', 'planting', new Date().getTime() + Number(cornGrow), argsAmount);

      balance.Items = JSON.stringify(foundItemList);
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
          }\`/\`${Number(foundBoostList.FarmPlot)}\``
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

      if (!foundItemList.wheatSeeds || Number(foundItemList.wheatSeeds - Number(argsAmount)) < 0) {
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

      if (foundPlotList.length + Number(argsAmount) > Number(foundBoostList.FarmPlot)) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Plant**`,
            value: `**◎ Error:** You do not have enough room to plant \`${argsAmount}\` ${
              argsAmount > 1 ? 'seeds.' : 'seed.'
            }\nYour current plot capacity is: \`${foundPlotList.length}\`/\`${Number(foundBoostList.FarmPlot)}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      const removeSeed = Number(foundItemList.wheatSeeds) - Number(argsAmount);

      if (removeSeed === 0) {
        delete foundItemList.wheatSeeds;
      } else {
        foundItemList.wheatSeeds = removeSeed.toString();
      }

      await cropCreator('wheat', 'planting', new Date().getTime() + Number(wheatGrow), argsAmount);

      balance.Items = JSON.stringify(foundItemList);
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
          }\`/\`${Number(foundBoostList.FarmPlot)}\``
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

      if (!foundItemList.potatoSeeds || Number(foundItemList.potatoSeeds - Number(argsAmount)) < 0) {
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

      if (foundPlotList.length + Number(argsAmount) > Number(foundBoostList.FarmPlot)) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Plant**`,
            value: `**◎ Error:** You do not have enough room to plant \`${argsAmount}\` ${
              argsAmount > 1 ? 'seeds.' : 'seed.'
            }\nYour current plot capacity is: \`${foundPlotList.length}\`/\`${Number(foundBoostList.FarmPlot)}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      const removeSeed = Number(foundItemList.potatoSeeds) - Number(argsAmount);

      if (removeSeed === 0) {
        delete foundItemList.potatoSeeds;
      } else {
        foundItemList.potatoSeeds = removeSeed.toString();
      }

      await cropCreator('potato', 'planting', new Date().getTime() + Number(potatoGrow), argsAmount);

      balance.Items = JSON.stringify(foundItemList);
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
          }\`/\`${Number(foundBoostList.FarmPlot)}\``
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

      if (!foundItemList.tomatoSeeds || Number(foundItemList.tomatoSeeds - Number(argsAmount)) < 0) {
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

      if (foundPlotList.length + Number(argsAmount) > Number(foundBoostList.FarmPlot)) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Plant**`,
            value: `**◎ Error:** You do not have enough room to plant \`${argsAmount}\` ${
              argsAmount > 1 ? 'seeds.' : 'seed.'
            }\nYour current plot capacity is: \`${foundPlotList.length}\`/\`${Number(foundBoostList.FarmPlot)}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      const removeSeed = Number(foundItemList.tomatoSeeds) - Number(argsAmount);

      if (removeSeed === 0) {
        delete foundItemList.tomatoSeeds;
      } else {
        foundItemList.tomatoSeeds = removeSeed.toString();
      }

      await cropCreator('tomato', 'planting', new Date().getTime() + Number(tomatoeGrow), argsAmount);

      balance.Items = JSON.stringify(foundItemList);
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
          }\`/\`${Number(foundBoostList.FarmPlot)}\``
        });
      interaction.reply({ embeds: [embed] });
    }
  }
};

export default SlashCommandF;
