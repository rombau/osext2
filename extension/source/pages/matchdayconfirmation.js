
Page.MatchDayConfirmation = class extends Page {

	constructor () {

		if (arguments.length === 0) {
			super('Zugabgabe', 'checkza.php');
		} else {
			super(arguments[0], arguments[1]); // MatchDayConfirmationNew
		}

	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract (doc, data) {

		let tables = doc.getElementsByTagName('table');

		data.team.squadPlayers.forEach(player => {
			if (player.nextTraining) player.nextTraining.matchBonus = 1;
		});

		if (tables && tables.length >= 2) {

			Array.from(tables[0].rows).forEach(row => {
				if (row.cells.length >= 3) {
					let player = data.team.squadPlayers.find(player => player.name === row.cells[2].textContent.trim());
					if (player) {
						player.nextTraining = player.nextTraining || new SquadPlayer.Training();
						player.nextTraining.matchBonus = (row.cells[0].textContent >= 'U' ? 1.1 : 1.35);
					}
				}
			});

			Array.from(tables[1].rows).forEach(row => {
				if (row.cells.length === 2) {
					let matches = /Einwechslung von (.+) für (.+) (in der (\d+)\. Minute|auf Kartenposition) .+ Abhängigkeit: Immer.*/gm.exec(row.cells[1].textContent.trim());
					for (let m = 1; matches && m < matches.length; m++) {
						let player = data.team.squadPlayers.find(player => player.name === matches[m]);
						if (player) {
							player.nextTraining = player.nextTraining || new SquadPlayer.Training();
							player.nextTraining.matchBonus = 1.25;
						}
					}
				}
			});
		}
	}
}
