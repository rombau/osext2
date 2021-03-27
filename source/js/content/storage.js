class Storage {
	
	static getData (callback) {
		chrome.runtime.sendMessage({}, data => {
			if (data.currentTeamName && !data.restored) {
				chrome.storage.local.get(data.currentTeamName, stored => {
					data.team = Object.assign(new Team(), data.team);
					data.team.applyStorageData(stored[data.currentTeamName]);
					data.restored = true;
					callback(data);
				});
			} else {
				callback(data);
			}
		});
	}

	static setData (data, callback) {
		chrome.runtime.sendMessage({data}, callback);
	}

	static persist (data, callback) {
		if (data.currentTeamName) {
			let dataToPersist = {[data.currentTeamName]: Object.assign(new Team(), data.team).getStorageData()};
			chrome.storage.local.set(dataToPersist, () => {
				callback();
			});
		} else {
			console.warn(`No current team to persist data`);
		}
	}
}
