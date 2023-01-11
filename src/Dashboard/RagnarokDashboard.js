/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-named-as-default-member */
import DBD from 'discord-dashboard';
import { promisify } from 'util';
import glob from 'glob';
import url from 'url';
import MongoStore from 'connect-mongo';
import ThemeConfig from './Config/ThemeConfig.js';

const globPromise = promisify(glob);

export const RagnarokDashboard = class RagnarokDashboard {
  constructor(client) {
    this.client = client;
  }

  async dashboard(client) {
    async function loadCommands(cl) {
      const directory = url.fileURLToPath(new URL('..', import.meta.url));
      const settings = [];
      return globPromise(`${directory}DashboardCommands/*.js`).then(async (cmds) => {
        for (const cmdFile of cmds) {
          const File = await import(cmdFile);
          settings.push(File.default(cl));
        }
        return settings;
      });
    }

    const categoryDesc = {
      Economy: 'Experience a fully-featured, custom-built economy with features such as crop cultivation, theft, and games.',
      Fun: 'Discover a wide range of fun and useful commands, including calculators, cryptocurrency tools, Trakt integration, and more.',
      Informative: 'Our collection of commands includes features to help you track your usage statistics and gather information about yourself.',
      Moderation: 'Easily moderate your community with commands such as ban, kick, and poll, among other useful options.'
    };

    const commands = [];

    client.slashCommands.forEach((command) => {
      if (command.ownerOnly || command.category === 'Hidden') {
        return;
      }

      let commandCategory;
      // Check if the command already exists in the commands array
      const existingCommandCategory = commands.find((c) => c.category === command.category);
      if (existingCommandCategory) {
        // If it does, get the category object from the commands array
        commandCategory = existingCommandCategory;
      } else {
        const { category } = command;
        const description = categoryDesc[category];

        // If it doesn't, create a new category object
        commandCategory = {
          category,
          categoryId: category.toLowerCase(),
          hideAlias: true,
          subTitle: description,
          list: []
        };
        // Add the new category object to the commands array
        commands.push(commandCategory);
      }

      const arr = [];
      let usage = '';
      if (command?.options?.options) {
        command.options.options.forEach((cmd, index) => {
          usage += cmd.name;
          if (index < command.options.options.length - 1) {
            usage += ' | ';
          }
        });
        arr.push({
          name: command.name,
          usage
        });
      }

      const commandUsage = arr.find((obj) => obj.name === command.name)?.usage || '';

      // Add the command to the list of the appropriate category
      commandCategory.list.push({
        commandName: command.name,
        commandUsage,
        commandDescription: command.description
      });
    });

    await DBD.useLicense(client.config.DBD_LICENSE);
    DBD.Dashboard = DBD.UpdatedClass();

    const Dashboard = new DBD.Dashboard({
      acceptPrivacyPolicy: true,
      useCategorySet: true,
      sessionSaveSession: MongoStore.create({
        mongoUrl: client.config.DBD_DATABASE
      }),
      minimizedConsoleLogs: true,
      invite: {
        clientId: client.config.DISCORD_CLIENT_ID,
        scopes: ['bot'],
        permissions: 415306870006,
        redirectUri: client.config.DBD_REDIRECT_URI
        // otherParams: (String = '')
      },
      supportServer: {
        slash: '/support-server',
        inviteUrl: 'https://discord.gg/Q3ZhdRJ'
      },
      port: client.config.DBD_PORT,
      client: {
        id: client.config.DISCORD_CLIENT_ID,
        secret: client.config.DISCORD_CLIENT_SECRET
      },
      redirectUri: `${client.config.DBD_DOMAIN}${client.config.DBD_REDIRECT_URI}`,
      domain: client.config.DBD_DOMAIN,
      ownerIDs: client.config.DBD_OWNER_IDS,
      bot: client,
      useTheme404: true,
      // START OF MAINTENANCE
      useUnderMaintenance: true,
      useThemeMaintenance: true,
      underMaintenance: {
        title: 'Under Maintenance',
        contentTitle: 'This page is under maintenance',
        texts: [
          'We still want to change for the better for you.',
          'Therefore, we are introducing technical updates so that we can allow you to enjoy the quality of our services.',
          'Come back to us later or join our <a href="https://discord.gg/Q3ZhdRJ">Discord Support Server</a>'
        ],

        // "Must contain 3 cards. All fields are optional - If card not wanted on maintenance page, infoCards can be deleted",
        infoCards: [
          {
            title: client.slashCommands.size.toLocaleString('en'),
            subtitle: 'Commands'
            // description: `Ragnarok is constantly expanding, there are currently ${client.slashCommands.size.toLocaleString('en')} commands!`
          },
          {
            title: client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en'),
            subtitle: 'Users'
            // description: `Ragnarok serves ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')} users!`
          },
          {
            title: client.guilds.cache.size.toLocaleString('en'),
            subtitle: 'Guilds'
            // description: `Ragnarok is currently serving ${client.guilds.cache.size.toLocaleString('en')} guilds!`
          }
        ]
      },
      // END OF MAINTENANCE
      theme: await ThemeConfig(client),
      settings: await loadCommands(client)
    });
    Dashboard.init();
  }
};

export default RagnarokDashboard;
