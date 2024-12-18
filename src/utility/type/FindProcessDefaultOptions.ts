import FindProcessOptions from './FindProcessOptions';

const FindProcessDefaultOptions: FindProcessOptions = {
	supportedPlatforms: ['win32', 'darwin', 'linux'],
	settings: {
		win32: { command: 'tasklist', processName: 'steam.exe' },
		darwin: { command: 'ps aux | grep [S]team', processName: 'steam' },
		linux: { command: 'ps aux | grep [s]team', processName: 'steam' }
	}
};

export default FindProcessDefaultOptions;