var chrome = chrome || {};

chrome.runtime = chrome.runtime || {};
chrome.runtime.sendMessage = chrome.runtime.sendMessage || (() => {});
chrome.runtime.onMessage = chrome.runtime.onMessage || {};
chrome.runtime.onMessage.addListener = chrome.runtime.onMessage.addListener || (() => {});

chrome.storage = chrome.storage || {};
chrome.storage.local = chrome.storage.local || {};
chrome.storage.local.get = chrome.storage.local.get || ((_key, callback) => { callback(); });
chrome.storage.local.set = chrome.storage.local.set || (() => {});
chrome.storage.onChanged = chrome.storage.onChanged || {};
chrome.storage.onChanged.addListener = chrome.storage.onChanged.addListener || (() => {});