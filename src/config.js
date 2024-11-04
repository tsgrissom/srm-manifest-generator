import fs from 'node:fs';
import yaml from 'yaml';

// TODO: If example is missing, download it from GitHub
const exampleConfig = await fs.promises.readFile('./config/examples/example.config.yml', 'utf8');
const exampleConfigData = yaml.parse(exampleConfig);

const userConfig = await fs.promises.readFile('./config/config.yml', 'utf8');
const userConfigData = yaml.parse(userConfig);



const config = userConfigData;

export default config;