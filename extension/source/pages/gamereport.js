
Page.GameReport = class extends Page {

	/**
	 * @param {Number} season
	 * @param {Number} zat
	 * @param {Number} homeTeamId
	 * @param {Number} awayTeamId
	 */
	constructor(season, zat, homeTeamId, awayTeamId) {

		super('Spielbericht', 'rep/saison/{season}/{zat}/{homeTeamId}-{awayTeamId}.html',
			new Page.Param('{season}', season),
			new Page.Param('{zat}', zat),
			new Page.Param('{homeTeamId}', homeTeamId),
			new Page.Param('{awayTeamId}', awayTeamId));

	}
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract (doc, data) {

		let season = +this.params[0].value;
		let zat = +this.params[1].value;
		let homeTeamId = +this.params[2].value;
		let awayTeamId = +this.params[3].value;

		if (homeTeamId === data.team.id) {

			let matches = /Datum\s+:\s+\d+\.\d+\.\d+\s+Stadion\s+:\s+Stadion\s+von.+\s+Spielart\s+:\s+.+Zuschaueranzahl\s*:\s+(\d+\.?\d+)/gm.exec(doc.body.textContent);
			if (matches) {
				data.team.getMatchDay(season, zat).stadiumVisitors = +matches[1].replaceAll('.', '');
			}
		}
	}
}


