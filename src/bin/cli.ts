#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import { quote } from '../utility/string-wrap.js';
import { delimitedList } from '../utility/string.js';
import startApp from '../app.js';

const CMD_LIST_CATEGORIES = ['manifests', 'shortcuts'];
const ALIASES_MANIFEST = ['manifest', 'manifests', 'man', 'source', 'sources'];
const ALIASES_SHORTCUT = ['shortcut', 'shortcuts', 'sc', 'short', 'titles', 'title', 'games', 'game', 'roms', 'rom'];

yargs(hideBin(process.argv))
  .command('list [category]', 'list things recognized by srm manifest generator', yargs => {
    return yargs
      .positional('category', {
        desc: 'the kind of things to list',
        default: 'manifests'
      });
  }, argv => {
    const { category } = argv;

    if (typeof category === 'undefined') {
        listManifests();
        return;
    }

    if (typeof category !== 'string') {
        throw new Error(`Command "list" argument "category" must be a string`);
    }

    if (ALIASES_MANIFEST.includes(category.toLowerCase())) {
        listManifests();
        return;
    }

    if (ALIASES_SHORTCUT.includes(category.toLowerCase())) {
        listShortcuts();
        return;
    }

    console.log(chalk.red(`Unknown list category: ${quote(category)}`));
    console.log(chalk.red(`Valid categories: ${delimitedList(CMD_LIST_CATEGORIES)}`));
  })
  .command('run', 'run srm manifest generator transformations', () => {}, argv => {
    startApp();
  })
  .demandCommand(1, 'You must enter at least one command')
  .parse();

function listManifests() {
    console.log(chalk.magenta(`List of manifests appears`));
}

function listShortcuts() {
    console.log(chalk.cyan(`List of shortcuts appears`));
}