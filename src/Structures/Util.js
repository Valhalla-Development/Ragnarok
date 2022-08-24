/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import path from 'path';
import { promisify } from 'util';
import { PermissionsBitField, REST, Routes } from 'discord.js';
import glob from 'glob';
import url from 'url';
import chalk from 'chalk';
import Command from './Command.js';
import Event from './Event.js';
import SlashCommand from './SlashCommand.js';

const globPromise = promisify(glob);

export const Util = class Util {
  constructor(client) {
    this.client = client;
  }

  isClass(input) {
    return typeof input === 'function' && typeof input.prototype === 'object' && input.toString().substring(0, 5) === 'class';
  }

  get directory() {
    return url.fileURLToPath(new URL('..', import.meta.url));
  }

  trimArray(arr, maxLen) {
    if (arr.length > maxLen) {
      const len = arr.length - maxLen;
      arr = arr.slice(0, maxLen);
      arr.push(` ${len} more...`);
    }
    return arr;
  }

  removeDuplicates(arr) {
    return [...new Set(arr)];
  }

  capitalise(string) {
    return string
      .split(' ')
      .map((str) => str.slice(0, 1).toUpperCase() + str.slice(1))
      .join(' ');
  }

  color(me) {
    let color;
    if (me === '#000000') {
      color = '#A10000';
    } else {
      color = me;
    }
    return color;
  }

  messageDelete(message, time) {
    if (message.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      setTimeout(() => {
        if (message && message.deletable) {
          message.delete();
        }
      }, time);
    }
  }

  deletableCheck(message, time) {
    setTimeout(() => {
      if (message && message.deletable) {
        message.delete();
      }
    }, time);
  }

  formatPerms(perms) {
    return perms
      .toLowerCase()
      .replace(/(^|"|_)(\S)/g, (s) => s.toUpperCase())
      .replace(/_/g, ' ')
      .replace(/Guild/g, 'Server')
      .replace(/Use Vad/g, 'Use Voice Activity');
  }

  formatArray(array, type = 'conjunction') {
    return new Intl.ListFormat('en-GB', { style: 'short', type }).format(array);
  }

  checkOwner(target) {
    return this.client.owners.includes(target);
  }

  async loadSlashCommands() {
    const testingCmds = [];
    const cmds = [];

    return globPromise(`${this.directory}SlashCommands/**/*.js`).then(async (commands) => {
      for (const commandFile of commands) {
        const { name } = path.parse(commandFile);
        const { default: File } = await import(commandFile);
        if (!this.isClass(File)) throw new TypeError(`Slash Command ${name} doesn't export a class!`);
        const command = new File(this.client, name.toLowerCase());
        if (!(command instanceof SlashCommand)) throw new TypeError(`Slash Command ${name} doesn't belong in the Commands directory.`);
        this.client.slashCommands.set(command.name, command);

        if (command.ownerOnly) {
          testingCmds.push({
            name: command.name,
            type: command.type ? command.type : 1,
            description: command.description ? command.description : 'No description provided.',
            category: command.category,
            ownerOnly: command.ownerOnly ? command.ownerOnly : null,
            options: command.options ? command.options.options : null,
            usage: command.usage,
            userPerms: command.userPerms ? command.userPerms : null,
            botPerms: command.botPerms ? command.botPerms : null
          });
        } else {
          cmds.push({
            name: command.name,
            type: command.type ? command.type : 1,
            description: command.description ? command.description : 'No description provided.',
            category: command.category,
            ownerOnly: command.ownerOnly ? command.ownerOnly : null,
            options: command.options ? command.options.options : null,
            usage: command.usage,
            userPerms: command.userPerms ? command.userPerms : null,
            botPerms: command.botPerms ? command.botPerms : null
          });
        }
      }

      const rest = new REST({ version: '10' }).setToken(this.client.token);

      (async () => {
        try {
          if (testingCmds) {
            await rest.put(Routes.applicationGuildCommands('509122286561787904', this.client.config.supportGuild), { body: testingCmds });
            console.log(
              `${chalk.whiteBright('Loaded')} ${chalk.red.bold(`${testingCmds.length}`)} ${chalk.whiteBright('Owner Only Slash commands!')}`
            );
          }

          if (cmds) {
            await rest.put(Routes.applicationCommands('509122286561787904'), { body: cmds });
            console.log(`${chalk.whiteBright('Loaded')} ${chalk.red.bold(`${cmds.length}`)} ${chalk.whiteBright('Slash commands!')}`);
          }
        } catch (err) {
          console.log(err);
        }
      })();
    });
  }

  async loadCommands() {
    return globPromise(`${this.directory}Commands/**/*.js`).then(async (commands) => {
      for (const commandFile of commands) {
        const { name } = path.parse(commandFile);
        const { default: File } = await import(commandFile);
        if (!this.isClass(File)) throw new TypeError(`Command ${name} doesn't export a class!`);
        const command = new File(this.client, name.toLowerCase());
        if (!(command instanceof Command)) throw new TypeError(`Command ${name} doesn't belong in the Commands directory.`);
        this.client.commands.set(command.name, command);
        if (command.aliases.length) {
          for (const alias of command.aliases) {
            this.client.aliases.set(alias, command.name);
          }
        }
      }
    });
  }

  async loadEvents() {
    return globPromise(`${this.directory}Events/**/*.js`).then(async (events) => {
      for (const eventFile of events) {
        const { name } = path.parse(eventFile);
        const { default: File } = await import(eventFile);
        if (!this.isClass(File)) throw new TypeError(`Event ${name} doesn't export a class!`);
        const event = new File(this.client, name);
        if (!(event instanceof Event)) throw new TypeError(`Event ${name} doesn't belong in the Events directory.`);
        this.client.events.set(event.name, event);
        event.emitter[event.type](name, (...args) => event.run(...args));
      }
    });
  }

  async loadFunctions() {
    this.client.functions = {};
    return globPromise(`${this.directory}Functions/*.js`).then(async (functions) => {
      functions.forEach(async (m) => {
        const { default: File } = await import(m);
        this.client.functions[File.name] = new File(this)[File.name];
      });
    });
  }
};

export default Util;
