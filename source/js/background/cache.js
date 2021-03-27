/**
 * The extension cache.
 */
const Cache = {
	
	/**
	 * The data object holds all the team information across page navigations.
	 */
	data : {},
	
	/**
	 * The listener method called when a runtime message is sent.
	 */
	handleMessage (message, sender, callback = () => null) {
		if (message.data) {
			Cache.data = message.data;
		}
		callback(Cache.data);
	}
};

chrome.runtime.onMessage.addListener(Cache.handleMessage);