/**
 * Enum for log level.
 * @readonly
 */
const LogLevel = Object.freeze({
	LOG: 1,
	INFO: 2,
	WARN: 3,
	ERROR: 4
});

/**
 * Logger implementation.
 */
class Logger {

	/**
	 * @param {String} className the class this logger is related
	 */
	constructor (className) {
		
		/** @type {String} the class this logger is related */ 
		this.className = '[' + className + '] ';
	}

	/**
	 * Prints to console (type LOG).
	 * 
	 * @param {String} message the log message
	 * @param {ExtensionData} data the data to log
	 */
	log (message, data) {
		if (Options.logLevel <= LogLevel.LOG) {
			console.log(this.className + message, this.prepareData(data));
		}
	}
	
	/**
	 * Prints to console (type INFO).
	 * 
	 * @param {String} message the log message
	 * @param {ExtensionData} data the data to log
	 */
	info (message, data) {
		if (Options.logLevel <= LogLevel.INFO) {
			console.info(this.className + message, this.prepareData(data));
		}
	}

	/**
	 * Prints to console (type WARN).
	 * 
	 * @param {String} message the log message
	 * @param {ExtensionData} data the data to log
	 */
	warn (message, data) {
		if (Options.logLevel <= LogLevel.WARN) {
			console.warn(this.className + message, this.prepareData(data));
		}
	}

	/**
	 * Prints to console (type ERROR).
	 * 
	 * @param {Error} error the error to log
	 */
	error (error) {
		if (Options.logLevel <= LogLevel.ERROR) {
			console.error(error);
		}
	}

	/**
	 * Prepares the extension data for logging.
	 * 
	 * @param {ExtensionData} data the data to log
	 * @returns {any}
	 */
	prepareData (data) {
		if (!data) return 'no data';
		else if (data instanceof ExtensionData && Options.logDataElement) {
			return data[Options.logDataElement] || data;
		}
		return data;
	}
}
