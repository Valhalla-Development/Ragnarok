import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';
import Balance from '../../Mongo/Schemas/Balance.js';

const data = new SlashCommandBuilder()
  .setName('shop')
  .setDescription('Purchase/sell Items')
  .addStringOption((option) => option.setName('option').setDescription('Select a user').setRequired(true).setAutocomplete(true))
  .addStringOption((option) => option.setName('item').setDescription('Item to buy/sell/upgrade'));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Purchase/sell Items',
      category: 'Economy',
      options: data
    });
  }

  async autoComplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = ['buy', 'sell', 'upgrade'];
    const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
    await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
  }

  async run(interaction) {
    const argsChoice = interaction.options.getString('option');
    const argsItem = interaction.options.getString('item');

    const balance = await Balance.findOne({ IdJoined: `${interaction.user.id}-${interaction.guild.id}` });

    const fishingPrice = this.client.ecoPrices.fishingRod;
    const farmingPrice = this.client.ecoPrices.farmingTools;
    const cornSeedPrice = this.client.ecoPrices.cornSeed;
    const wheatSeedPrice = this.client.ecoPrices.wheatSeed;
    const potatoeSeedPrice = this.client.ecoPrices.potatoSeed;
    const tomatoeSeedprice = this.client.ecoPrices.tomatoSeed;
    const initalSeedBag = this.client.ecoPrices.seedBagFirst;
    const seedBagMax = this.client.ecoPrices.seedBagLimit;
    const initialFishBag = this.client.ecoPrices.fishBagFirst;
    const fishBagMax = this.client.ecoPrices.fishBagLimit;
    const initalFarmBag = this.client.ecoPrices.farmBagFirst;
    const farmBagMax = this.client.ecoPrices.farmBagLimit;
    const initialFarmPlot = this.client.ecoPrices.farmPlotFirst;
    const farmPlotMax = this.client.ecoPrices.farmPlotLimit;

    const { seedBagPrice } = this.client.ecoPrices;
    const { farmBagPrice } = this.client.ecoPrices;
    const { fishBagPrice } = this.client.ecoPrices;
    const { farmPlotPrice } = this.client.ecoPrices;

    let foundPlotList;
    let foundHarvestList;

    if (balance.FarmPlot.length) {
      foundPlotList = JSON.parse(balance.FarmPlot);
    } else {
      foundPlotList = [];
    }

    if (balance.HarvestedCrops.length) {
      foundHarvestList = JSON.parse(balance.HarvestedCrops);
    } else {
      foundHarvestList = [];
    }

    const troutPrice = this.client.ecoPrices.trout * Number(balance.Items.Trout);
    const salmonPrice = this.client.ecoPrices.kingSalmon * Number(balance.Items.KingSalmon);
    const swordFishPrice = this.client.ecoPrices.swordfish * Number(balance.Items.SwordFish);
    const pufferFishPrice = this.client.ecoPrices.pufferfish * Number(balance.Items.PufferFish);
    const treasurePrice = this.client.ecoPrices.treasure * Number(balance.Items.Treasure);

    const goldBarPrice = this.client.ecoPrices.goldBar * Number(balance.Items.GoldBar);
    let cornPrice = 0;
    let wheatPrice = 0;
    let potatoesPrice = 0;
    let tomatoesPrice = 0;
    const goldNuggetPrice = this.client.ecoPrices.goldNugget * Number(balance.Items.GoldNugget);
    const barleyPrice = this.client.ecoPrices.barley * Number(balance.Items.Barley);
    const spinachPrice = this.client.ecoPrices.spinach * Number(balance.Items.Spinach);
    const strawberriesPrice = this.client.ecoPrices.strawberries * Number(balance.Items.Strawberries);
    const lettucePrice = this.client.ecoPrices.lettuce * Number(balance.Items.Lettuce);
    
    if (foundHarvestList) {
      foundHarvestList.forEach((obj) => {
        if (obj.CropType === 'corn') cornPrice += Math.floor(this.client.ecoPrices.corn * (1 - obj.Decay.toFixed(4) / 100));
        if (obj.CropType === 'wheat') wheatPrice += Math.floor(this.client.ecoPrices.wheat * (1 - obj.Decay.toFixed(4) / 100));
        if (obj.CropType === 'potato') potatoesPrice += Math.floor(this.client.ecoPrices.potatoes * (1 - obj.Decay.toFixed(4) / 100));
        if (obj.CropType === 'tomato') tomatoesPrice += Math.floor(this.client.ecoPrices.tomatoes * (1 - obj.Decay.toFixed(4) / 100));
      });
    }

    let currentTotalSeeds = 0;

    if (balance.Items.CornSeeds) {
      currentTotalSeeds += Number(balance.Items.CornSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }
    if (balance.Items.WheatSeeds) {
      currentTotalSeeds += Number(balance.Items.WheatSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }
    if (balance.Items.PotatoSeeds) {
      currentTotalSeeds += Number(balance.Items.PotatoSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }
    if (balance.Items.TomatoSeeds) {
      currentTotalSeeds += Number(balance.Items.TomatoSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }

    let currentTotalFish = 0;

    if (balance.Items.Trout) {
      currentTotalFish += Number(balance.Items.Trout);
    } else {
      currentTotalFish += Number(0);
    }
    if (balance.Items.KingSalmon) {
      currentTotalFish += Number(balance.Items.KingSalmon);
    } else {
      currentTotalFish += Number(0);
    }
    if (balance.Items.SwordFish) {
      currentTotalFish += Number(balance.Items.SwordFish);
    } else {
      currentTotalFish += Number(0);
    }
    if (balance.Items.PufferFish) {
      currentTotalFish += Number(balance.Items.PufferFish);
    } else {
      currentTotalFish += Number(0);
    }

    let currentTotalFarm = 0;

    if (foundHarvestList) {
      currentTotalFarm += Number(foundHarvestList.filter((key) => key.CropType === 'corn').length);
      currentTotalFarm += Number(foundHarvestList.filter((key) => key.CropType === 'wheat').length);
      currentTotalFarm += Number(foundHarvestList.filter((key) => key.CropType === 'potato').length);
      currentTotalFarm += Number(foundHarvestList.filter((key) => key.CropType === 'tomato').length);
    }

    let currentTotalPlot = 0;

    if (balance.Boosts.FarmPlot) {
      currentTotalPlot += Number(foundPlotList.length);
    } else {
      currentTotalPlot += Number(0);
    }

    if (argsChoice === 'upgrade') {
      if (!argsItem) {
        const arr = [];
        if (balance.Boosts.SeedBag) {
          if (Number(balance.Boosts.SeedBag) < Number(seedBagMax)) {
            const upgradeSeedBag = balance.Boosts.SeedBag * seedBagPrice;
            arr.push(
              `\u3000 \`/shop upgrade seedbag\` - <:coin:706659001164628008> \`${upgradeSeedBag.toLocaleString(
                'en'
              )}\` Upgrade by 15, current capacity: \`${Number(currentTotalSeeds).toLocaleString('en')}\`/\`${Number(
                balance.Boosts.SeedBag
              ).toLocaleString('en')}\``
            );
          }
        }

        if (balance.Boosts.FishBag) {
          if (Number(balance.Boosts.FishBag) < Number(fishBagMax)) {
            const upgradeFishBag = balance.Boosts.FishBag * fishBagPrice;
            arr.push(
              `\u3000 \`/shop upgrade fishbag\` - <:coin:706659001164628008> \`${upgradeFishBag.toLocaleString(
                'en'
              )}\` Upgrade by 15, current capacity: \`${Number(currentTotalFish).toLocaleString('en')}\`/\`${Number(
                balance.Boosts.FishBag
              ).toLocaleString('en')}\``
            );
          }
        }

        if (balance.Boosts.FarmBag) {
          if (Number(balance.Boosts.FarmBag) < Number(farmBagMax)) {
            const upgradeFarmBag = balance.Boosts.FarmBag * farmBagPrice;
            arr.push(
              `\u3000 \`/shop upgrade farmbag\` - <:coin:706659001164628008> \`${upgradeFarmBag.toLocaleString(
                'en'
              )}\` Upgrade by 15, current capacity: \`${Number(currentTotalFarm).toLocaleString('en')}\`/\`${Number(
                balance.Boosts.FarmBag
              ).toLocaleString('en')}\``
            );
          }
        }

        if (balance.Boosts.FarmPlot) {
          if (Number(balance.Boosts.FarmPlot) < Number(farmPlotMax)) {
            const upgradeFarmPlot = balance.Boosts.FarmPlot * farmPlotPrice;
            arr.push(
              `\u3000 \`/shop upgrade plot\` - <:coin:706659001164628008> \`${upgradeFarmPlot.toLocaleString(
                'en'
              )}\` Upgrade by 15, current capacity: \`${Number(currentTotalPlot).toLocaleString('en')}\`/\`${Number(
                balance.Boosts.FarmPlot
              ).toLocaleString('en')}\``
            );
          }
        }

        if (!arr.length) arr.push('\u3000 `None`');

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Shop - Upgrade**`,
            value: `**◎ Available Upgrades**
						${arr.join('\n')}`
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (argsItem === 'seedbag') {
        if (!balance.Boosts.SeedBag) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Seed Bag**`,
              value: '**◎ Error:** You do not own a seed bag! You will be awarded one once you purchase farming tools.'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (Number(balance.Boosts.SeedBag) >= Number(seedBagMax)) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Seed Bag**`,
              value: '**◎ Error:** You have already upgraded your seed bag to the maximum level!'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (balance.Bank < balance.Boosts.SeedBag * seedBagPrice * 3) {
          const notEnough = balance.Boosts.SeedBag * seedBagPrice * 3 - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Seed Bag**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - balance.Boosts.SeedBag * seedBagPrice * 3;
        balance.Total = Number(balance.Total) - balance.Boosts.SeedBag * seedBagPrice * 3;

        const calc = Number(balance.Boosts.SeedBag) + Number(15);
        balance.Boosts.SeedBag = calc

        await balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://SeedBag.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Seed Bag**`,
            value: `**◎ Success:** You have upgraded your seed bag for <:coin:706659001164628008> \`${
              balance.Boosts.SeedBag * seedBagPrice * 3
            }\`, your new limit is \`${Number(balance.Boosts.SeedBag)}\`!`
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/SeedBag.png'] });
        return;
      }

      if (argsItem === 'fishbag') {
        if (!balance.Boosts.FishBag) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Fish Bag**`,
              value: '**◎ Error:** You do not own a fish bag! You will be awarded one once you purchase a fishing rod.'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (Number(balance.Boosts.FishBag) >= Number(fishBagMax)) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Fish Bag**`,
              value: '**◎ Error:** You have already upgraded your fish bag to the maximum level!'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (balance.Bank < balance.Boosts.FishBag * fishBagPrice * 3) {
          const notEnough = balance.Boosts.FishBag * fishBagPrice * 3 - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Fish Bag**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - balance.Boosts.FishBag * fishBagPrice * 3;
        balance.Total = Number(balance.Total) - balance.Boosts.FishBag * fishBagPrice * 3;

        const calc = Number(balance.Boosts.FishBag) + Number(15);
        balance.Boosts.FishBag = calc

        await balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://FishBag.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Fish Bag**`,
            value: `**◎ Success:** You have upgraded your fish bag <:coin:706659001164628008> \`${
              balance.Boosts.FishBag * fishBagPrice * 3
            }\`, your new limit is \`${Number(balance.Boosts.FishBag)}\`!`
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/FishBag.png'] });
        return;
      }

      if (argsItem === 'farmbag') {
        if (!balance.Boosts.FarmBag) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Farm Bag**`,
              value: '**◎ Error:** You do not own a farm bag! You will be awarded one once you purchase farming tools.'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (Number(balance.Boosts.FarmBag) >= Number(farmBagMax)) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Farm Bag**`,
              value: '**◎ Error:** You have already upgraded your farm bag to the maximum level!'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (balance.Bank < balance.Boosts.FarmBag * farmBagPrice * 3) {
          const notEnough = balance.Boosts.FarmBag * farmBagPrice * 3 - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Farm Bag**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - balance.Boosts.FarmBag * farmBagPrice * 3;
        balance.Total = Number(balance.Total) - balance.Boosts.FarmBag * farmBagPrice * 3;

        const calc = Number(balance.Boosts.FarmBag) + Number(15);
        balance.Boosts.FarmBag = calc

        await balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://FarmBag.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Farm Bag**`,
            value: `**◎ Success:** You have upgraded your farm bag <:coin:706659001164628008> \`${
              balance.Boosts.FarmBag * farmBagPrice * 3
            }\`, your new limit is \`${Number(balance.Boosts.FarmBag)}\`!`
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/FarmBag.png'] });
        return;
      }

      if (argsItem === 'plot') {
        if (!balance.Boosts.FarmPlot) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Farm Plot**`,
              value: '**◎ Error:** You do not own a farm plot! You will be awarded one once you purchase farming tools.'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (Number(balance.Boosts.FarmPlot) >= Number(farmPlotMax)) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Farm Plot**`,
              value: '**◎ Error:** You have already upgraded your farm plot to the maximum level!'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (balance.Bank < balance.Boosts.FarmPlot * farmPlotPrice * 3) {
          const notEnough = balance.Boosts.FarmPlot * farmPlotPrice * 3 - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Farm Plot**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - balance.Boosts.FarmPlot * farmPlotPrice * 3;
        balance.Total = Number(balance.Total) - balance.Boosts.FarmPlot * farmPlotPrice * 3;

        const calc = Number(balance.Boosts.FarmPlot) + Number(15);
        balance.Boosts.FarmPlot = calc

        await balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://FarmPlot.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Farm Plot**`,
            value: `**◎ Success:** You have upgraded your farm plot <:coin:706659001164628008> \`${
              balance.Boosts.FarmPlot * farmPlotPrice * 3
            }\`, your new limit is \`${Number(balance.Boosts.FarmPlot)}\`!`
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/FarmPlot.png'] });
        return;
      }
    }

    if (argsChoice === 'buy') {
      if (!argsItem) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Shop - Buy**`,
            value: `**◎ Farming Seeds: (Amount optional)**
						\u3000 \`/shop buy corn\` - 10 Seeds per pack - ${
              !balance.Items.CornSeeds
                ? `<:coin:706659001164628008> \`${cornSeedPrice.toLocaleString('en')}\``
                : `<:coin:706659001164628008> \`${cornSeedPrice.toLocaleString('en')}\` - \`Owned ${balance.Items.CornSeeds.toLocaleString('en')}\``
            }
						\u3000 \`/shop buy wheat\` - 10 Seeds per pack - ${
              !balance.Items.WheatSeeds
                ? `<:coin:706659001164628008> \`${wheatSeedPrice.toLocaleString('en')}\``
                : `<:coin:706659001164628008> \`${wheatSeedPrice.toLocaleString('en')}\`- \`Owned ${balance.Items.WheatSeeds.toLocaleString('en')}\``
            }
						\u3000 \`/shop buy potato\` - 10 Seeds per pack - ${
              !balance.Items.PotatoSeeds
                ? `<:coin:706659001164628008> \`${potatoeSeedPrice.toLocaleString('en')}\``
                : `<:coin:706659001164628008> \`${potatoeSeedPrice.toLocaleString('en')}\`- \`Owned ${balance.Items.PotatoSeeds.toLocaleString(
                    'en'
                  )}\``
            }
						\u3000 \`/shop buy tomato\` - 10 Seeds per pack - ${
              !balance.Items.TomatoSeeds
                ? `<:coin:706659001164628008> \`${tomatoeSeedprice.toLocaleString('en')}\``
                : `<:coin:706659001164628008> \`${tomatoeSeedprice.toLocaleString('en')}\`- \`Owned ${balance.Items.TomatoSeeds.toLocaleString(
                    'en'
                  )}\``
            }
						\u200b
						**◎ Permanent Items:**
						\u3000 ${
              !balance.Items.FishingRod
                ? `\`/shop buy rod\` - <:coin:706659001164628008> \`${fishingPrice.toLocaleString('en')}\``
                : 'Fishing Rod - `Owned`'
            }
						\u3000 Fish Bag - ${
              !balance.Boosts.FishBag
                ? '`Not Owned` - Buy fishing rod to aquire'
                : `\`Owned\` - Current capacity: \`${Number(currentTotalFish)}\`/\`${balance.Boosts.FishBag}\``
            }
						\u3000 ${
              !balance.Items.FarmingTools
                ? `\`/shop buy tools\` - <:coin:706659001164628008> \`${farmingPrice.toLocaleString('en')}\``
                : 'Farming Tools - `Owned`'
            }
						\u3000 Seed Bag - ${
              !balance.Boosts.SeedBag
                ? '`Not Owned` - Buy farming tools to aquire'
                : `\`Owned\` - Current capacity: \`${Number(currentTotalSeeds)}\`/\`${balance.Boosts.SeedBag}\``
            }
						\u3000 Farm Bag - ${
              !balance.Boosts.FarmBag
                ? '`Not Owned` - Buy farming tools to aquire'
                : `\`Owned\` - Current capacity: \`${Number(currentTotalFarm)}\`/\`${balance.Boosts.FarmBag}\``
            }
						\u3000 Farm Plot - ${
              !balance.Boosts.FarmPlot
                ? '`Not Owned` - Buy farming tools to aquire'
                : `\`Owned\` - Current capacity: \`${Number(currentTotalPlot)}\`/\`${balance.Boosts.FarmPlot}\``
            }`
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (argsItem === 'corn' || argsItem === 'wheat' || argsItem === 'potato' || argsItem === 'tomato') {
        if (!balance.Items.FarmingTools) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Seeds**`,
              value: '**◎ Error:** You must own farming tools before you can buy seeds!\nYou can buy them with `/shop buy tools`'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }
      }

      if (argsItem === 'corn') {
        let cornTot = 0;
        cornTot += Number(cornSeedPrice) * Number(1);

        if (balance.Bank < cornTot) {
          const notEnough = Number(cornTot) - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Corn Seeds**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - Number(cornTot);
        balance.Total = Number(balance.Total) - Number(cornTot);
        await balance.save();

        let calc;
        if (balance.Items.CornSeeds) {
          calc = Number(balance.Items.CornSeeds) + Number(1) * 10;
        } else {
          calc = Number(1) * 10;
        }

        if (Number(currentTotalSeeds) + Number(1) * 10 > Number(balance.Boosts.SeedBag)) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Backpack Limit**`,
              value: `**◎ Error:** You do not have enough space in your seed backpack! You backpack is currently at \`${currentTotalSeeds}\`/\`${balance.Boosts.SeedBag}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Items.CornSeeds = Number(calc)

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://CornSeeds.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Corn Seeds**`,
            value: `**◎ Success:** You have bought a pack of Corn Seeds.\nYou now have \`${calc}\` total Corn seeds.\n\nYour current backpack capacity is at \`${
              Number(currentTotalSeeds) + Number(1) * 10
            }\`/\`${balance.Boosts.SeedBag}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/CornSeeds.png'] });

        await balance.save();
        return;
      }

      if (argsItem === 'wheat') {
        let wheatTot = 0;
        wheatTot += Number(wheatSeedPrice) * Number(1);

        if (balance.Bank < wheatTot) {
          const notEnough = Number(wheatTot) - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Wheat Seeds**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - Number(wheatTot);
        balance.Total = Number(balance.Total) - Number(wheatTot);
        await balance.save();

        let calc;
        if (balance.Items.WheatSeeds) {
          calc = Number(balance.Items.WheatSeeds) + Number(1) * 10;
        } else {
          calc = Number(1) * 10;
        }

        if (Number(currentTotalSeeds) + Number(1) * 10 > Number(balance.Boosts.SeedBag)) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Backpack Limit**`,
              value: `**◎ Error:** You do not have enough space in your seed backpack! You backpack is currently at \`${currentTotalSeeds}\`/\`${balance.Boosts.SeedBag}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Items.WheatSeeds = Number(calc)

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://WheatSeeds.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Wheat Seeds**`,
            value: `**◎ Success:** You have bought a pack of Wheat Seeds.\nYou now have \`${calc}\` total Wheat seeds.\n\nYour current backpack capacity is at \`${
              Number(currentTotalSeeds) + Number(1) * 10
            }\`/\`${balance.Boosts.SeedBag}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/WheatSeeds.png'] });

        await balance.save();
        return;
      }

      if (argsItem === 'potato') {
        let potatoeTot = 0;
        potatoeTot += Number(potatoeSeedPrice) * Number(1);

        if (balance.Bank < potatoeTot) {
          const notEnough = Number(potatoeTot) - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Potato Seeds**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - Number(potatoeTot);
        balance.Total = Number(balance.Total) - Number(potatoeTot);
        await balance.save();

        let calc;
        if (balance.Items.PotatoSeeds) {
          calc = Number(balance.Items.PotatoSeeds) + Number(1) * 10;
        } else {
          calc = Number(1) * 10;
        }

        if (Number(currentTotalSeeds) + Number(1) * 10 > Number(balance.Boosts.SeedBag)) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Backpack Limit**`,
              value: `**◎ Error:** You do not have enough space in your seed backpack! You backpack is currently at \`${currentTotalSeeds}\`/\`${balance.Boosts.SeedBag}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Items.PotatoSeeds = Number(calc)

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://Potatoe.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Potato Seeds**`,
            value: `**◎ Success:** You have bought a pack of Potato Seeds.\nYou now have \`${calc}\` total Potato seeds.\n\nYour current backpack capacity is at \`${
              Number(currentTotalSeeds) + Number(1) * 10
            }\`/\`${balance.Boosts.SeedBag}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/Potatoe.png'] });

        await balance.save();
        return;
      }

      if (argsItem === 'tomato') {
        let tomatoeTot = 0;
        tomatoeTot += Number(tomatoeSeedprice) * Number(1);

        if (balance.Bank < tomatoeTot) {
          const notEnough = Number(tomatoeTot) - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Tomato Seeds**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - Number(tomatoeTot);
        balance.Total = Number(balance.Total) - Number(tomatoeTot);
        await balance.save();

        let calc;
        if (balance.Items.TomatoSeeds) {
          calc = Number(balance.Items.TomatoSeeds) + Number(1) * 10;
        } else {
          calc = Number(1) * 10;
        }

        if (Number(currentTotalSeeds) + Number(1) * 10 > Number(balance.Boosts.SeedBag)) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Backpack Limit**`,
              value: `**◎ Error:** You do not have enough space in your seed backpack! You backpack is currently at \`${currentTotalSeeds}\`/\`${balance.Boosts.SeedBag}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Items.TomatoSeeds = Number(calc)

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://Tomatoes.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Tomato Seeds**`,
            value: `**◎ Success:** You have bought a pack of Tomato Seeds.\nYou now have \`${calc}\` total Tomato seeds.\n\nYour current backpack capacity is at \`${
              Number(currentTotalSeeds) + Number(1) * 10
            }\`/\`${balance.Boosts.SeedBag}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/Tomatoes.png'] });

        await balance.save();
        return;
      }

      if (argsItem === 'rod') {
        if (balance.Items.FishingRod) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Shop - Fishing Rod**`, value: '**◎ Error:** You already own a fishing rod!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (balance.Bank < fishingPrice) {
          const notEnough = Number(fishingPrice) - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Fishing Rod**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - Number(fishingPrice);
        balance.Total = Number(balance.Total) - Number(fishingPrice);
        await balance.save();

        balance.Items.FishingRod = Number(1)
        balance.Boosts.FishBag = Number(initalSeedBag)

        await balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://FishingRod.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Fishing Rod**`,
            value: `**◎ Success:** You have bought a fishing rod!\nYou have also been awarded a starter Fish bag, it's capacity is \`${initialFishBag}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/FishingRod.png'] });
        return;
      }

      if (argsItem === 'tools') {
        if (balance.Items.FarmingTools) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Shop - Farming Tools**`, value: '**◎ Error:** You already own Farming Tools!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (balance.Bank < farmingPrice) {
          const notEnough = Number(farmingPrice) - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Farming Tools**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (balance.FarmCool) {
          balance.FarmCool = null;
          await balance.save();
        }

        let fullPrice = 0;

        if (balance.Items.Barley) fullPrice += Number(balance.Items.Barley) * this.client.ecoPrices.barley;
        if (balance.Items.Spinach) fullPrice += Number(balance.Items.Spinach) * this.client.ecoPrices.spinach;
        if (balance.Items.Strawberries) fullPrice += Number(balance.Items.Strawberries) * this.client.ecoPrices.strawberries;
        if (balance.Items.Lettuce) fullPrice += Number(balance.Items.Lettuce) * this.client.ecoPrices.lettuce;

        balance.Bank = Number(balance.Bank) - Number(farmingPrice) + fullPrice;
        balance.Total = Number(balance.Total) - Number(farmingPrice) + fullPrice;
        await balance.save();

        balance.Items.FarmingTools = Number(1)
        balance.Boosts.FarmBag = Number(initalFarmBag)
        balance.Boosts.SeedBag = Number(initalSeedBag)
        balance.Boosts.FarmPlot = Number(initialFarmPlot)

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://FarmingTool.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Farming Tools**`,
            value: `**◎ Success:** You have bought Farming Tools${
              balance.Items.Barley || balance.Items.Spinach || balance.Items.Strawberries || balance.Items.Lettuce
                ? `.\nYou had some old crops, I have sold them for you and credited <:coin:706659001164628008> \`${fullPrice.toLocaleString(
                    'en'
                  )}\` to your account.`
                : '!'
            }\n\nYou have also been awarded a starter Farm bag, Plot and Seed bag\nFarm capacity: \`${initalFarmBag}\` Seed capacity: \`${initalSeedBag}\` Plot Capacity: \`${initialFarmPlot}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/FarmingTool.png'] });

        if (balance.Items.Barley) delete balance.Items.Barley;
        if (balance.Items.Spinach) delete balance.Items.Spinach;
        if (balance.Items.Strawberries) delete balance.Items.Strawberries;
        if (balance.Items.Lettuce) delete balance.Items.Lettuce;

        await balance.save();
        return;
      }
    }

    if (argsChoice === 'sell') {
      if (!argsItem) {
        let fields;

        if (!balance.Items.FarmingTools) {
          fields = [
            `\u3000 Barley: Own ${
              balance.Items.Barley === undefined
                ? '`0`'
                : `\`${balance.Items.Barley}\` - <:coin:706659001164628008> \`${barleyPrice.toLocaleString('en')}\``
            }`,
            `\u3000 Spinach: Own ${
              balance.Items.Spinach === undefined
                ? '`0`'
                : `\`${balance.Items.Spinach}\` - <:coin:706659001164628008> \`${spinachPrice.toLocaleString('en')}\``
            }`,
            `\u3000 Strawberries: Own ${
              balance.Items.Strawberries === undefined
                ? '`0`'
                : `\`${balance.Items.Strawberries} \`- <:coin:706659001164628008> \`${strawberriesPrice.toLocaleString('en')}\``
            }`,
            `\u3000 Lettuce: Own ${
              balance.Items.Lettuce === undefined
                ? '`0`'
                : `\`${balance.Items.Lettuce}\` - <:coin:706659001164628008> \`${lettucePrice.toLocaleString('en')}\``
            }`
          ];
        } else {
          fields = [
            `\u3000 Corn: Own ${
              !foundHarvestList.filter((key) => key.CropType === 'corn').length
                ? '`0`'
                : `\`${foundHarvestList.filter((key) => key.CropType === 'corn').length}\` - <:coin:706659001164628008> \`${cornPrice.toLocaleString(
                    'en'
                  )}\``
            }`,
            `\u3000 Wheat: Own ${
              !foundHarvestList.filter((key) => key.CropType === 'wheat').length
                ? '`0`'
                : `\`${
                    foundHarvestList.filter((key) => key.CropType === 'wheat').length
                  }\` - <:coin:706659001164628008> \`${wheatPrice.toLocaleString('en')}\``
            }`,
            `\u3000 Potatoes: Own ${
              !foundHarvestList.filter((key) => key.CropType === 'potato').length
                ? '`0`'
                : `\`${
                    foundHarvestList.filter((key) => key.CropType === 'potato').length
                  }\` - <:coin:706659001164628008> \`${potatoesPrice.toLocaleString('en')}\``
            }`,
            `\u3000 Tomatoes: Own ${
              !foundHarvestList.filter((key) => key.CropType === 'tomato').length
                ? '`0`'
                : `\`${
                    foundHarvestList.filter((key) => key.CropType === 'tomato').length
                  }\` - <:coin:706659001164628008> \`${tomatoesPrice.toLocaleString('en')}\``
            }`
          ];

          if (balance.Items.Barley || balance.Items.Spinach || balance.Items.Strawberries || balance.Items.Lettuce) {
            const lowCrops = [
              `\u3000 Barley: Own ${
                balance.Items.Barley === undefined
                  ? '`0`'
                  : `\`${balance.Items.Barley}\` - <:coin:706659001164628008> \`${barleyPrice.toLocaleString('en')}\``
              }`,
              `\u3000 Spinach: Own ${
                balance.Items.Spinach === undefined
                  ? '`0`'
                  : `\`${balance.Items.Spinach}\` - <:coin:706659001164628008> \`${spinachPrice.toLocaleString('en')}\``
              }`,
              `\u3000 Strawberries: Own ${
                balance.Items.Strawberries === undefined
                  ? '`0`'
                  : `\`${balance.Items.Strawberries} \`- <:coin:706659001164628008> \`${strawberriesPrice.toLocaleString('en')}\``
              }`,
              `\u3000 Lettuce: Own ${
                balance.Items.Lettuce === undefined
                  ? '`0`'
                  : `\`${balance.Items.Lettuce}\` - <:coin:706659001164628008> \`${lettucePrice.toLocaleString('en')}\``
              }`
            ];
            fields.push(lowCrops.join('\n'));
          }
        }

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Items**`,
            value: `**◎ Fish:**
						\u3000 Trout: Own ${
              balance.Items.Trout === undefined
                ? '`0`'
                : `\`${balance.Items.Trout}\` - <:coin:706659001164628008> \`${troutPrice.toLocaleString('en')}\``
            }
						\u3000 King Salmon: Own ${
              balance.Items.KingSalmon === undefined
                ? '`0`'
                : `\`${balance.Items.KingSalmon}\` - <:coin:706659001164628008> \`${salmonPrice.toLocaleString('en')}\``
            }
						\u3000 Swordfish: Own ${
              balance.Items.SwordFish === undefined
                ? '`0`'
                : `\`${balance.Items.SwordFish} \`- <:coin:706659001164628008> \`${swordFishPrice.toLocaleString('en')}\``
            }
						\u3000 Pufferfish: Own ${
              balance.Items.PufferFish === undefined
                ? '`0`'
                : `\`${balance.Items.PufferFish}\` - <:coin:706659001164628008> \`${pufferFishPrice.toLocaleString('en')}\``
            }
						\u200b
						**◎ Crops:**
						${fields.join('\n')}
						\u200b
						**◎ Treasure:**
						\u3000 Treasure Chest: Own ${
              balance.Items.Treasure === undefined
                ? '`0`'
                : `${balance.Items.Treasure} - <:coin:706659001164628008> \`${treasurePrice.toLocaleString('en')}\``
            }
						\u3000 Gold Bar: Own ${
              balance.Items.GoldBar === undefined
                ? '`0`'
                : `\`${balance.Items.GoldBar}\` - <:coin:706659001164628008> \`${goldBarPrice.toLocaleString('en')}\``
            }
						\u3000 Gold Nugget: Own ${
              balance.Items.GoldNugget === undefined
                ? '`0`'
                : `\`${balance.Items.GoldNugget}\` - <:coin:706659001164628008> \`${goldNuggetPrice.toLocaleString('en')}\``
            }
						\u200b
						**◎ Available Commands:**
						\u3000 \`/shop sell all\`
						\u3000 \`/shop sell fish\`
						\u3000 \`/shop sell farm\`
						\u3000 \`/shop sell treasure\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (argsItem === 'all') {
        if (
          !balance.Items.Lettuce &&
          !balance.Items.Strawberries &&
          !balance.Items.Spinach &&
          !balance.Items.Barley &&
          !foundHarvestList.filter((key) => key.CropType === 'tomato').length &&
          !foundHarvestList.filter((key) => key.CropType === 'potato').length &&
          !foundHarvestList.filter((key) => key.CropType === 'wheat').length &&
          !foundHarvestList.filter((key) => key.CropType === 'corn').length &&
          !balance.Items.Trout &&
          !balance.Items.KingSalmon &&
          !balance.Items.SwordFish &&
          !balance.Items.PufferFish &&
          !balance.Items.Treasure &&
          !balance.Items.GoldBar &&
          !balance.Items.GoldNugget
        ) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Shop - Sell All**`, value: '**◎ Error:** You do not have anything to sell!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        let fullPrice = 0;
        let itemCount = 0;

        if (balance.Items.Lettuce) fullPrice += Number(balance.Items.Lettuce) * this.client.ecoPrices.lettuce;
        if (balance.Items.Strawberries) fullPrice += Number(balance.Items.Strawberries) * this.client.ecoPrices.strawberries;
        if (balance.Items.Spinach) fullPrice += Number(balance.Items.Spinach) * this.client.ecoPrices.spinach;
        if (balance.Items.Barley) fullPrice += Number(balance.Items.Barley) * this.client.ecoPrices.barley;

        foundHarvestList.forEach((obj) => {
          if (obj.CropType === 'corn') fullPrice += Math.floor(this.client.ecoPrices.corn * (1 - obj.Decay.toFixed(4) / 100));
          if (obj.CropType === 'wheat') fullPrice += Math.floor(this.client.ecoPrices.wheat * (1 - obj.Decay.toFixed(4) / 100));
          if (obj.CropType === 'potato') fullPrice += Math.floor(this.client.ecoPrices.potatoes * (1 - obj.Decay.toFixed(4) / 100));
          if (obj.CropType === 'tomato') fullPrice += Math.floor(this.client.ecoPrices.tomatoes * (1 - obj.Decay.toFixed(4) / 100));
        });

        if (balance.Items.Trout) fullPrice += Number(balance.Items.Trout) * this.client.ecoPrices.trout;
        if (balance.Items.KingSalmon) fullPrice += Number(balance.Items.KingSalmon) * this.client.ecoPrices.kingSalmon;
        if (balance.Items.SwordFish) fullPrice += Number(balance.Items.SwordFish) * this.client.ecoPrices.swordfish;
        if (balance.Items.PufferFish) fullPrice += Number(balance.Items.PufferFish) * this.client.ecoPrices.pufferfish;
        if (balance.Items.Treasure) fullPrice += Number(balance.Items.Treasure) * this.client.ecoPrices.treasure;
        if (balance.Items.GoldBar) fullPrice += Number(balance.Items.GoldBar) * this.client.ecoPrices.goldBar;
        if (balance.Items.GoldNugget) fullPrice += Number(balance.Items.GoldNugget) * this.client.ecoPrices.goldNugget;

        if (balance.Items.Treasure) itemCount += Number(balance.Items.Treasure);
        if (balance.Items.Trout) itemCount += Number(balance.Items.Trout);
        if (balance.Items.KingSalmon) itemCount += Number(balance.Items.KingSalmon);
        if (balance.Items.SwordFish) itemCount += Number(balance.Items.SwordFish);
        if (balance.Items.PufferFish) itemCount += Number(balance.Items.PufferFish);
        if (balance.Items.Lettuce) itemCount += Number(balance.Items.Lettuce);
        if (balance.Items.Strawberries) itemCount += Number(balance.Items.Strawberries);
        if (balance.Items.Spinach) itemCount += Number(balance.Items.Spinach);
        if (balance.Items.Barley) itemCount += Number(balance.Items.Barley);

        if (foundHarvestList) {
          itemCount += Number(foundHarvestList.filter((key) => key.CropType === 'corn').length);
          itemCount += Number(foundHarvestList.filter((key) => key.CropType === 'wheat').length);
          itemCount += Number(foundHarvestList.filter((key) => key.CropType === 'potato').length);
          itemCount += Number(foundHarvestList.filter((key) => key.CropType === 'tomato').length);
        }

        if (balance.Items.GoldBar) itemCount += Number(balance.Items.GoldBar);
        if (balance.Items.GoldNugget) itemCount += Number(balance.Items.GoldNugget);

        const totalAdd = balance.Total + fullPrice;

        balance.Bank += fullPrice;
        balance.Total = totalAdd;
        await balance.save();

        if (balance.Items.Treasure) delete balance.Items.Treasure;
        if (balance.Items.Trout) delete balance.Items.Trout;
        if (balance.Items.KingSalmon) delete balance.Items.KingSalmon;
        if (balance.Items.SwordFish) delete balance.Items.SwordFish;
        if (balance.Items.PufferFish) delete balance.Items.PufferFish;
        if (balance.Items.GoldBar) delete balance.Items.GoldBar;
        if (balance.Items.GoldNugget) delete balance.Items.GoldNugget;
        if (balance.Items.Barley) delete balance.Items.Barley;
        if (balance.Items.Spinach) delete balance.Items.Spinach;
        if (balance.Items.Strawberries) delete balance.Items.Strawberries;
        if (balance.Items.Lettuce) delete balance.Items.Lettuce;

        balance.HarvestedCrops = null;
        balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Shop - Sell All**`,
            value: `**◎ Success:** You have sold \`${itemCount}\` Items. You have received <:coin:706659001164628008> \`${fullPrice.toLocaleString(
              'en'
            )}\`\nYour new total is: <:coin:706659001164628008> \`${totalAdd.toLocaleString('en')}\``
          });
        interaction.reply({ embeds: [embed] });
        return;
      }

      if (argsItem === 'fish') {
        if (
          balance.Items.Trout === undefined &&
          balance.Items.KingSalmon === undefined &&
          balance.Items.SwordFish === undefined &&
          balance.Items.PufferFish === undefined &&
          balance.Items.Treasure === undefined
        ) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Shop - Sell Fish**`, value: '**◎ Error:** You do not have any fish!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        let fullPrice = 0;
        let fishCount = 0;

        if (balance.Items.Trout) fullPrice += Number(balance.Items.Trout) * this.client.ecoPrices.trout;
        if (balance.Items.KingSalmon) fullPrice += Number(balance.Items.KingSalmon) * this.client.ecoPrices.kingSalmon;
        if (balance.Items.SwordFish) fullPrice += Number(balance.Items.SwordFish) * this.client.ecoPrices.swordfish;
        if (balance.Items.PufferFish) fullPrice += Number(balance.Items.PufferFish) * this.client.ecoPrices.pufferfish;

        if (balance.Items.Trout) fishCount += Number(balance.Items.Trout);
        if (balance.Items.KingSalmon) fishCount += Number(balance.Items.KingSalmon);
        if (balance.Items.SwordFish) fishCount += Number(balance.Items.SwordFish);
        if (balance.Items.PufferFish) fishCount += Number(balance.Items.PufferFish);

        const totalAdd = balance.Total + fullPrice;

        balance.Bank += fullPrice;
        balance.Total = totalAdd;
        await balance.save();

        if (balance.Items.Trout) delete balance.Items.Trout;
        if (balance.Items.KingSalmon) delete balance.Items.KingSalmon;
        if (balance.Items.SwordFish) delete balance.Items.SwordFish;
        if (balance.Items.PufferFish) delete balance.Items.PufferFish;

        balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Shop - Sell Fish**`,
            value: `**◎ Success:** You have sold \`${fishCount}\` fish. You have received <:coin:706659001164628008> \`${fullPrice.toLocaleString(
              'en'
            )}\`\nYour new total is: <:coin:706659001164628008> \`${totalAdd.toLocaleString('en')}\``
          });
        interaction.reply({ embeds: [embed] });
        return;
      }

      if (argsItem === 'treasure') {
        if (balance.Items.Treasure === undefined) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Shop - Sell Treasure**`, value: '**◎ Error:** You do not have any treasure!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        let fullPrice = 0;
        let treasureCount = 0;

        if (balance.Items.Treasure) fullPrice += Number(balance.Items.Treasure) * this.client.ecoPrices.treasure;
        if (balance.Items.GoldBar) fullPrice += Number(balance.Items.Treasure) * this.client.ecoPrices.goldBar;
        if (balance.Items.GoldNugget) fullPrice += Number(balance.Items.GoldNugget) * this.client.ecoPrices.goldNugget;

        if (balance.Items.Treasure) treasureCount += Number(balance.Items.Treasure);
        if (balance.Items.GoldBar) treasureCount += Number(balance.Items.GoldBar);
        if (balance.Items.GoldNugget) treasureCount += Number(balance.Items.GoldNugget);

        const totalAdd = balance.Total + fullPrice;

        balance.Bank += fullPrice;
        balance.Total = totalAdd;
        await balance.save();

        if (balance.Items.Treasure) delete balance.Items.Treasure;
        if (balance.Items.GoldBar) delete balance.Items.GoldBar;
        if (balance.Items.GoldNugget) delete balance.Items.GoldNugget;

        await balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Shop - Sell Treasure**`,
            value: `**◎ Success:** You have sold \`${treasureCount}\` treasure. You have received <:coin:706659001164628008> \`${fullPrice.toLocaleString(
              'en'
            )}\`\nYour new total is: <:coin:706659001164628008> \`${totalAdd.toLocaleString('en')}\``
          });
        interaction.reply({ embeds: [embed] });
        return;
      }

      if (argsItem === 'farm' || argsItem === 'crops') {
        if (
          !balance.Items.Lettuce &&
          !balance.Items.Strawberries &&
          !balance.Items.Spinach &&
          !balance.Items.Barley &&
          !foundHarvestList.filter((key) => key.CropType === 'tomato').length &&
          !foundHarvestList.filter((key) => key.CropType === 'potato').length &&
          !foundHarvestList.filter((key) => key.CropType === 'wheat').length &&
          !foundHarvestList.filter((key) => key.CropType === 'corn').length
        ) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Shop - Sell Farm**`, value: '**◎ Error:** You do not have any farming produce!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        let fullPrice = 0;
        let itemCount = 0;

        if (balance.Items.Lettuce) fullPrice += Number(balance.Items.Lettuce) * this.client.ecoPrices.lettuce;
        if (balance.Items.Strawberries) fullPrice += Number(balance.Items.Strawberries) * this.client.ecoPrices.strawberries;
        if (balance.Items.Spinach) fullPrice += Number(balance.Items.Spinach) * this.client.ecoPrices.spinach;
        if (balance.Items.Barley) fullPrice += Number(balance.Items.Barley) * this.client.ecoPrices.barley;

        foundHarvestList.forEach((obj) => {
          if (obj.CropType === 'corn') fullPrice += Math.floor(this.client.ecoPrices.corn * (1 - obj.Decay.toFixed(4) / 100));
          if (obj.CropType === 'wheat') fullPrice += Math.floor(this.client.ecoPrices.wheat * (1 - obj.Decay.toFixed(4) / 100));
          if (obj.CropType === 'potato') fullPrice += Math.floor(this.client.ecoPrices.potatoes * (1 - obj.Decay.toFixed(4) / 100));
          if (obj.CropType === 'tomato') fullPrice += Math.floor(this.client.ecoPrices.tomatoes * (1 - obj.Decay.toFixed(4) / 100));
        });

        if (balance.Items.Lettuce) itemCount += Number(balance.Items.Lettuce);
        if (balance.Items.Strawberries) itemCount += Number(balance.Items.Strawberries);
        if (balance.Items.Spinach) itemCount += Number(balance.Items.Spinach);
        if (balance.Items.Barley) itemCount += Number(balance.Items.Barley);

        if (foundHarvestList) {
          itemCount += Number(foundHarvestList.filter((key) => key.CropType === 'corn').length);
          itemCount += Number(foundHarvestList.filter((key) => key.CropType === 'wheat').length);
          itemCount += Number(foundHarvestList.filter((key) => key.CropType === 'potato').length);
          itemCount += Number(foundHarvestList.filter((key) => key.CropType === 'tomato').length);
        }

        const totalAdd = balance.Total + fullPrice;

        balance.Bank += fullPrice;
        balance.Total = totalAdd;
        await balance.save();

        if (balance.Items.Barley) delete balance.Items.Barley;
        if (balance.Items.Spinach) delete balance.Items.Spinach;
        if (balance.Items.Strawberries) delete balance.Items.Strawberries;
        if (balance.Items.Lettuce) delete balance.Items.Lettuce;

        balance.HarvestedCrops = null;
        await balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Shop - Sell Farm**`,
            value: `**◎ Success:** You have sold \`${itemCount}\` farm products. You have received <:coin:706659001164628008> \`${fullPrice.toLocaleString(
              'en'
            )}\`\nYour new total is: <:coin:706659001164628008> \`${totalAdd.toLocaleString('en')}\``
          });
        interaction.reply({ embeds: [embed] });
      }
    }
  }
};

export default SlashCommandF;
