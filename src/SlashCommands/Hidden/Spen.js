import fs from 'fs';
import fetch from 'node-fetch';
import SlashCommand from '../../Structures/SlashCommand.js';

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Create array from list',
      category: 'Hidden',
      ownerOnly: true
    });
  }

  async run() {
    fetch('https://raw.githubusercontent.com/PyAres/scam-links/master/src/links.txt')
      .then((res) => res.text())
      .then((list) => {
        const array = list
          .split('\n')
          .map((str) => str.trim())
          .filter(Boolean);
        fs.writeFile('storage/spenLinks.json', JSON.stringify(array, null, 2), { flag: 'w' }, (err) => {
          if (err) throw err;
          console.log('The file has been saved!');
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }
};

export default SlashCommandF;
