/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
import SoftUI from 'dbd-soft-ui';
import si from 'systeminformation';
import Keyv from '@keyv/mongo';
import * as packageFile from '../../../package.json' assert { type: 'json' };

const { version } = packageFile.default;

async function ThemeConfig(client) {
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

  const config = SoftUI({
    dbdriver: new Keyv(client.config.DBD_DATABASE),
    customThemeOptions: {
      info: async ({ config }) => ({
        useUnderMaintenance: true,
        ownerIDs: [],
        blacklistIDs: [],
        premiumCard: false
      }),
      index: async ({ req, res, config }) => {
        const cards = [
          {
            title: 'Current Guilds',
            icon: 'single-02',
            getValue: client.guilds.cache.size.toLocaleString('en'),
            progressBar: {
              enabled: false,
              getProgress: 50 // 0 - 100 (get a percentage of the progress)
            }
          },
          {
            title: 'Current Users',
            icon: 'single-02',
            getValue: client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en'),
            progressBar: {
              enabled: false,
              getProgress: 50 // 0 - 100 (get a percentage of the progress)
            }
          },
          {
            title: 'CPU Usage',
            icon: 'single-copy-04',
            getValue: await cpuUsage(),
            progressBar: {
              enabled: false,
              getProgress: 50 // 0 - 100 (get a percentage of the progress)
            }
          },
          {
            title: 'RAM Usage',
            icon: 'single-copy-04',
            getValue: await memUsage(),
            progressBar: {
              enabled: false,
              getProgress: 50 // 0 - 100 (get a percentage of the progress)
            }
          }
        ];

        const graph = {
          values: [690, 524, 345, 645, 478, 592, 468, 783, 459, 230, 621, 345],
          labels: ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '10m']
        };

        return {
          cards,
          graph
        };
      }
    },
    websiteName: 'Ragnarok',
    colorScheme: 'red',
    supporteMail: 'ragnarlothbrokjr@proton.me',
    locales: {
      enUS: {
        name: 'English',
        index: {
          feeds: ['Current Users', 'Current Guilds', 'CPU Usage', 'RAM Usage'],
          card: {
            // category: 'Soft UI',
            title: 'Ragnarok - Dashboard',
            description: `<b>Please note, this is a WIP. It is not connected to any database, so any changes made will NOT take affect. An announcement will be made on the <a href="https://discord.gg/Q3ZhdRJ">support guild</a> when it is complete.</b><br><br>On November 4, 2018, I began my journey of learning how to code by creating my own Discord bot, Ragnarok. Despite having no prior experience with programming, I was determined to make my bot a success.<br>Over the years, I have put in a lot of hard work and dedication to improve my coding skills and the functionality of Ragnarok.<br><br>Today, I am proud to say that Ragnarok has reached <b>version ${version}</b> and is in a stable state, allowing me to focus on expanding its features even further.<br>It has been an amazing journey, and I am grateful for the progress and growth I have experienced along the way.`
            // footer: 'Learn More'
          },
          feedsTitle: 'Feeds',
          graphTitle: 'Graphs'
        },
        manage: {
          settings: {
            memberCount: 'Members',
            info: {
              info: 'Info',
              server: 'Server Information'
            }
          }
        },
        privacyPolicy: {
          title: 'Privacy Policy',
          description: 'Privacy Policy and Terms of Service',
          pp: privacyPolicy()
        },
        partials: {
          sidebar: {
            dash: 'Dashboard',
            manage: 'Manage Guilds',
            commands: 'Commands',
            pp: 'Privacy Policy',
            admin: 'Admin',
            account: 'Account Pages',
            login: 'Sign In',
            logout: 'Sign Out'
          },
          navbar: {
            home: 'Home',
            pages: {
              manage: 'Manage Guilds',
              settings: 'Manage Guilds',
              commands: 'Commands',
              pp: 'Privacy Policy',
              admin: 'Admin Panel',
              error: 'Error',
              credits: 'Credits',
              debug: 'Debug',
              leaderboard: 'Leaderboard',
              profile: 'Profile',
              maintenance: 'Under Maintenance'
            }
          },
          title: {
            pages: {
              manage: 'Manage Guilds',
              settings: 'Manage Guilds',
              commands: 'Commands',
              pp: 'Privacy Policy',
              admin: 'Admin Panel',
              error: 'Error',
              credits: 'Credits',
              debug: 'Debug',
              leaderboard: 'Leaderboard',
              profile: 'Profile',
              maintenance: 'Under Maintenance'
            }
          },
          preloader: {
            // text: 'Page is loading...'
          },
          premium: {
            title: 'Want more from Ragnarok?',
            description: 'Check out premium features below!',
            buttonText: 'Become Premium'
          },
          settings: {
            title: 'Site Configuration',
            description: 'Configurable Viewing Options',
            theme: {
              title: 'Site Theme',
              description: 'Make the site more appealing for your eyes!'
            },
            language: {
              title: 'Site Language',
              description: 'Select your preffered language!'
            }
          }
        }
      }
    },
    icons: {
      favicon: 'https://ragnarokbot.com/assets/favicon.ico',
      noGuildIcon: 'https://pnggrid.com/wp-content/uploads/2021/05/Discord-Logo-Circle-1024x1024.png',
      sidebar: {
        darkUrl: 'https://www.ragnarokbot.com/assets/img/logo.png',
        lightUrl: 'https://www.ragnarokbot.com/assets/img/logo.png',
        hideName: true,
        borderRadius: false,
        alignCenter: true
      }
    },
    index: {
      card: {
        category: 'Soft UI',
        title: 'Assistants - The center of everything',
        description:
          "Assistants Discord Bot management panel. Assistants Bot was created to give others the ability to do what they want. Just.<br>That's an example text.<br><br><b><i>Feel free to use HTML</i></b>",
        image: '/img/soft-ui.webp',
        link: {
          enabled: true,
          url: 'https://ragnarokbot.com/'
        }
      },
      graph: {
        enabled: false,
        lineGraph: false,
        title: 'Memory Usage',
        tag: 'Memory (MB)',
        max: 100
      }
    },
    preloader: {
      image: '/img/soft-ui.webp',
      spinner: true,
      text: 'Page is loading'
    },
    sidebar: {
      gestures: {
        disabled: false,
        gestureTimer: 200,
        gestureSensitivity: 50
      }
    },
    error: {
      error404: {
        title: 'Error 404',
        subtitle: 'Page Not Found',
        description: 'It seems you have stumbled into the abyss. Click the button below to return to the dashboard'
      },
      dbdError: {
        disableSecretMenu: false,
        secretMenuCombination: ['69', '82', '82', '79', '82']
      }
    },
    sweetalert: {
      errors: {
        requirePremium: 'You need to be a premium member to do this.'
      },
      success: {
        login: 'Successfully logged in.'
      }
    },
    admin: {
      pterodactyl: {
        enabled: false,
        apiKey: 'apiKey',
        panelLink: 'https://panel.ragnarokbot.com',
        serverUUIDs: []
      }
    },
    commands
  });

  function privacyPolicy() {
    const policy = `<h1>Privacy Policy for Ragnarok</h1>

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
    return policy;
  }

  return config;
}

export default ThemeConfig;
