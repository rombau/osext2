
/**
 * Logger implementation.
 */
class Logger {

	/**
	 * @param {String} className the class this logger is related
	 */
	constructor (className) {
		
		let msgTemplate = '[' + className + '] %s';

		/**
		 * Prints to console (type LOG).
		 * 
		 * @param {String} message the log message
		 * @param {ExtensionData} data the data to log
		 */
		this.log = Options.logLevel <= LogLevel.LOG ? console.log.bind(console, msgTemplate + ': %o') : () => {};

		/**
		 * Prints to console (type INFO).
		 * 
		 * @param {String} message the log message
		 */
		this.info = Options.logLevel <= LogLevel.INFO ? console.info.bind(console, msgTemplate) : () => {};

		/**
		 * Prints to console (type WARN).
		 * 
		 * @param {String} message the log message
		 */
		this.warn = Options.logLevel <= LogLevel.WARN ? console.warn.bind(console, msgTemplate) : () => {};

		/**
		 * Prints to console (type ERROR).
		 * 
		 * @param {Error} error the error to log
		 */
		this.error = Options.logLevel <= LogLevel.ERROR ? console.error.bind(console) : () => {};

	}

	/**
	 * Prepares the extension data for logging.
	 * 
	 * @param {ExtensionData} data the data to log
	 * @returns {any}
	 */
	static prepare (data) {
		if (!data) return 'no data';
		else if (data instanceof ExtensionData && Options.logDataElement) {
			Options.logDataElement.split('.').forEach(attr => {
				data = data[attr];
			});
			return data;
		}
		return data;
	}
}
