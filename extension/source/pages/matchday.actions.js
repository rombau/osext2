
Page.MatchDayActions = class extends Page {

	constructor() {

		super('ZA-Aktionen', 'zugabgabe.php', new Page.Param('p', 1));

	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		Array.from(doc.querySelectorAll('input[type=radio]')).forEach(radio => {

			let matches = /Immer : Einwechslung von (.+) für (.+) in der \d+\. Minute auf Kartenposition/gm.exec(radio.parentElement.nextElementSibling.textContent);

			for (let m = 1; matches && m < matches.length; m++) {
				let player = data.team.squadPlayers.find(player => player.name === matches[m]);
				if (player) {
					player.nextTraining = player.nextTraining || new SquadPlayer.Training();
					player.nextTraining.matchBonus = 1.25;
				}
			}
		});	
	}
}
