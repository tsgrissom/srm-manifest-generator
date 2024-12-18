import FindProcessCommand from './FindProcessCommand';

interface FindProcessOptions {
	supportedPlatforms: string[];
	settings: Record<string, FindProcessCommand>;
}

export default FindProcessOptions;