/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
import DBD from 'discord-dashboard';
import si from 'systeminformation';
import FileStore from 'session-file-store';
import session from 'express-session';
import DarkDashboard from 'dbd-dark-dashboard';
import { promisify } from 'util';
import glob from 'glob';
import url from 'url';
import * as packageFile from '../../package.json' assert { type: 'json' };
const { version } = packageFile.default;

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

    const filestorage = FileStore(session);
    const Handler = new DBD.Handler();
    // console.log(await Handler.fetch('495602800802398212', 'birthday'));

    // Stats
    async function cpuUsage() {
      const load = await si.currentLoad();
      return `${load.currentLoadUser.toFixed(1)}%`;
    }

    async function memUsage() {
      const memory = await si.mem();
      const totalMemory = Math.floor(memory.total / 1024 / 1024);
      const cachedMem = memory.buffcache / 1024 / 1024;
      const memoryUsed = memory.used / 1024 / 1024;
      const realMemUsed = Math.floor(memoryUsed - cachedMem);
      const memPercent = (realMemUsed / totalMemory) * 100;
      return `${memPercent.toFixed(1)}%`;
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
      useCategorySet: true,
      acceptPrivacyPolicy: true,
      sessionSaveSession: new filestorage({ logFn() {} }),
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
      useThemeMaintenance: false,
      useTheme404: true,
      bot: client,
      theme: DarkDashboard({
        information: {
          createdBy: 'Ragnarok',
          websiteTitle: 'Ragnarok',
          websiteName: 'Ragnarok',
          websiteUrl: 'https://ragnarokbot.com/',
          dashboardUrl: 'https://panel.ragnarokbot.com/',
          supporteMail: 'ragnarlothbrokjr@proton.me',
          supportServer: 'https://discord.gg/Q3ZhdRJ',
          imageFavicon: 'https://ragnarokbot.com/assets/favicon.ico',
          iconURL: 'https://www.ragnarokbot.com/assets/img/logo.png',
          loggedIn: 'Successfully signed in.',
          mainColor: '#2CA8FF',
          subColor: '#ebdbdb',
          preloader: 'Loading...'
        },

        index: {
          card: {
            category: "Ragnarok's Panel - WIP",
            title:
              'This is a temp theme!<br>The theme I would prefer currently has some missing variables for my settings config.<br><br>Once it has been updated, this page will be updated.'
            // image: 'https://i.imgur.com/axnP93g.png'
            // footer: 'Footer'
          },
          information: {
            // category: 'Category',
            // title: 'Information',
            // description: `This bot and panel is currently a work in progress so contact me if you find any issues on discord.`,
            // footer: 'Footer'
          },
          feeds: {
            // category: 'Category',
            // title: 'Information',
            // description: `This bot and panel is currently a work in progress so contact me if you find any issues on discord.`,
            // footer: 'Footer'
          }
        },

        commands
      }),
      settings: await loadCommands(client)
    });
    Dashboard.init();

    function privacyPolicy() {
      const privacyPolicy = `<h1>Privacy Policy for Ragnarok</h1>

<p>At Ragnarok, accessible from <a href="https://ragnarokbot.com">https://ragnarokbot.com</a> and <a href="https://panel.ragnarokbot.com">https://panel.ragnarokbot.com</a>;
, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Ragnarok and how we use it.</p>

<p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.</p>

<h2>Log Files</h2>

<p>Ragnarok follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.</p>



<h2>Privacy Policies</h2>

<P>You may consult this list to find the Privacy Policy for each of the advertising partners of Ragnarok.</p>

<p>Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Ragnarok, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.</p>

<p>Note that Ragnarok has no access to or control over these cookies that are used by third-party advertisers.</p>

<h2>Third Party Privacy Policies</h2>

<p>Ragnarok's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options. </p>

<p>You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.</p>

<h2>Online Privacy Policy Only</h2>

<p>This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in Ragnarok. This policy is not applicable to any information collected offline or via channels other than this website.</p>

<h2>Consent</h2>

<p>By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.</p>`;
      return privacyPolicy;
    }
  }
};

export default RagnarokDashboard;
