/**
 * The extension cache.
 */
const DataCache = {
	
	/** 
	 * the data object caches all information across page navigations 
	 */
	data : {},

	/**
	 * listener method called when a runtime message is sent
	 */
	handleMessage (message, _sender, callback) {
		if (message.data) {
			DataCache.data = message.data;
		}
		callback(DataCache.data);
	}
};

/**
 * registering listener method.
 */
chrome.runtime.onMessage.addListener(DataCache.handleMessage);