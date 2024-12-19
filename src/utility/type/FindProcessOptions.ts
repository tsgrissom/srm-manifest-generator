import FindProcessCommand from './FindProcessCommand';

interface FindProcessOptions {
	supportedPlatforms: Array<string>;
	settings: Record<string, FindProcessCommand>;
}

export default FindProcessOptions;