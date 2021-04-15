var chrome = chrome || {};

chrome.runtime = chrome.runtime || {};
chrome.runtime.sendMessage = chrome.runtime.sendMessage || (() => {});
chrome.runtime.onMessage = chrome.runtime.onMessage || {};
chrome.runtime.onMessage.addListener = chrome.runtime.onMessage.addListener || (() => {});

chrome.tabs = chrome.tabs || {};
chrome.tabs.query = chrome.tabs.query || (() => {});
chrome.tabs.sendMessage = chrome.tabs.sendMessage || (() => {});

chrome.notifications = chrome.notifications || {};
chrome.notifications.create = chrome.notifications.create || (() => {});
chrome.notifications.update = chrome.notifications.update || (() => {});
chrome.notifications.clear = chrome.notifications.clear || (() => {});

chrome.storage = chrome.storage || {};
chrome.storage.local = chrome.storage.local || {};
chrome.storage.local.get = chrome.storage.local.get || (() => {});
chrome.storage.local.set = chrome.storage.local.set || (() => {});
