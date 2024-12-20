// TODO Benchmark is it faster to store four string values: trueLowerStr trueUpperStr falseLowerStr and falseUpperStr or current?
interface BoolFmtOptions {
	/** Whether the formatted boolean should be color-coded */
	color: boolean;
	/** Whether the boolean value-dependent string should have its first letter capitalized */
	capitalize: boolean;
	/** The string to use if a given boolean is true */
	trueStr: string;
	/** The string to use if a given boolean is false */
	falseStr: string;
}

export default BoolFmtOptions;
