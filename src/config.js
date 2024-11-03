import chalk from 'chalk';
import fs from 'node:fs';
import YAML from 'yaml';

const data = await fs.promises.readFile('./config.yml', 'utf8');
const parsed = YAML.parse(data);

console.log(chalk.bgCyan(parsed));

const config = {
    test: 'Some data'
};

export default config;