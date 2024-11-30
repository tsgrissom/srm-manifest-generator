import path from 'path';
import tmp from 'tmp';

const clog = (str) => console.log(str)
const __dirname = import.meta.url;

clog(`dirname=${__dirname}`)
clog(`dirname..=${path.join(__dirname, '..')}`)
clog(`dirname../=${path.join(__dirname, '../')}`)
clog(`dirname...=${path.join(__dirname, '...')}`)