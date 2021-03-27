/**
 * Team representation.
 */
class Team {
	constructor() {
		
		this.id = undefined;
		this.name = undefined;
		this.ranking = undefined;
		
		this.league = new League();
		
		this.squadPlayers = [];
		
		this.youthPlayers = [];
	}

	getSquadPlayer (id) {
		
		let idx = this.squadPlayers.findIndex(squadPlayer => squadPlayer.id === id);
		if (idx >= 0) {
			let player = Object.assign(new SquadPlayer(), this.squadPlayers[idx]);
			this.squadPlayers[idx] = player;
			return player;
		}
		
		let player = new SquadPlayer();
		player.id = id;
		this.squadPlayers.push(player);
		return player;
	}

	getStorageData () {
		
		let storageData = {};
		storageData.players = [];
		
		this.squadPlayers.forEach((player,p) => {
			storageData.players[p] = {};
			storageData.players[p].id = player.id;
			storageData.players[p].birthday = player.birthday;
		});
		
		return storageData;
	}

	applyStorageData (data) {
		
		if (data && data.players) {
			data.players.forEach(player => {
				let foundPlayer = this.getSquadPlayer(player.id);
				Object.assign(foundPlayer, player);
			});
		}
	}
		
}
