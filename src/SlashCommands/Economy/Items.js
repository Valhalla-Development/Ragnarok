import { EmbedBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';
import Balance from '../../Mongo/Schemas/Balance.js';

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'View your inventory',
      category: 'Economy'
    });
  }

  async run(interaction) {
    const balance = await Balance.findOne({ idJoined: `${interaction.user.id}-${interaction.guild.id}` });

    if (!balance.items) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Items**`, value: '**◎ Error:** You do not have any items.' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    const fishingPrice = this.client.ecoPrices.fishingRod;
    const farmingPrice = this.client.ecoPrices.farmingTools;

    let foundItemList = JSON.parse(balance.items);
    let foundBoostList = JSON.parse(balance.boosts);
    let foundPlotList = JSON.parse(balance.farmPlot);
    let foundHarvestList = JSON.parse(balance.harvestedCrops);

    if (!foundBoostList) {
      foundBoostList = {};
    }

    if (!foundItemList) {
      foundItemList = {};
    }

    if (!foundPlotList) {
      foundPlotList = [];
    }

    if (!foundHarvestList) {
      foundHarvestList = [];
    }

    let troutPrice;
    let salmonPrice;
    let swordFishPrice;
    let pufferFishPrice;
    let treasurePrice;

    let goldBarPrice;
    let cornPrice = 0;
    let wheatPrice = 0;
    let potatoesPrice = 0;
    let tomatoesPrice = 0;
    let goldNuggetPrice;
    let barleyPrice;
    let spinachPrice;
    let strawberriesPrice;
    let lettucePrice;

    if (foundItemList.trout) troutPrice = this.client.ecoPrices.trout * Number(foundItemList.trout);
    if (foundItemList.kingSalmon) salmonPrice = this.client.ecoPrices.kingSalmon * Number(foundItemList.kingSalmon);
    if (foundItemList.swordfish) swordFishPrice = this.client.ecoPrices.swordfish * Number(foundItemList.swordfish);
    if (foundItemList.pufferfish) pufferFishPrice = this.client.ecoPrices.pufferfish * Number(foundItemList.pufferfish);
    if (foundItemList.treasure) treasurePrice = this.client.ecoPrices.treasure * Number(foundItemList.treasure);

    if (foundItemList.goldBar) goldBarPrice = this.client.ecoPrices.goldBar * Number(foundItemList.goldBar);

    foundHarvestList.forEach((obj) => {
      if (obj.cropType === 'corn') cornPrice += Math.floor(this.client.ecoPrices.corn * (1 - obj.decay.toFixed(4) / 100));
      if (obj.cropType === 'wheat') wheatPrice += Math.floor(this.client.ecoPrices.wheat * (1 - obj.decay.toFixed(4) / 100));
      if (obj.cropType === 'potato') potatoesPrice += Math.floor(this.client.ecoPrices.potatoes * (1 - obj.decay.toFixed(4) / 100));
      if (obj.cropType === 'tomato') tomatoesPrice += Math.floor(this.client.ecoPrices.tomatoes * (1 - obj.decay.toFixed(4) / 100));
    });

    if (foundItemList.goldNugget) goldNuggetPrice = this.client.ecoPrices.goldNugget * Number(foundItemList.goldNugget);
    if (foundItemList.barley) barleyPrice = this.client.ecoPrices.barley * Number(foundItemList.barley);
    if (foundItemList.spinach) spinachPrice = this.client.ecoPrices.spinach * Number(foundItemList.spinach);
    if (foundItemList.strawberries) strawberriesPrice = this.client.ecoPrices.strawberries * Number(foundItemList.strawberries);
    if (foundItemList.lettuce) lettucePrice = this.client.ecoPrices.lettuce * Number(foundItemList.lettuce);

    let fullPrice = 0;
    if (foundItemList.trout) fullPrice += Number(foundItemList.trout) * this.client.ecoPrices.trout;
    if (foundItemList.kingSalmon) fullPrice += Number(foundItemList.kingSalmon) * this.client.ecoPrices.kingSalmon;
    if (foundItemList.swordfish) fullPrice += Number(foundItemList.swordfish) * this.client.ecoPrices.swordfish;
    if (foundItemList.pufferfish) fullPrice += Number(foundItemList.pufferfish) * this.client.ecoPrices.pufferfish;
    if (foundItemList.treasure) fullPrice += Number(foundItemList.treasure) * this.client.ecoPrices.treasure;

    if (foundItemList.goldBar) fullPrice += Number(foundItemList.goldBar) * this.client.ecoPrices.goldBar;
    if (foundHarvestList) {
      fullPrice += Number(foundHarvestList.filter((key) => key.cropType === 'corn').length) * this.client.ecoPrices.corn;
      fullPrice += Number(foundHarvestList.filter((key) => key.cropType === 'wheat').length) * this.client.ecoPrices.wheat;
      fullPrice += Number(foundHarvestList.filter((key) => key.cropType === 'potato').length) * this.client.ecoPrices.potatoes;
      fullPrice += Number(foundHarvestList.filter((key) => key.cropType === 'tomato').length) * this.client.ecoPrices.tomatoes;
    }
    if (foundItemList.goldNugget) fullPrice += Number(foundItemList.goldNugget) * this.client.ecoPrices.goldNugget;
    if (foundItemList.barley) fullPrice += Number(foundItemList.barley) * this.client.ecoPrices.barley;
    if (foundItemList.spinach) fullPrice += Number(foundItemList.spinach) * this.client.ecoPrices.spinach;
    if (foundItemList.strawberries) fullPrice += Number(foundItemList.strawberries) * this.client.ecoPrices.strawberries;
    if (foundItemList.lettuce) fullPrice += Number(foundItemList.lettuce) * this.client.ecoPrices.lettuce;

    let currentTotalSeeds = 0;

    if (foundItemList.cornSeeds) {
      currentTotalSeeds += Number(foundItemList.cornSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }
    if (foundItemList.wheatSeeds) {
      currentTotalSeeds += Number(foundItemList.wheatSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }
    if (foundItemList.potatoSeeds) {
      currentTotalSeeds += Number(foundItemList.potatoSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }
    if (foundItemList.tomatoSeeds) {
      currentTotalSeeds += Number(foundItemList.tomatoSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }

    let currentTotalFish = 0;

    if (foundItemList.trout) {
      currentTotalFish += Number(foundItemList.trout);
    } else {
      currentTotalFish += Number(0);
    }
    if (foundItemList.kingSalmon) {
      currentTotalFish += Number(foundItemList.kingSalmon);
    } else {
      currentTotalFish += Number(0);
    }
    if (foundItemList.swordfish) {
      currentTotalFish += Number(foundItemList.swordfish);
    } else {
      currentTotalFish += Number(0);
    }
    if (foundItemList.pufferfish) {
      currentTotalFish += Number(foundItemList.pufferfish);
    } else {
      currentTotalFish += Number(0);
    }

    let currentTotalFarm = 0;

    if (foundHarvestList) {
      currentTotalFarm += Number(foundHarvestList.filter((key) => key.cropType === 'corn').length);
      currentTotalFarm += Number(foundHarvestList.filter((key) => key.cropType === 'wheat').length);
      currentTotalFarm += Number(foundHarvestList.filter((key) => key.cropType === 'potato').length);
      currentTotalFarm += Number(foundHarvestList.filter((key) => key.cropType === 'tomato').length);
    }

    let fields;

    if (!foundItemList.farmingTools) {
      fields = [
        '**◎ Crops:**',
        `\u3000 Barley: Own ${
          foundItemList.barley === undefined
            ? '`0`'
            : `\`${foundItemList.barley}\` - <:coin:706659001164628008> \`${barleyPrice.toLocaleString('en')}\``
        }`,
        `\u3000 Spinach: Own ${
          foundItemList.spinach === undefined
            ? '`0`'
            : `\`${foundItemList.spinach}\` - <:coin:706659001164628008> \`${spinachPrice.toLocaleString('en')}\``
        }`,
        `\u3000 Strawberries: Own ${
          foundItemList.strawberries === undefined
            ? '`0`'
            : `\`${foundItemList.strawberries} \`- <:coin:706659001164628008> \`${strawberriesPrice.toLocaleString('en')}\``
        }`,
        `\u3000 Lettuce: Own ${
          foundItemList.lettuce === undefined
            ? '`0`'
            : `\`${foundItemList.lettuce}\` - <:coin:706659001164628008> \`${lettucePrice.toLocaleString('en')}\``
        }`
      ];
    } else {
      fields = [
        '**◎ Crops:** (The value of your crops will go down over time, sell them!)',
        `\u3000 Corn: Own ${
          !foundHarvestList.filter((key) => key.cropType === 'corn').length
            ? '`0`'
            : `\`${foundHarvestList.filter((key) => key.cropType === 'corn').length}\` - <:coin:706659001164628008> \`${cornPrice.toLocaleString(
                'en'
              )}\``
        }`,
        `\u3000 Wheat: Own ${
          !foundHarvestList.filter((key) => key.cropType === 'wheat').length
            ? '`0`'
            : `\`${foundHarvestList.filter((key) => key.cropType === 'wheat').length}\` - <:coin:706659001164628008> \`${wheatPrice.toLocaleString(
                'en'
              )}\``
        }`,
        `\u3000 Potatoes: Own ${
          !foundHarvestList.filter((key) => key.cropType === 'potato').length
            ? '`0`'
            : `\`${
                foundHarvestList.filter((key) => key.cropType === 'potato').length
              }\` - <:coin:706659001164628008> \`${potatoesPrice.toLocaleString('en')}\``
        }`,
        `\u3000 Tomatoes: Own ${
          !foundHarvestList.filter((key) => key.cropType === 'tomato').length
            ? '`0`'
            : `\`${
                foundHarvestList.filter((key) => key.cropType === 'tomato').length
              }\` - <:coin:706659001164628008> \`${tomatoesPrice.toLocaleString('en')}\``
        }`,
        '\u200b',
        '**◎ Seeds:**',
        `\u3000 Corn: Own ${foundItemList.cornSeeds === undefined ? '`0`' : `\`${foundItemList.cornSeeds}\``}`,
        `\u3000 Wheat: Own ${foundItemList.wheatSeeds === undefined ? '`0`' : `\`${foundItemList.wheatSeeds}\``}`,
        `\u3000 Potatoes: Own ${foundItemList.potatoSeeds === undefined ? '`0`' : `\`${foundItemList.potatoSeeds}\``}`,
        `\u3000 Tomatoes: Own ${foundItemList.tomatoSeeds === undefined ? '`0`' : `\`${foundItemList.tomatoSeeds}\``}`
      ];
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Items**`,
        value: `**◎ Fish:**
				\u3000 Trout: Own ${
          foundItemList.trout === undefined ? '`0`' : `\`${foundItemList.trout}\` - <:coin:706659001164628008> \`${troutPrice.toLocaleString('en')}\``
        }
				\u3000 King Salmon: Own ${
          foundItemList.kingSalmon === undefined
            ? '`0`'
            : `\`${foundItemList.kingSalmon}\` - <:coin:706659001164628008> \`${salmonPrice.toLocaleString('en')}\``
        }
				\u3000 Swordfish: Own ${
          foundItemList.swordfish === undefined
            ? '`0`'
            : `\`${foundItemList.swordfish} \`- <:coin:706659001164628008> \`${swordFishPrice.toLocaleString('en')}\``
        }
				\u3000 Pufferfish: Own ${
          foundItemList.pufferfish === undefined
            ? '`0`'
            : `\`${foundItemList.pufferfish}\` - <:coin:706659001164628008> \`${pufferFishPrice.toLocaleString('en')}\``
        }
				\u200b
				${fields.join('\n')}
				\u200b
				**◎ Treasure:**
				\u3000 Treasure Chest: Own ${
          foundItemList.treasure === undefined
            ? '`0`'
            : `\`${foundItemList.treasure}\` - <:coin:706659001164628008> \`${treasurePrice.toLocaleString('en')}\``
        }
				\u3000 Gold Bar: Own ${
          foundItemList.goldBar === undefined
            ? '`0`'
            : `\`${foundItemList.goldBar}\` - <:coin:706659001164628008> \`${goldBarPrice.toLocaleString('en')}\``
        }
				\u3000 Gold Nugget: Own ${
          foundItemList.goldNugget === undefined
            ? '`0`'
            : `\`${foundItemList.goldNugget}\` - <:coin:706659001164628008> \`${goldNuggetPrice.toLocaleString('en')}\``
        }
				\u200b
				**◎ Permanent Items:**
				\u3000 ${
          !foundItemList.fishingRod
            ? `\`/shop buy rod\` - <:coin:706659001164628008> \`${fishingPrice.toLocaleString('en')}\``
            : 'Fishing Rod - `Owned`'
        }
				\u3000 Fish Bag - ${
          !foundBoostList.fishBag
            ? '`Not Owned` - Buy fishing rod to aquire'
            : `\`Owned\` - Current capacity: \`${Number(currentTotalFish)}\`/\`${foundBoostList.fishBag}\``
        }
				\u3000 ${
          !foundItemList.farmingTools
            ? `\`/shop buy tools\` - <:coin:706659001164628008> \`${farmingPrice.toLocaleString('en')}\``
            : 'Farming Tools - `Owned`'
        }
				\u3000 Seed Bag - ${
          !foundBoostList.seedBag
            ? '`Not Owned` - Buy farming tools to aquire'
            : `\`Owned\` - Current capacity: \`${Number(currentTotalSeeds)}\`/\`${foundBoostList.seedBag}\``
        }
				\u3000 Farm Bag - ${
          !foundBoostList.farmBag
            ? '`Not Owned` - Buy farming tools to aquire'
            : `\`Owned\` - Current capacity: \`${Number(currentTotalFarm)}\`/\`${foundBoostList.farmBag}\``
        }`
      });
    if (fullPrice > 0) {
      embed.setFooter({ text: `Total Value: ${fullPrice.toLocaleString('en')}` });
    }
    interaction.reply({ embeds: [embed] });
  }
};

export default SlashCommandF;
