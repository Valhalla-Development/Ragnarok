/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import { EmbedBuilder } from 'discord.js';
import prettyMilliseconds from 'pretty-ms';
import SQLite from 'better-sqlite3';
import SlashCommand from '../../Structures/SlashCommand.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Harvests crops',
      category: 'Economy'
    });
  }

  async run(interaction) {
    const balance = await this.client.getBalance.get(`${interaction.user.id}-${interaction.guild.id}`);

    let foundBoostList = await JSON.parse(balance.boosts);

    if (!foundBoostList) {
      foundBoostList = {};
    }

    if (!foundBoostList.farmPlot) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Harvest**`,
          value: '**◎ Error:** You do not have a farming plot! You will be awarded one once you purhcase farming tools with: `/shop buy`'
        });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    let foundPlotList = await JSON.parse(balance.farmPlot);

    if (!foundPlotList) {
      foundPlotList = [];
    }

    foundPlotList.forEach((key) => {
      if (Date.now() > key.cropGrowTime) {
        key.cropStatus = 'harvest';
        key.cropGrowTime = 'na';
        key.decay = 0;

        db.prepare('UPDATE balance SET farmPlot = (@farmPlot) WHERE id = (@id);').run({
          farmPlot: JSON.stringify(foundPlotList),
          id: `${interaction.user.id}-${interaction.guild.id}`
        });
      }
    });

    let harvestable;

    if (foundPlotList.length) {
      harvestable = foundPlotList.filter((key) => key.cropStatus === 'harvest');
    } else {
      harvestable = [];
    }

    if (!foundPlotList.length && !harvestable.length) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Harvest**`, value: '**◎ Error:** You have nothing to harvest!' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    if (foundPlotList.length && !harvestable.length) {
      const arr = [];

      const Embeds = [];
      // Luke gets credit for this magic
      let PageNo = 1;

      const filter = foundPlotList.filter((e) => e.cropGrowTime !== 'na');
      const filterHarvest = foundPlotList.filter((e) => e.cropStatus === 'harvest');

      filterHarvest.forEach((key) => {
        arr.push(`\u3000Crop Type: \`${this.client.utils.capitalise(key.cropType)}\` - Crop Decay: \`${key.decay.toFixed(4)}%\``);
      });

      filter.forEach((key) => {
        const then = prettyMilliseconds(new Date().getTime() - key.cropGrowTime.toFixed(0), { millisecondsDecimalDigits: true });
        const test = then.replace(/-/g, '');
        const thenTime = test.substring(0, test.indexOf('s') + 1);

        if (key.cropType === 'corn') {
          arr.push(`\u3000Crop Type: \`Corn\` - Time until grown: \`${thenTime}\``);
        }
        if (key.cropType === 'wheat') {
          arr.push(`\u3000Crop Type: \`Wheat\` - Time until grown: \`${thenTime}\``);
        }
        if (key.cropType === 'potato') {
          arr.push(`\u3000Crop Type: \`Potato\` - Time until grown: \`${thenTime}\``);
        }
        if (key.cropType === 'tomato') {
          arr.push(`\u3000Crop Type: \`Tomato\` - Time until grown: \`${thenTime}\``);
        }
      });

      const TestPages = arr.length;
      const TotalPage = Math.ceil(TestPages / 5);

      for (const Page of arr) {
        const Embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Harvest**`,
            value: `**◎ Success:** Current crop status:
						${arr.splice(0, 5).join('\n')}`
          })
          .setFooter({ text: `${TotalPage > 1 ? `Page: ${(PageNo += 1)}/${TotalPage}` : ''}` });
        Embeds.push(Embed);
      }
      TotalPage > 1 ? this.client.functions.pagination(interaction, Embeds) : interaction.reply({ embeds: [Embeds[0]] });
      return;
    }

    let foundHarvestedList = await JSON.parse(balance.harvestedCrops);

    if (!foundHarvestedList) {
      foundHarvestedList = [];
    }

    const availableSpots = foundBoostList.farmBag - foundHarvestedList.length;

    const cornPrice = this.client.ecoPrices.corn;
    const wheatPrice = this.client.ecoPrices.wheat;
    const potatoesPrice = this.client.ecoPrices.potatoes;
    const tomatoesPrice = this.client.ecoPrices.tomatoes;

    if (availableSpots <= 0) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Harvest**`,
          value: '**◎ Error:** You do not have enough space to harvest anything!\nYou can upgrade your storage with the command `/shop upgrade`'
        });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    const harvestedFunc = [];

    let totalToAdd = 0;
    let sellPrice;
    const arr = [];

    harvestCrops();

    harvestedFunc.forEach((key) => {
      if (key.cropType === 'corn') {
        totalToAdd += Math.floor(cornPrice * (1 - key.decay.toFixed(4) / 100));
        sellPrice = Math.floor(cornPrice * (1 - key.decay.toFixed(4) / 100));
        arr.push(
          `\u3000Crop Type: \`Corn\` - Current Value: <:coin:706659001164628008>\`${sellPrice.toLocaleString(
            'en'
          )}\` - Decayed: \`${key.decay.toFixed(4)}\`%`
        );
      }
      if (key.cropType === 'wheat') {
        totalToAdd += Math.floor(wheatPrice * (1 - key.decay.toFixed(4) / 100));
        sellPrice = Math.floor(wheatPrice * (1 - key.decay.toFixed(4) / 100));
        arr.push(
          `\u3000Crop Type: \`Wheat\` - Current Value: <:coin:706659001164628008>\`${sellPrice.toLocaleString(
            'en'
          )}\` - Decayed: \`${key.decay.toFixed(4)}\`%`
        );
      }
      if (key.cropType === 'potato') {
        totalToAdd += Math.floor(potatoesPrice * (1 - key.decay.toFixed(4) / 100));
        sellPrice = Math.floor(potatoesPrice * (1 - key.decay.toFixed(4) / 100));
        arr.push(
          `\u3000Crop Type: \`Potato\` - Current Value: <:coin:706659001164628008>\`${sellPrice.toLocaleString(
            'en'
          )}\` - Decayed: \`${key.decay.toFixed(4)}\`%`
        );
      }
      if (key.cropType === 'tomato') {
        totalToAdd += Math.floor(tomatoesPrice * (1 - key.decay.toFixed(4) / 100));
        sellPrice = Math.floor(tomatoesPrice * (1 - key.decay.toFixed(4) / 100));
        arr.push(
          `\u3000Crop Type: \`Tomato\` - Current Value: <:coin:706659001164628008>\`${sellPrice.toLocaleString(
            'en'
          )}\` - Decayed: \`${key.decay.toFixed(4)}\`%`
        );
      }
    });

    balance.farmPlot = foundPlotList.length ? JSON.stringify(foundPlotList) : null;
    balance.harvestedCrops = JSON.stringify(foundHarvestedList);

    this.client.setBalance.run(balance);

    const Embeds = [];
    const TestPages = arr.length;
    const TotalPage = Math.ceil(TestPages / 5);
    // Luke gets credit for this magic
    let PageNo = 1;

    for (const Page of arr) {
      const Embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Harvest**`,
          value: `**◎ Success:** You have harvested the following crops:
						${arr.splice(0, 5).join('\n')}\n\n In total, the current value is <:coin:706659001164628008>\`${totalToAdd.toLocaleString(
            'en'
          )}\`\nThis value of each crop will continue to depreciate, I recommend you sell your crops.`
        })
        .setFooter({ text: `${TotalPage > 1 ? `Page: ${(PageNo += 1)}/${TotalPage}` : ''}` });
      Embeds.push(Embed);
    }
    TotalPage > 1 ? this.client.functions.pagination(interaction, Embeds) : interaction.reply({ embeds: [Embeds[0]] });

    function harvestCrops() {
      for (let removeCounter = 0, harvestCounter = 0; removeCounter < foundPlotList.length && harvestCounter < availableSpots; removeCounter += 1) {
        if (foundPlotList[removeCounter].cropStatus === 'harvest') {
          const removedArray = foundPlotList.splice(removeCounter, 1);
          foundHarvestedList.push(removedArray[0]);
          harvestedFunc.push(removedArray[0]);
          harvestCounter += 1;
          removeCounter -= 1;
        }
      }
      return foundHarvestedList;
    }
  }
};

export default SlashCommandF;
