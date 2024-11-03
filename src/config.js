import fs from 'node:fs';
import yaml from 'yaml';

const userConfig = await fs.promises.readFile('./config/config.yml', 'utf8');
const userConfigData = yaml.parse(userConfig);

const config = userConfigData;

export default config;