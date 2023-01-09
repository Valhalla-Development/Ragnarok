/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import path from 'path';
import { promisify } from 'util';
import { PermissionsBitField, REST, Routes } from 'discord.js';
import glob from 'glob';
import url from 'url';
import mongoose from 'mongoose';
import Event from './Event.js';
import SlashCommand from './SlashCommand.js';
import RagnarokDashboard from './RagnarokDashboard.js';

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
      arr.splice(maxLen, arr.length - maxLen, ` ${arr.length - maxLen} more...`);
    }
    return arr;
  }

  removeDuplicates(arr) {
    if (!Array.isArray(arr)) {
      throw new TypeError('Expected an array as input');
    }
    return new Set(arr);
  }

  capitalise(string) {
    return string.replace(/\S+/g, (word) => word.slice(0, 1).toUpperCase() + word.slice(1));
  }

  color(me) {
    if (typeof me === 'string' && me.toLowerCase() === '#000000') {
      return '#A10000';
    }
    return me;
  }

  async messageDelete(message, time) {
    if (message.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      setTimeout(async () => {
        try {
          if (message && message.deletable) {
            await message.delete();
          }
        } catch {
          // Do nothing
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
      .replace(/_(?=\S)/g, (match) => match.toUpperCase())
      .replace(/_/g, ' ')
      .replace(/Guild/g, 'Server')
      .replace(/Use Vad/g, 'Use Voice Activity');
  }

  checkOwner(target) {
    return this.client.owners.includes(target);
  }

  async loadSlashCommands() {
    const ownerOnlyCommands = [];
    const regularCommands = [];

    return globPromise(`${this.directory}SlashCommands/**/*.js`).then(async (commands) => {
      for (const commandFile of commands) {
        const { name } = path.parse(commandFile);
        const { default: File } = await import(commandFile);
        if (!this.isClass(File)) throw new TypeError(`Slash Command ${name} doesn't export a class!`);
        const command = new File(this.client, name.toLowerCase());
        if (!(command instanceof SlashCommand)) throw new TypeError(`Slash Command ${name} doesn't belong in the Commands directory.`);
        this.client.slashCommands.set(command.name, command);

        if (command.ownerOnly) {
          ownerOnlyCommands.push({
            name: command.name,
            type: command.type ? command.type : 1,
            description: command.description ? command.description : 'No description provided.',
            category: command.category,
            ownerOnly: command.ownerOnly ? command.ownerOnly : null,
            options: command.options ? command.options.options : null,
            userPerms: command.userPerms ? command.userPerms : null,
            botPerms: command.botPerms ? command.botPerms : null
          });
        } else {
          regularCommands.push({
            name: command.name,
            type: command.type ? command.type : 1,
            description: command.description ? command.description : 'No description provided.',
            category: command.category,
            ownerOnly: command.ownerOnly ? command.ownerOnly : null,
            options: command.options ? command.options.options : null,
            userPerms: command.userPerms ? command.userPerms : null,
            botPerms: command.botPerms ? command.botPerms : null
          });
        }
      }

      const rest = new REST({ version: '10' }).setToken(this.client.token);

      const isSupportGuild = this.client.config.APPLICATION_ID === '509122286561787904';
      if (isSupportGuild) {
        const allCommands = [...ownerOnlyCommands, ...regularCommands];
        await rest.put(Routes.applicationGuildCommands(this.client.config.APPLICATION_ID, this.client.config.SUPPORT_GUILD), { body: allCommands });
        console.log(
          `\u001b[37m\u001b[1mLoaded\u001b[22m \u001b[31m\u001b[1m${
            ownerOnlyCommands.length + regularCommands.length
          }\u001b[22m \u001b[37m\u001b[1mSlash commands!\u001b[22m`
        );
      } else {
        if (ownerOnlyCommands) {
          await rest.put(Routes.applicationGuildCommands(this.client.config.APPLICATION_ID, this.client.config.SUPPORT_GUILD), {
            body: ownerOnlyCommands
          });
          console.log(
            `\u001b[37m\u001b[1mLoaded\u001b[22m \u001b[31m\u001b[1m${ownerOnlyCommands.length}\u001b[22m \u001b[37m\u001b[1mOwner Only Slash commands!\u001b[22m`
          );
        }

        if (regularCommands) {
          await rest.put(Routes.applicationCommands(this.client.config.APPLICATION_ID), { body: regularCommands });
          console.log(
            `\u001b[37m\u001b[1mLoaded\u001b[22m \u001b[31m\u001b[1m${regularCommands.length}\u001b[22m \u001b[37m\u001b[1mSlash commands!\u001b[22m`
          );
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

  async loadMongoEvents() {
    (async () => {
      await mongoose.connect(this.client.config.DATABASE_TOKEN).catch(console.error);
    })();

    return globPromise(`${this.directory}Mongo/MongoEvents/*.js`).then(async (events) => {
      for (const eventFile of events) {
        const File = await import(eventFile);
        const fileDefault = File.default;
        const { once } = fileDefault;
        if (once) {
          mongoose.connection.once(fileDefault.name, (...args) => fileDefault.run(...args, this.client));
        } else {
          mongoose.connection.on(fileDefault.name, (...args) => fileDefault.run(...args, this.client));
        }
      }
    });
  }

  // Dashboard
  async loadDashboard() {
    const dashboard = new RagnarokDashboard(this.client);
    dashboard.dashboard(this.client);
  }
};

export default Util;
