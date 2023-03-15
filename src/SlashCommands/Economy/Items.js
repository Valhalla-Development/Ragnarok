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
    const balance = await Balance.findOne({ IdJoined: `${interaction.user.id}-${interaction.guild.id}` });

    if (!balance.Items) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Items**`, value: '**◎ Error:** You do not have any Items.' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    const fishingPrice = this.client.ecoPrices.fishingRod;
    const farmingPrice = this.client.ecoPrices.farmingTools;

    let foundItemList = JSON.parse(balance.Items);
    let foundBoostList = JSON.parse(balance.Boosts);
    let foundHarvestList = JSON.parse(balance.HarvestedCrops);

    if (!foundBoostList) {
      foundBoostList = {};
    }

    if (!foundItemList) {
      foundItemList = {};
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

    if (foundItemList.Trout) troutPrice = this.client.ecoPrices.trout * Number(foundItemList.Trout);
    if (foundItemList.KingSalmon) salmonPrice = this.client.ecoPrices.kingSalmon * Number(foundItemList.KingSalmon);
    if (foundItemList.SwordFish) swordFishPrice = this.client.ecoPrices.swordfish * Number(foundItemList.SwordFish);
    if (foundItemList.PufferFish) pufferFishPrice = this.client.ecoPrices.pufferfish * Number(foundItemList.PufferFish);
    if (foundItemList.Treasure) treasurePrice = this.client.ecoPrices.treasure * Number(foundItemList.Treasure);

    if (foundItemList.GoldBar) goldBarPrice = this.client.ecoPrices.goldBar * Number(foundItemList.GoldBar);

    foundHarvestList.forEach((obj) => {
      if (obj.cropType === 'corn') cornPrice += Math.floor(this.client.ecoPrices.corn * (1 - obj.decay.toFixed(4) / 100));
      if (obj.cropType === 'wheat') wheatPrice += Math.floor(this.client.ecoPrices.wheat * (1 - obj.decay.toFixed(4) / 100));
      if (obj.cropType === 'potato') potatoesPrice += Math.floor(this.client.ecoPrices.potatoes * (1 - obj.decay.toFixed(4) / 100));
      if (obj.cropType === 'tomato') tomatoesPrice += Math.floor(this.client.ecoPrices.tomatoes * (1 - obj.decay.toFixed(4) / 100));
    });

    if (foundItemList.GoldNugget) goldNuggetPrice = this.client.ecoPrices.goldNugget * Number(foundItemList.GoldNugget);
    if (foundItemList.Barley) barleyPrice = this.client.ecoPrices.barley * Number(foundItemList.Barley);
    if (foundItemList.Spinach) spinachPrice = this.client.ecoPrices.spinach * Number(foundItemList.Spinach);
    if (foundItemList.Sstrawberries) strawberriesPrice = this.client.ecoPrices.strawberries * Number(foundItemList.Sstrawberries);
    if (foundItemList.Lettuce) lettucePrice = this.client.ecoPrices.lettuce * Number(foundItemList.Lettuce);

    let fullPrice = 0;
    if (foundItemList.Trout) fullPrice += Number(foundItemList.Trout) * this.client.ecoPrices.trout;
    if (foundItemList.KingSalmon) fullPrice += Number(foundItemList.KingSalmon) * this.client.ecoPrices.kingSalmon;
    if (foundItemList.SwordFish) fullPrice += Number(foundItemList.SwordFish) * this.client.ecoPrices.swordfish;
    if (foundItemList.PufferFish) fullPrice += Number(foundItemList.PufferFish) * this.client.ecoPrices.pufferfish;
    if (foundItemList.Treasure) fullPrice += Number(foundItemList.Treasure) * this.client.ecoPrices.treasure;

    if (foundItemList.GoldBar) fullPrice += Number(foundItemList.GoldBar) * this.client.ecoPrices.goldBar;
    if (foundHarvestList) {
      fullPrice += Number(foundHarvestList.filter((key) => key.cropType === 'corn').length) * this.client.ecoPrices.corn;
      fullPrice += Number(foundHarvestList.filter((key) => key.cropType === 'wheat').length) * this.client.ecoPrices.wheat;
      fullPrice += Number(foundHarvestList.filter((key) => key.cropType === 'potato').length) * this.client.ecoPrices.potatoes;
      fullPrice += Number(foundHarvestList.filter((key) => key.cropType === 'tomato').length) * this.client.ecoPrices.tomatoes;
    }
    if (foundItemList.GoldNugget) fullPrice += Number(foundItemList.GoldNugget) * this.client.ecoPrices.goldNugget;
    if (foundItemList.Barley) fullPrice += Number(foundItemList.Barley) * this.client.ecoPrices.barley;
    if (foundItemList.Spinach) fullPrice += Number(foundItemList.Spinach) * this.client.ecoPrices.spinach;
    if (foundItemList.Sstrawberries) fullPrice += Number(foundItemList.Sstrawberries) * this.client.ecoPrices.strawberries;
    if (foundItemList.Lettuce) fullPrice += Number(foundItemList.Lettuce) * this.client.ecoPrices.lettuce;

    let currentTotalSeeds = 0;

    if (foundItemList.CornSeeds) {
      currentTotalSeeds += Number(foundItemList.CornSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }
    if (foundItemList.WheatSeeds) {
      currentTotalSeeds += Number(foundItemList.WheatSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }
    if (foundItemList.PotatoSeeds) {
      currentTotalSeeds += Number(foundItemList.PotatoSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }
    if (foundItemList.TomatoSeeds) {
      currentTotalSeeds += Number(foundItemList.TomatoSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }

    let currentTotalFish = 0;

    if (foundItemList.Trout) {
      currentTotalFish += Number(foundItemList.Trout);
    } else {
      currentTotalFish += Number(0);
    }
    if (foundItemList.KingSalmon) {
      currentTotalFish += Number(foundItemList.KingSalmon);
    } else {
      currentTotalFish += Number(0);
    }
    if (foundItemList.SwordFish) {
      currentTotalFish += Number(foundItemList.SwordFish);
    } else {
      currentTotalFish += Number(0);
    }
    if (foundItemList.PufferFish) {
      currentTotalFish += Number(foundItemList.PufferFish);
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

    if (!foundItemList.FarmingTools) {
      fields = [
        '**◎ Crops:**',
        `\u3000 Barley: Own ${
          foundItemList.Barley === undefined
            ? '`0`'
            : `\`${foundItemList.Barley}\` - <:coin:706659001164628008> \`${barleyPrice.toLocaleString('en')}\``
        }`,
        `\u3000 Spinach: Own ${
          foundItemList.Spinach === undefined
            ? '`0`'
            : `\`${foundItemList.Spinach}\` - <:coin:706659001164628008> \`${spinachPrice.toLocaleString('en')}\``
        }`,
        `\u3000 Strawberries: Own ${
          foundItemList.Sstrawberries === undefined
            ? '`0`'
            : `\`${foundItemList.Sstrawberries} \`- <:coin:706659001164628008> \`${strawberriesPrice.toLocaleString('en')}\``
        }`,
        `\u3000 Lettuce: Own ${
          foundItemList.Lettuce === undefined
            ? '`0`'
            : `\`${foundItemList.Lettuce}\` - <:coin:706659001164628008> \`${lettucePrice.toLocaleString('en')}\``
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
        `\u3000 Corn: Own ${foundItemList.CornSeeds === undefined ? '`0`' : `\`${foundItemList.CornSeeds}\``}`,
        `\u3000 Wheat: Own ${foundItemList.WheatSeeds === undefined ? '`0`' : `\`${foundItemList.WheatSeeds}\``}`,
        `\u3000 Potatoes: Own ${foundItemList.PotatoSeeds === undefined ? '`0`' : `\`${foundItemList.PotatoSeeds}\``}`,
        `\u3000 Tomatoes: Own ${foundItemList.TomatoSeeds === undefined ? '`0`' : `\`${foundItemList.TomatoSeeds}\``}`
      ];
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Items**`,
        value: `**◎ Fish:**
				\u3000 Trout: Own ${
          foundItemList.Trout === undefined ? '`0`' : `\`${foundItemList.Trout}\` - <:coin:706659001164628008> \`${troutPrice.toLocaleString('en')}\``
        }
				\u3000 King Salmon: Own ${
          foundItemList.KingSalmon === undefined
            ? '`0`'
            : `\`${foundItemList.KingSalmon}\` - <:coin:706659001164628008> \`${salmonPrice.toLocaleString('en')}\``
        }
				\u3000 Swordfish: Own ${
          foundItemList.SwordFish === undefined
            ? '`0`'
            : `\`${foundItemList.SwordFish} \`- <:coin:706659001164628008> \`${swordFishPrice.toLocaleString('en')}\``
        }
				\u3000 Pufferfish: Own ${
          foundItemList.PufferFish === undefined
            ? '`0`'
            : `\`${foundItemList.PufferFish}\` - <:coin:706659001164628008> \`${pufferFishPrice.toLocaleString('en')}\``
        }
				\u200b
				${fields.join('\n')}
				\u200b
				**◎ Treasure:**
				\u3000 Treasure Chest: Own ${
          foundItemList.Treasure === undefined
            ? '`0`'
            : `\`${foundItemList.Treasure}\` - <:coin:706659001164628008> \`${treasurePrice.toLocaleString('en')}\``
        }
				\u3000 Gold Bar: Own ${
          foundItemList.GoldBar === undefined
            ? '`0`'
            : `\`${foundItemList.GoldBar}\` - <:coin:706659001164628008> \`${goldBarPrice.toLocaleString('en')}\``
        }
				\u3000 Gold Nugget: Own ${
          foundItemList.GoldNugget === undefined
            ? '`0`'
            : `\`${foundItemList.GoldNugget}\` - <:coin:706659001164628008> \`${goldNuggetPrice.toLocaleString('en')}\``
        }
				\u200b
				**◎ Permanent Items:**
				\u3000 ${
          !foundItemList.FishingRod
            ? `\`/shop buy rod\` - <:coin:706659001164628008> \`${fishingPrice.toLocaleString('en')}\``
            : 'Fishing Rod - `Owned`'
        }
				\u3000 Fish Bag - ${
          !foundBoostList.fishBag
            ? '`Not Owned` - Buy fishing rod to aquire'
            : `\`Owned\` - Current capacity: \`${Number(currentTotalFish)}\`/\`${foundBoostList.fishBag}\``
        }
				\u3000 ${
          !foundItemList.FarmingTools
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
